import dayjs from 'dayjs';

export const SITES = ['MTB', 'AATT'];

// Flat lookup table mirroring server-side EmployeeSection. id is the FK target.
// Order matches Insert_EmployeeSection.sql so id is stable.
export const EMPLOYEE_SECTIONS = [
  { id: 1,  sectionName: 'Process',  systemName: 'SHIFT' },
  { id: 2,  sectionName: 'Process',  systemName: 'WTS' },
  { id: 3,  sectionName: 'Process',  systemName: 'GC' },
  { id: 4,  sectionName: 'Building', systemName: 'CR' },
  { id: 5,  sectionName: 'Building', systemName: 'EXH' },
  { id: 6,  sectionName: 'Building', systemName: 'HVAC' },
  { id: 7,  sectionName: 'Building', systemName: 'PROCESS' },
  { id: 8,  sectionName: 'Building', systemName: 'EI' },
  { id: 9,  sectionName: 'Building', systemName: 'I&C' },
  { id: 10, sectionName: 'Building', systemName: 'LSS' },
  { id: 11, sectionName: 'Project',  systemName: 'TI' },
  { id: 12, sectionName: 'Project',  systemName: 'PROJECT' },
  { id: 13, sectionName: 'Project',  systemName: 'GENERAL AFFAIRS' },
];

// Subsystem applies only to specific (section, system) pairs.
// Keyed by EmployeeSectionId for direct lookup.
export const SUBSYSTEMS_BY_SECTION_ID = {
  2: ['WWT', 'UPW', 'SDW'], // Process / WTS
};

// Subsystem is always shown as a tag in the work item header (not toggleable),
// so it's intentionally excluded from admin-configurable columns.
// creatorName toggles header creator/editor name visibility (off by default).
export const ALL_COLUMNS = [
  { key: 'description', label: 'Description', required: true },
  { key: 'affected', label: 'Affected' },
  { key: 'reason', label: 'Reason' },
  { key: 'moveLoss', label: 'Move Loss' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'site', label: 'Site' },
  { key: 'creatorName', label: '建立者 / 編輯者姓名' },
];

const MOCK_USERS = [
  // Process / WTS / WWT
  { employeeId: 2,   name: '李大華', employeeSectionId: 2,  subsystem: 'WWT', role: 'user' },
  { employeeId: 21,  name: '林俊宏', employeeSectionId: 2,  subsystem: 'WWT', role: 'user' },
  // Process / WTS / UPW
  { employeeId: 7,   name: '吳淑芬', employeeSectionId: 2,  subsystem: 'UPW', role: 'user' },
  { employeeId: 22,  name: '陳婉君', employeeSectionId: 2,  subsystem: 'UPW', role: 'user' },
  // Process / WTS / SDW
  { employeeId: 12,  name: '蔡怡君', employeeSectionId: 2,  subsystem: 'SDW', role: 'admin' },
  { employeeId: 23,  name: '謝政翰', employeeSectionId: 2,  subsystem: 'SDW', role: 'user' },
  // Process / SHIFT
  { employeeId: 11,  name: '許家豪', employeeSectionId: 1,  subsystem: null,  role: 'user' },
  { employeeId: 24,  name: '黃柏豪', employeeSectionId: 1,  subsystem: null,  role: 'user' },
  // Process / GC
  { employeeId: 5,   name: '張建國', employeeSectionId: 3,  subsystem: null,  role: 'user' },
  { employeeId: 25,  name: '蘇怡如', employeeSectionId: 3,  subsystem: null,  role: 'user' },
  // Building / CR
  { employeeId: 31,  name: '羅維倫', employeeSectionId: 4,  subsystem: null,  role: 'user' },
  // Building / EXH
  { employeeId: 8,   name: '趙文龍', employeeSectionId: 5,  subsystem: null,  role: 'user' },
  { employeeId: 32,  name: '彭俊凱', employeeSectionId: 5,  subsystem: null,  role: 'user' },
  // Building / HVAC
  { employeeId: 3,   name: '陳志偉', employeeSectionId: 6,  subsystem: null,  role: 'user' },
  { employeeId: 33,  name: '楊正凱', employeeSectionId: 6,  subsystem: null,  role: 'user' },
  // Building / PROCESS
  { employeeId: 34,  name: '范文輝', employeeSectionId: 7,  subsystem: null,  role: 'user' },
  // Building / EI
  { employeeId: 1,   name: '王小明', employeeSectionId: 8,  subsystem: null,  role: 'admin' },
  { employeeId: 35,  name: '簡明智', employeeSectionId: 8,  subsystem: null,  role: 'user' },
  // Building / I&C
  { employeeId: 9,   name: '周雅琪', employeeSectionId: 9,  subsystem: null,  role: 'user' },
  { employeeId: 36,  name: '邱嘉惠', employeeSectionId: 9,  subsystem: null,  role: 'user' },
  // Building / LSS
  { employeeId: 37,  name: '潘正修', employeeSectionId: 10, subsystem: null,  role: 'user' },
  // Project / TI
  { employeeId: 15,  name: '洪振宇', employeeSectionId: 11, subsystem: null,  role: 'user' },
  { employeeId: 38,  name: '游凱翔', employeeSectionId: 11, subsystem: null,  role: 'user' },
  // Project / PROJECT
  { employeeId: 6,   name: '黃俊傑', employeeSectionId: 12, subsystem: null,  role: 'user' },
  { employeeId: 39,  name: '宋佳穎', employeeSectionId: 12, subsystem: null,  role: 'user' },
  // Project / GENERAL AFFAIRS
  { employeeId: 40,  name: '葉宛庭', employeeSectionId: 13, subsystem: null,  role: 'user' },
];

