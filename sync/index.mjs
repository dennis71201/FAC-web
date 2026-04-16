#!/usr/bin/env node
/**
 * Facilities 同步程式 CLI
 *
 * 用法：
 *   node sync/index.mjs --list                          # 列出所有 job 與狀態
 *   node sync/index.mjs --job=<name>                    # 執行單一 job
 *   node sync/index.mjs --all                           # 依序執行全部 jobs
 *   node sync/index.mjs --help                          # 說明
 *
 * 連線資訊從專案根目錄的 .env 讀取（程式不內嵌密碼）
 */
import { log } from './lib/log.mjs';
import { closeAllPools } from './lib/pools.mjs';
import { getState, listStates, markRunning, markSuccess, markFailure } from './lib/state.mjs';
import { JOBS, findJob, jobNames } from './jobs/registry.mjs';

// ---------------- 參數解析 ----------------
function parseArgs(argv) {
  const args = { help: false, list: false, all: false, job: null };
  for (const a of argv.slice(2)) {
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--list') args.list = true;
    else if (a === '--all') args.all = true;
    else if (a.startsWith('--job=')) args.job = a.substring(6);
    else {
      console.error(`未知參數: ${a}`);
      args.help = true;
    }
  }
  return args;
}

function printHelp() {
  console.log(`
Facilities 同步程式 CLI

用法:
  node sync/index.mjs --list
  node sync/index.mjs --job=<name>
  node sync/index.mjs --all
  node sync/index.mjs --help

可用的 job 名稱:
${jobNames().map(n => `  - ${n}`).join('\n')}

連線資訊從 .env 讀取：
  DB_DBA02_*   (主操作 DB)
  DB_RDS02_*   (A 廠 source)
  DB_B1SA01_*  (B 廠 source)
  DB_DBA03_*   (B 廠中繼)
`);
}

// ---------------- 顯示狀態 ----------------
async function showList() {
  const states = await listStates();
  console.log('');
  console.log('Job 名稱                        上次狀態    搬移筆數    上次完成時間          水位 (EventStamp)');
  console.log('------------------------------- ----------- ---------- --------------------- ---------------------');
  for (const s of states) {
    const name = s.job_name.padEnd(31);
    const status = (s.last_status || 'never-run').padEnd(11);
    const rows = String(s.last_rows_synced ?? '-').padStart(9);
    const finished = s.last_finished_at
      ? new Date(s.last_finished_at).toISOString().replace('T', ' ').substring(0, 19)
      : '-                  ';
    const watermark = s.last_synced_event_ts
      ? new Date(s.last_synced_event_ts).toISOString().replace('T', ' ').substring(0, 19)
      : '-';
    console.log(`${name} ${status} ${rows}  ${finished.padEnd(21)} ${watermark}`);
  }
  console.log('');
  for (const s of states) {
    if (s.last_status === 'failed' && s.last_error) {
      log.error(`${s.job_name} 上次錯誤: ${s.last_error}`);
    }
  }
}

// ---------------- 執行單一 job ----------------
async function runJob(jobModule) {
  const { jobName, run } = jobModule;
  log.step(`▶ 執行 job: ${jobName}`);

  const state = await getState(jobName);
  if (!state) {
    throw new Error(`sync_state 中找不到 job "${jobName}" 的紀錄，請先執行 database/setup.mjs`);
  }

  await markRunning(jobName);

  try {
    const result = await run({
      lastSyncedEventTs: state.last_synced_event_ts,
    });

    await markSuccess(jobName, result);
    log.ok(`✅ ${jobName} 完成，搬移 ${result.rowsSynced} 筆` +
      (result.maxEventStamp ? `，新水位 = ${new Date(result.maxEventStamp).toISOString()}` : '（無新資料）'));
    return { success: true, ...result };
  } catch (err) {
    await markFailure(jobName, err.message);
    log.error(`❌ ${jobName} 失敗: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }
    return { success: false, error: err.message };
  }
}

// ---------------- 執行全部 ----------------
async function runAll() {
  log.step(`▶ 依序執行 ${JOBS.length} 個 jobs`);
  const results = [];
  for (const job of JOBS) {
    const r = await runJob(job);
    results.push({ jobName: job.jobName, ...r });
  }

  console.log('\n===== 執行結果摘要 =====');
  for (const r of results) {
    const icon = r.success ? '✅' : '❌';
    const info = r.success
      ? `搬移 ${r.rowsSynced} 筆`
      : `失敗: ${r.error}`;
    console.log(`  ${icon} ${r.jobName.padEnd(28)} ${info}`);
  }

  const failed = results.filter(r => !r.success).length;
  if (failed > 0) {
    process.exitCode = 1;
  }
}

// ---------------- main ----------------
async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    printHelp();
    return;
  }

  if (args.list) {
    await showList();
    return;
  }

  if (args.all) {
    await runAll();
    return;
  }

  if (args.job) {
    const jobModule = findJob(args.job);
    if (!jobModule) {
      log.error(`找不到 job "${args.job}"，可用 job：${jobNames().join(', ')}`);
      process.exitCode = 1;
      return;
    }
    const r = await runJob(jobModule);
    if (!r.success) process.exitCode = 1;
    return;
  }

  printHelp();
}

main()
  .catch(err => {
    log.error(`未預期錯誤: ${err.message}`);
    console.error(err.stack);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeAllPools();
  });
