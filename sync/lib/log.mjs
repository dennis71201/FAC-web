/**
 * 簡易 logger：輸出到 console，含時間戳與 log level
 * 實際部署到 VM 時由 PM2 log 接手轉存檔案
 */
const colors = {
  reset:  '\x1b[0m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  cyan:   '\x1b[36m',
};

function ts() {
  const d = new Date();
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

function write(level, color, msg, ...rest) {
  const line = `${colors.dim}[${ts()}]${colors.reset} ${color}${level}${colors.reset}  ${msg}`;
  console.log(line, ...rest);
}

export const log = {
  info:  (msg, ...r) => write('INFO ', colors.cyan,   msg, ...r),
  ok:    (msg, ...r) => write('OK   ', colors.green,  msg, ...r),
  warn:  (msg, ...r) => write('WARN ', colors.yellow, msg, ...r),
  error: (msg, ...r) => write('ERROR', colors.red,    msg, ...r),
  step:  (msg, ...r) => write('STEP ', colors.blue,   msg, ...r),
};