const USERS_BY_SECTION = MOCK_USERS.reduce((acc, u) => {
  if (!acc[u.employeeSectionId]) acc[u.employeeSectionId] = [];
  acc[u.employeeSectionId].push(u);
  return acc;
}, {});

const SAMPLE_DESCRIPTIONS = [
  'UPW Loop A 出水水質 TOC 短時間飆升至 25 ppb\n暫時切換 Loop B 供水\n進行 UV/TOC 設備檢查',
  'WWT Sump 5 液位異常告警，現場確認泵浦變頻器跳脫\n已重置並監控運轉電流，後續安排廠商檢修',
  'SDW Tank #3 計畫性切換清潔\n通知影響區段製程，於 03:00–06:00 完成切換並回送',
  '冰水主機 CH-2 冷凝器壓力高跳機\n切換備援主機 CH-1，安排冷凝器清洗',
  'EXH Scrubber #4 循環泵異音\n已建立工單通知廠商',
  '配電盤 PP-201 接點過熱 (紅外線檢測 78°C)\n計畫週末停電鎖固',
  '門禁系統伺服器無預警重啟兩次\n供應商遠端登入查看 log',
  'MAU-3 預熱盤管漏水\n關閉供水閥並通知 HVAC 廠商前來檢修\n預計 4 小時內復原',
  'AHU-12 變頻器顯示過載警示\n手動切到備援機組，原機等待備品到貨',
  'UPS 電池組例行性容量測試\n四組電池中有一組容量低於 80% 需汰換',
  '緊急照明測試發現三處未亮\n已更換 LED 燈組並重新測試 OK',
  'N2 系統壓力波動 5.2 → 4.8 bar\n供應商現場巡檢未發現外洩，持續監控',
  'CCTV NVR 硬碟健康度警示\n備援硬碟已下單，預計下週更換',
  'CDA Dryer 露點異常 -30°C → -10°C\n切換備援 dryer，原機已通報廠商檢修',
  'Process Cooling Water 流量降至設計值 80%\n清洗熱交換器，恢復至 95%',
  '消防警報誤觸\n區域警報誤動作，現場無火警，待消防員會勘',
  '無塵室微粒監測超標\n人員清潔不確實，已加強清潔頻次與宣導',
  '溫濕度監控異常\n感測器漂移，校正後恢復',
  '電梯定期保養\n年度檢查與保養完成，安全合格證更新',
  '製氮機備援切換演練\n切換時間 3 分鐘，無 process impact',
];

const SAMPLE_AFFECTED = ['F11 P3', 'F11 P5', 'F16 LITHO', 'F16 ETCH', 'F11 CMP', 'F16 DIFF', 'F11 IMP', 'F16 CVD', '無'];
const SAMPLE_REASONS = ['人為操作失誤', '設備老化', '計畫性維護', '廠商施工誤觸', '感測器異常', '電力品質問題', '備品到貨延遲', '原物料品質異常'];
const SAMPLE_MOVE_LOSS = ['0', '< 100 wafers', '~500 wafers', '> 1000 wafers', '評估中', '~2000 wafers'];
const SAMPLE_VENDORS = ['', '', '帆宣', '漢科', '台達', '亞翔', '台積電', '世禾', '上品', '群翊'];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickSpanDays() {
  // ~85% single-day, ~10% 2-day, ~5% 3-day
  const r = Math.random();
  if (r < 0.85) return 0;
  if (r < 0.95) return 1;
  return 2;
}

function buildMockWorkItems() {
  const items = [];
  let id = 1;
  const today = dayjs().startOf('day');
  const start = today.startOf('month').subtract(1, 'month');
  const sectionIds = EMPLOYEE_SECTIONS.map((s) => s.id);

  // Generate up to and including today; nothing after today.
  for (let d = start; d.isBefore(today) || d.isSame(today, 'day'); d = d.add(1, 'day')) {
    // Weekdays: all 13 sections active. Weekends: 8–12 sections.
    const isWeekend = d.day() === 0 || d.day() === 6;
    let activeSectionCount;
    if (isWeekend) {
      activeSectionCount = 8 + Math.floor(Math.random() * 5);
    } else {
      activeSectionCount = sectionIds.length; // all 13
    }
    const shuffledSections = [...sectionIds].sort(() => Math.random() - 0.5).slice(0, activeSectionCount);

    shuffledSections.forEach((secId) => {
      const sectionUsers = USERS_BY_SECTION[secId];
      if (!sectionUsers || sectionUsers.length === 0) return;

      // Each active section: ~all of its users post that day (1 to sectionUsers.length)
      const minPeople = Math.max(1, sectionUsers.length - 1);
      const peopleCount = minPeople + Math.floor(Math.random() * (sectionUsers.length - minPeople + 1));
      const shuffledUsers = [...sectionUsers].sort(() => Math.random() - 0.5).slice(0, peopleCount);

      shuffledUsers.forEach((author) => {
        // Each person: 2–4 work items that day
        const itemsForPerson = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < itemsForPerson; i += 1) {
          const editor = Math.random() < 0.35 ? rand(sectionUsers) : author;
          const createdAt = d
            .hour(8 + Math.floor(Math.random() * 12))
            .minute(Math.floor(Math.random() * 60))
            .toISOString();
          const updatedAt = editor === author
            ? createdAt
            : dayjs(createdAt).add(Math.floor(Math.random() * 6) + 1, 'hour').toISOString();
          const spanDays = pickSpanDays();
          // Cap end date at today — no future-dated mock data.
          let endD = d.add(spanDays, 'day');
          if (endD.isAfter(today)) endD = today;
          items.push({
            id: id++,
            site: rand(SITES),
            startDate: d.format('YYYY-MM-DD'),
            endDate: endD.format('YYYY-MM-DD'),
            description: rand(SAMPLE_DESCRIPTIONS),
            affected: rand(SAMPLE_AFFECTED),
            reason: rand(SAMPLE_REASONS),
            moveLoss: rand(SAMPLE_MOVE_LOSS),
            employeeSectionId: author.employeeSectionId,
            subsystem: author.subsystem,
            vendor: rand(SAMPLE_VENDORS),
            createdBy: { employeeId: author.employeeId, name: author.name, at: createdAt },
            lastEditedBy: { employeeId: editor.employeeId, name: editor.name, at: updatedAt },
          });
        }
      });
    });
  }
  return items;
}

export const mockWorkItems = buildMockWorkItems();
