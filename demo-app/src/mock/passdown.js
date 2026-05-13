/**
 * Passdown Feature Mock Data
 * Source: DB spec Insert_*.sql templates (DB_schema_20260511.md)
 * Generates frontend-compatible fixtures from DB schema
 */

// ===== Reference Data =====

export const sites = [
  { id: 1, name: 'MTB' },
  { id: 2, name: 'TCP' },
  { id: 3, name: 'AATT' },
  { id: 4, name: 'AATT 2' },
];

/**
 * PassdownSection Hierarchy (107 rows)
 * Structure: Section > System > SubSystem
 * Seeded from Insert_PassdownSection.sql transformation rules
 */
export const passdownSections = [
  // Building Section
  { id: 1, section: 'Building', system: 'CR', subsystem: 'CR' },
  { id: 2, section: 'Building', system: 'CR', subsystem: 'MAU' },
  { id: 3, section: 'Building', system: 'CR', subsystem: 'Air shower' },
  { id: 4, section: 'Building', system: 'CR', subsystem: 'DCC' },
  { id: 5, section: 'Building', system: 'CR', subsystem: 'RCU' },
  { id: 6, section: 'Building', system: 'CR', subsystem: 'N/A' },
  { id: 7, section: 'Building', system: 'EXH', subsystem: 'GEX' },
  { id: 8, section: 'Building', system: 'EXH', subsystem: 'AEX' },
  { id: 9, section: 'Building', system: 'EXH', subsystem: 'AMX' },
  { id: 10, section: 'Building', system: 'EXH', subsystem: 'SOX' },
  { id: 11, section: 'Building', system: 'EXH', subsystem: 'EF' },
  { id: 12, section: 'Building', system: 'EXH', subsystem: 'NG' },
  { id: 13, section: 'Building', system: 'EXH', subsystem: 'N/A' },
  { id: 14, section: 'Building', system: 'HVAC', subsystem: 'CT' },
  { id: 15, section: 'Building', system: 'HVAC', subsystem: 'Chiller' },
  { id: 16, section: 'Building', system: 'HVAC', subsystem: 'Glycol' },
  { id: 17, section: 'Building', system: 'HVAC', subsystem: 'Boiler' },
  { id: 18, section: 'Building', system: 'HVAC', subsystem: 'CDA' },
  { id: 19, section: 'Building', system: 'HVAC', subsystem: 'N/A' },
  { id: 20, section: 'Building', system: 'Mech.', subsystem: 'PCW' },
  { id: 21, section: 'Building', system: 'Mech.', subsystem: 'PV' },
  { id: 22, section: 'Building', system: 'Mech.', subsystem: 'FCU' },
  { id: 23, section: 'Building', system: 'Mech.', subsystem: 'AHU' },
  { id: 24, section: 'Building', system: 'Mech.', subsystem: 'FRZ' },
  { id: 25, section: 'Building', system: 'Mech.', subsystem: 'BA' },
  { id: 26, section: 'Building', system: 'Mech.', subsystem: 'MAU' },
  { id: 27, section: 'Building', system: 'Mech.', subsystem: 'N/A' },
  { id: 28, section: 'Building', system: 'Elec.', subsystem: 'UPS' },
  { id: 29, section: 'Building', system: 'Elec.', subsystem: '生產盤' },
  { id: 30, section: 'Building', system: 'Elec.', subsystem: '高/中/低壓盤' },
  { id: 31, section: 'Building', system: 'Elec.', subsystem: '發電機' },
  { id: 32, section: 'Building', system: 'Elec.', subsystem: '照明' },
  { id: 33, section: 'Building', system: 'Elec.', subsystem: 'N/A' },
  { id: 34, section: 'Building', system: 'I&C', subsystem: 'I&C' },
  { id: 35, section: 'Building', system: 'I&C', subsystem: 'LDS' },
  { id: 36, section: 'Building', system: 'I&C', subsystem: 'N/A' },
  { id: 37, section: 'Building', system: 'LSS', subsystem: '火警系統' },
  { id: 38, section: 'Building', system: 'LSS', subsystem: 'VESDA' },
  { id: 39, section: 'Building', system: 'LSS', subsystem: 'N/A' },
  { id: 40, section: 'Building', system: 'N/A', subsystem: 'N/A' },
  // WTS Section
  { id: 41, section: 'WTS', system: 'WWT', subsystem: 'WWR' },
  { id: 42, section: 'WTS', system: 'WWT', subsystem: 'BGW' },
  { id: 43, section: 'WTS', system: 'WWT', subsystem: 'OXIDE' },
  { id: 44, section: 'WTS', system: 'WWT', subsystem: 'SAW' },
  { id: 45, section: 'WTS', system: 'WWT', subsystem: 'RCW' },
  { id: 46, section: 'WTS', system: 'WWT', subsystem: 'OAC' },
  { id: 47, section: 'WTS', system: 'WWT', subsystem: 'MMW' },
  { id: 48, section: 'WTS', system: 'WWT', subsystem: 'FWH' },
  { id: 49, section: 'WTS', system: 'WWT', subsystem: 'AWH' },
  { id: 50, section: 'WTS', system: 'WWT', subsystem: 'OWWT' },
  { id: 51, section: 'WTS', system: 'WWT', subsystem: 'EMG' },
  { id: 52, section: 'WTS', system: 'WWT', subsystem: '加藥系統' },
  { id: 53, section: 'WTS', system: 'WWT', subsystem: 'Sludge' },
  { id: 54, section: 'WTS', system: 'WWT', subsystem: 'LSR' },
  { id: 55, section: 'WTS', system: 'WWT', subsystem: 'Blower' },
  { id: 56, section: 'WTS', system: 'WWT', subsystem: '放流' },
  { id: 57, section: 'WTS', system: 'WWT', subsystem: 'N/A' },
  { id: 58, section: 'WTS', system: 'UPW', subsystem: 'MMF' },
  { id: 59, section: 'WTS', system: 'UPW', subsystem: 'ACF' },
  { id: 60, section: 'WTS', system: 'UPW', subsystem: '2B3T' },
  { id: 61, section: 'WTS', system: 'UPW', subsystem: 'RO' },
  { id: 62, section: 'WTS', system: 'UPW', subsystem: 'MB' },
  { id: 63, section: 'WTS', system: 'UPW', subsystem: 'MD' },
  { id: 64, section: 'WTS', system: 'UPW', subsystem: 'CP' },
  { id: 65, section: 'WTS', system: 'UPW', subsystem: 'UF' },
  { id: 66, section: 'WTS', system: 'UPW', subsystem: 'N/A' },
  { id: 67, section: 'WTS', system: 'SDW', subsystem: '工業水箱' },
  { id: 68, section: 'WTS', system: 'SDW', subsystem: '消防水箱' },
  { id: 69, section: 'WTS', system: 'SDW', subsystem: '民生用水' },
  { id: 70, section: 'WTS', system: 'SDW', subsystem: '化糞池' },
  { id: 71, section: 'WTS', system: 'SDW', subsystem: '沖身洗眼器' },
  { id: 72, section: 'WTS', system: 'SDW', subsystem: 'PIT' },
  { id: 73, section: 'WTS', system: 'SDW', subsystem: '回收用水' },
  { id: 74, section: 'WTS', system: 'SDW', subsystem: 'N/A' },
  // GC Section
  { id: 75, section: 'GC', system: 'GAS', subsystem: 'GD' },
  { id: 76, section: 'GC', system: 'GAS', subsystem: 'LDS' },
  { id: 77, section: 'GC', system: 'GAS', subsystem: 'CQC' },
  { id: 78, section: 'GC', system: 'GAS', subsystem: 'Purifier' },
  { id: 79, section: 'GC', system: 'GAS', subsystem: 'SG' },
  { id: 80, section: 'GC', system: 'GAS', subsystem: 'BG' },
  { id: 81, section: 'GC', system: 'Chemical', subsystem: 'CCB' },
  { id: 82, section: 'GC', system: 'Chemical', subsystem: 'CCBTU' },
  { id: 83, section: 'GC', system: 'Chemical', subsystem: 'CDU' },
  { id: 84, section: 'GC', system: 'Chemical', subsystem: 'CMDU' },
  { id: 85, section: 'GC', system: 'Chemical', subsystem: 'SLR' },
  { id: 86, section: 'GC', system: 'Chemical', subsystem: 'W-Glue' },
  { id: 87, section: 'GC', system: 'Chemical', subsystem: 'VMB' },
  { id: 88, section: 'GC', system: 'Chemical', subsystem: 'N/A' },
  // Project Section
  { id: 89, section: 'Project', system: 'Project', subsystem: 'Project' },
  { id: 90, section: 'Project', system: 'Project', subsystem: 'N/A' },
  { id: 91, section: 'Project', system: 'Hook up', subsystem: 'Hook up' },
  { id: 92, section: 'Project', system: 'Hook up', subsystem: 'N/A' },
  { id: 93, section: 'Project', system: 'Site serve', subsystem: 'Site serve' },
  { id: 94, section: 'Project', system: 'Site serve', subsystem: 'N/A' },
  // External Impact Section
  { id: 95, section: '外部影響', system: '地震', subsystem: '地震' },
  { id: 96, section: '外部影響', system: '地震', subsystem: 'N/A' },
  { id: 97, section: '外部影響', system: '壓降', subsystem: '壓降' },
  { id: 98, section: '外部影響', system: '壓降', subsystem: 'N/A' },
  { id: 99, section: '外部影響', system: '火災', subsystem: '火災' },
  { id: 100, section: '外部影響', system: '火災', subsystem: 'N/A' },
  { id: 101, section: '外部影響', system: '異味', subsystem: '異味' },
  { id: 102, section: '外部影響', system: '異味', subsystem: 'N/A' },
  { id: 103, section: '外部影響', system: 'N/A', subsystem: 'N/A' },
  // N/A Section
  { id: 104, section: 'N/A', system: 'N/A', subsystem: 'N/A' },
];

// ===== Passdown Status & Type Enums =====

export const passdownTypes = [
  { label: '值班交接', value: '值班交接' },
  { label: '主辦交接', value: '主辦交接' },
  { label: '異常(一般)', value: '異常(一般)' },
  { label: '異常(重大)', value: '異常(重大)' },
];

export const passdownStatuses = [
  { label: '正常', value: '正常', color: '#26A69A' },           // Lake Green
  { label: '重大異常', value: '重大異常', color: '#E57373' },     // Coral Red
  { label: '一般異常', value: '一般異常', color: '#FFB74D' },     // Amber Orange
  { label: '處理中', value: '處理中', color: '#FFF176' },         // Bright Yellow
  { label: '已結案', value: '已結案', color: '#9E9E9E' },         // Medium Gray
];

export const passdownStatusColorMap = {
  '正常': '#26A69A',
  '重大異常': '#E57373',
  '一般異常': '#FFB74D',
  '處理中': '#FFF176',
  '已結案': '#9E9E9E',
};

// Map inline expansion background colors (lighter variants)
export const passdownStatusInlineColorMap = {
  '正常': '#F1F8F7',
  '重大異常': '#FFEBEE',
  '一般異常': '#FFF3E0',
  '處理中': '#FFFDE7',
  '已結案': '#F5F5F5',
};

const pad2 = (value) => String(value).padStart(2, '0');
const today = new Date();
const todayDateString = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
const withToday = (time) => `${todayDateString} ${time}`;

/**
 * Status initialization rules: Type -> Status
 */
export const getInitialPassdownStatus = (passdownType) => {
  switch (passdownType) {
    case '值班交接':
    case '主辦交接':
      return '正常';
    case '異常(重大)':
      return '重大異常';
    case '異常(一般)':
      return '一般異常';
    default:
      return '正常';
  }
};

// ===== Passdown Records (19 test records, includes dynamic today fixtures) =====

export const passdownData = [
  {
    id: 1,
    passdownTime: '2026-05-11 08:15',
    passdownType: '值班交接',
    passdownStatus: '正常',
    siteId: 1,
    siteName: 'MTB',
    passdownSectionId: 4,
    passdownSectionName: 'Building',
    passdownSystemName: 'CR',
    passdownSubSystemName: 'CR',
    passdownDescription: 'CR system daily handover - normal operation',
    createEmployeeId: 1,
    createEmployeeName: '王小明',
    receiveEmployeeId: 2,
    receiveEmployeeName: '李大華',
    passdownAttachments: null,
  },
  {
    id: 2,
    passdownTime: '2026-05-11 08:30',
    passdownType: '值班交接',
    passdownStatus: '正常',
    siteId: 1,
    siteName: 'MTB',
    passdownSectionId: 15,
    passdownSectionName: 'Building',
    passdownSystemName: 'HVAC',
    passdownSubSystemName: 'Chiller',
    passdownDescription: 'HVAC chiller unit handover',
    createEmployeeId: 3,
    createEmployeeName: '陳志偉',
    receiveEmployeeId: 4,
    receiveEmployeeName: '張建國',
    passdownAttachments: null,
  },
  {
    id: 3,
    passdownTime: '2026-05-11 09:00',
    passdownType: '主辦交接',
    passdownStatus: '正常',
    siteId: 2,
    siteName: 'TCP',
    passdownSectionId: 41,
    passdownSectionName: 'WTS',
    passdownSystemName: 'WWT',
    passdownSubSystemName: 'WWR',
    passdownDescription: 'Wastewater recycling system handover',
    createEmployeeId: 5,
    createEmployeeName: '吳淑芬',
    receiveEmployeeId: 7,
    receiveEmployeeName: '林美玲',
    passdownAttachments: null,
  },
  {
    id: 4,
    passdownTime: '2026-05-11 09:15',
    passdownType: '主辦交接',
    passdownStatus: '正常',
    siteId: 3,
    siteName: 'AATT',
    passdownSectionId: 75,
    passdownSectionName: 'GC',
    passdownSystemName: 'GAS',
    passdownSubSystemName: 'GD',
    passdownDescription: 'Gas detection system routine handover',
    createEmployeeId: 2,
    createEmployeeName: '李大華',
    receiveEmployeeId: 12,
    receiveEmployeeName: '趙文龍',
    passdownAttachments: null,
  },
  {
    id: 5,
    passdownTime: '2026-05-09 10:30',
    passdownType: '異常(重大)',
    passdownStatus: '重大異常',
    siteId: 1,
    siteName: 'MTB',
    passdownSectionId: 10,
    passdownSectionName: 'Building',
    passdownSystemName: 'EXH',
    passdownSubSystemName: 'GEX',
    passdownDescription: 'Critical exhaust system malfunction detected - equipment temperature exceeds threshold by 15 degrees',
    createEmployeeId: 1,
    createEmployeeName: '王小明',
    receiveEmployeeId: 2,
    receiveEmployeeName: '李大華',
    passdownAttachments: ['inspection_report_20260511.pdf'],
  },
  {
    id: 6,
    passdownTime: '2026-05-10 14:00',
    passdownType: '異常(重大)',
    passdownStatus: '處理中',
    siteId: 2,
    siteName: 'TCP',
    passdownSectionId: 23,
    passdownSectionName: 'Building',
    passdownSystemName: 'Mech.',
    passdownSubSystemName: 'AHU',
    passdownDescription: 'Major AHU failure in processing area - immediate action required',
    createEmployeeId: 6,
    createEmployeeName: '洪振宇',
    receiveEmployeeId: 8,
    receiveEmployeeName: '周雅琪',
    passdownAttachments: null,
  },
  {
    id: 7,
    passdownTime: '2026-05-08 11:20',
    passdownType: '異常(一般)',
    passdownStatus: '一般異常',
    siteId: 1,
    siteName: 'MTB',
    passdownSectionId: 35,
    passdownSectionName: 'Building',
    passdownSystemName: 'I&C',
    passdownSubSystemName: 'LDS',
    passdownDescription: 'Minor sensor reading drift - within acceptable range but requires monitoring',
    createEmployeeId: 4,
    createEmployeeName: '張建國',
    receiveEmployeeId: 1,
    receiveEmployeeName: '王小明',
    passdownAttachments: null,
  },
  {
    id: 8,
    passdownTime: '2026-05-10 15:45',
    passdownType: '異常(一般)',
    passdownStatus: '處理中',
    siteId: 3,
    siteName: 'AATT',
    passdownSectionId: 61,
    passdownSectionName: 'WTS',
    passdownSystemName: 'UPW',
    passdownSubSystemName: 'RO',
    passdownDescription: 'RO membrane pressure slightly elevated - scheduled maintenance recommended',
    createEmployeeId: 11,
    createEmployeeName: '蔡怡君',
    receiveEmployeeId: 13,
    receiveEmployeeName: '許家豪',
    passdownAttachments: null,
  },
  {
    id: 9,
    passdownTime: '2026-05-04 09:00',
    passdownType: '異常(一般)',
    passdownStatus: '已結案',
    siteId: 1,
    siteName: 'MTB',
    passdownSectionId: 37,
    passdownSectionName: 'Building',
    passdownSystemName: 'LSS',
    passdownSubSystemName: '火警系統',
    passdownDescription: 'Fire alarm sensor battery replacement completed',
    createEmployeeId: 9,
    createEmployeeName: '黃俊傑',
    receiveEmployeeId: 1,
    receiveEmployeeName: '王小明',
    passdownAttachments: ['maintenance_log_20260504.pdf', 'completion_cert_20260504.pdf'],
  },
  {
    id: 10,
    passdownTime: '2026-05-06 13:30',
    passdownType: '異常(重大)',
    passdownStatus: '已結案',
    siteId: 2,
    siteName: 'TCP',
    passdownSectionId: 81,
    passdownSectionName: 'GC',
    passdownSystemName: 'Chemical',
    passdownSubSystemName: 'CDU',
    passdownDescription: 'Chemical dosing unit recalibration completed and verified',
    createEmployeeId: 5,
    createEmployeeName: '吳淑芬',
    receiveEmployeeId: 6,
    receiveEmployeeName: '洪振宇',
    passdownAttachments: null,
  },
  {
    id: 11,
    passdownTime: '2026-05-07 08:00',
    passdownType: '值班交接',
    passdownStatus: '正常',
    siteId: 4,
    siteName: 'AATT 2',
    passdownSectionId: 89,
    passdownSectionName: 'Project',
    passdownSystemName: 'Project',
    passdownSubSystemName: 'Project',
    passdownDescription: 'Project site daily status handover',
    createEmployeeId: 13,
    createEmployeeName: '許家豪',
    receiveEmployeeId: 15,
    receiveEmployeeName: '楊世昌',
    passdownAttachments: null,
  },
  {
    id: 12,
    passdownTime: '2026-05-09 10:15',
    passdownType: '主辦交接',
    passdownStatus: '正常',
    siteId: 1,
    siteName: 'MTB',
    passdownSectionId: 38,
    passdownSectionName: 'Building',
    passdownSystemName: 'LSS',
    passdownSubSystemName: 'VESDA',
    passdownDescription: 'VESDA air sampling system routine check',
    createEmployeeId: 12,
    createEmployeeName: '趙文龍',
    receiveEmployeeId: 3,
    receiveEmployeeName: '陳志偉',
    passdownAttachments: null,
  },
  {
    id: 13,
    passdownTime: '2026-05-05 16:00',
    passdownType: '異常(重大)',
    passdownStatus: '已結案',
    siteId: 3,
    siteName: 'AATT',
    passdownSectionId: 28,
    passdownSectionName: 'Building',
    passdownSystemName: 'Elec.',
    passdownSubSystemName: 'UPS',
    passdownDescription: 'UPS battery failure - replacement and testing completed',
    createEmployeeId: 4,
    createEmployeeName: '張建國',
    receiveEmployeeId: 11,
    receiveEmployeeName: '蔡怡君',
    passdownAttachments: ['battery_replacement_order.pdf'],
  },
  {
    id: 14,
    passdownTime: '2026-05-10 16:30',
    passdownType: '異常(一般)',
    passdownStatus: '處理中',
    siteId: 1,
    siteName: 'MTB',
    passdownSectionId: 30,
    passdownSectionName: 'Building',
    passdownSystemName: 'Elec.',
    passdownSubSystemName: '高/中/低壓盤',
    passdownDescription: 'Electrical panel temperature reading elevated - cooling inspection in progress',
    createEmployeeId: 2,
    createEmployeeName: '李大華',
    receiveEmployeeId: 9,
    receiveEmployeeName: '林美玲',
    passdownAttachments: null,
  },
  {
    id: 15,
    passdownTime: withToday('07:40'),
    passdownType: '值班交接',
    passdownStatus: '正常',
    siteId: 1,
    siteName: 'MTB',
    passdownSectionId: 2,
    passdownSectionName: 'Building',
    passdownSystemName: 'CR',
    passdownSubSystemName: 'MAU',
    passdownDescription: '今日早班巡檢完成，MAU 運轉正常。',
    createEmployeeId: 3,
    createEmployeeName: '陳志偉',
    receiveEmployeeId: 1,
    receiveEmployeeName: '王小明',
    passdownAttachments: null,
  },
  {
    id: 16,
    passdownTime: withToday('08:25'),
    passdownType: '異常(重大)',
    passdownStatus: '重大異常',
    siteId: 2,
    siteName: 'TCP',
    passdownSectionId: 75,
    passdownSectionName: 'GC',
    passdownSystemName: 'GAS',
    passdownSubSystemName: 'GD',
    passdownDescription: '今日上午 GD 壓力異常升高，已啟動緊急應變。',
    createEmployeeId: 6,
    createEmployeeName: '洪振宇',
    receiveEmployeeId: 12,
    receiveEmployeeName: '趙文龍',
    passdownAttachments: ['today_major_event_photo.jpg'],
  },
  {
    id: 17,
    passdownTime: withToday('09:10'),
    passdownType: '異常(一般)',
    passdownStatus: '一般異常',
    siteId: 3,
    siteName: 'AATT',
    passdownSectionId: 59,
    passdownSectionName: 'WTS',
    passdownSystemName: 'UPW',
    passdownSubSystemName: 'ACF',
    passdownDescription: '今日 ACF 差壓偏高，已安排保養窗口。',
    createEmployeeId: 11,
    createEmployeeName: '蔡怡君',
    receiveEmployeeId: 13,
    receiveEmployeeName: '許家豪',
    passdownAttachments: null,
  },
  {
    id: 18,
    passdownTime: withToday('10:00'),
    passdownType: '異常(一般)',
    passdownStatus: '處理中',
    siteId: 1,
    siteName: 'MTB',
    passdownSectionId: 31,
    passdownSectionName: 'Building',
    passdownSystemName: 'Elec.',
    passdownSubSystemName: '發電機',
    passdownDescription: '今日發電機啟動延遲，維修中。',
    createEmployeeId: 2,
    createEmployeeName: '李大華',
    receiveEmployeeId: 9,
    receiveEmployeeName: '林美玲',
    passdownAttachments: ['generator_checklist_today.pdf'],
  },
  {
    id: 19,
    passdownTime: withToday('11:35'),
    passdownType: '異常(重大)',
    passdownStatus: '已結案',
    siteId: 4,
    siteName: 'AATT 2',
    passdownSectionId: 28,
    passdownSectionName: 'Building',
    passdownSystemName: 'Elec.',
    passdownSubSystemName: 'UPS',
    passdownDescription: '今日 UPS 告警已排除，驗證完成後結案。',
    createEmployeeId: 5,
    createEmployeeName: '吳淑芬',
    receiveEmployeeId: 15,
    receiveEmployeeName: '楊世昌',
    passdownAttachments: ['ups_today_recovery_report.pdf'],
  },
];

// ===== AbnormalLogs (7+ responses) =====

export const abnormalLogsData = [
  {
    id: 1,
    passdownId: 5,
    rcContent: 'Root Cause: Thermal sensor calibration drift due to humidity exposure in harsh environment. Sensor output exceeded threshold by 1.5V.',
    caContent: 'Replace thermal sensor unit with new calibrated unit. Run full equipment diagnostics to verify baseline parameters.',
    paContent: 'Implement weatherproof housing for sensor installation. Schedule quarterly calibration checks to prevent future drift.',
    planDate: '2026-05-14',
    dueDate: '2026-05-13',
    isClosed: true,
    responseEmployeeId: 2,
    responseEmployeeName: '李大華',
    responseTime: '2026-05-13 10:30',
  },
  {
    id: 2,
    passdownId: 6,
    rcContent: 'Root Cause: Bearing wear in main fan motor causing intermittent contact loss. Oil analysis indicates particle contamination.',
    caContent: 'Schedule urgent bearing replacement and motor rewind inspection. Deploy temporary portable AHU unit to maintain area climate control.',
    paContent: 'Implement predictive maintenance program with vibration monitoring for early detection of bearing degradation.',
    planDate: '2026-05-16',
    dueDate: null,
    isClosed: false,
    responseEmployeeId: 8,
    responseEmployeeName: '周雅琪',
    responseTime: '2026-05-10 14:30',
  },
  {
    id: 3,
    passdownId: 6,
    rcContent: 'Updated Root Cause Analysis: Bearing replacement completed. Investigation shows insufficient maintenance interval schedule.',
    caContent: 'Completed motor rewind, new bearing installation, and full system commissioning test. Performance parameters restored to baseline.',
    paContent: 'Revised maintenance schedule: bearing inspection every 6 months instead of annually. Implemented oil analysis program.',
    planDate: '2026-05-16',
    dueDate: '2026-05-12',
    isClosed: true,
    responseEmployeeId: 7,
    responseEmployeeName: '林美玲',
    responseTime: '2026-05-12 09:00',
  },
  {
    id: 4,
    passdownId: 7,
    rcContent: 'Root Cause: LDS sensor drift due to normal aging. Sensor reading variance within +/- 2% of nominal which is acceptable per spec.',
    caContent: 'Perform sensor recalibration using certified test gas. Document baseline readings for future trend analysis.',
    paContent: 'Schedule sensor replacement at next maintenance window (6 months). Implement trending dashboard to monitor sensor health.',
    planDate: '2026-05-10',
    dueDate: '2026-05-09',
    isClosed: true,
    responseEmployeeId: 1,
    responseEmployeeName: '王小明',
    responseTime: '2026-05-09 14:00',
  },
  {
    id: 5,
    passdownId: 8,
    rcContent: 'Root Cause: RO membrane fouling due to particulate accumulation over 18 months of operation. Pre-filter maintenance overdue.',
    caContent: 'Replace pre-filter cartridge and perform RO membrane chemical clean (CIP) cycle. Restore pressure to specification.',
    paContent: 'Increase pre-filter replacement frequency from 6 to 3 months. Implement inlet water quality monitoring.',
    planDate: '2026-05-18',
    dueDate: null,
    isClosed: false,
    responseEmployeeId: 13,
    responseEmployeeName: '許家豪',
    responseTime: '2026-05-10 16:00',
  },
  {
    id: 6,
    passdownId: 9,
    rcContent: 'Root Cause: Battery expired after 5 years of service. Detector functional but required immediate battery replacement per code.',
    caContent: 'Installed new lithium battery (5-year rated). Tested detector response and confirmed proper operation.',
    paContent: 'Schedule annual battery replacement in Q2 each year. Implement preventive replacement policy for all detectors.',
    planDate: '2026-05-04',
    dueDate: '2026-05-04',
    isClosed: true,
    responseEmployeeId: 1,
    responseEmployeeName: '王小明',
    responseTime: '2026-05-04 15:30',
  },
  {
    id: 7,
    passdownId: 10,
    rcContent: 'Root Cause: Dosing pump calibration drift due to wear in internal valve seats. Actual output variance: -3% from setpoint.',
    caContent: 'Complete pump disassembly, valve seat resurfacing, and recalibration using certified test solutions. Verified output accuracy.',
    paContent: 'Implement quarterly calibration verification. Install flow meter for real-time monitoring of dosing accuracy.',
    planDate: '2026-05-06',
    dueDate: '2026-05-06',
    isClosed: true,
    responseEmployeeId: 6,
    responseEmployeeName: '洪振宇',
    responseTime: '2026-05-06 11:00',
  },
  {
    id: 8,
    passdownId: 18,
    rcContent: 'Root Cause: 發電機啟動接觸器磨耗導致接觸不良。',
    caContent: '已更換接觸器並完成啟動測試，持續觀察中。',
    paContent: '納入每月接點點檢項目，降低重複發生機率。',
    planDate: todayDateString,
    dueDate: null,
    isClosed: false,
    responseEmployeeId: 9,
    responseEmployeeName: '林美玲',
    responseTime: withToday('10:40'),
  },
  {
    id: 9,
    passdownId: 19,
    rcContent: 'Root Cause: UPS 模組暫態過載造成保護動作。',
    caContent: '完成模組重置、負載平衡與回復測試。',
    paContent: '調整告警門檻並安排高峰時段負載監測。',
    planDate: todayDateString,
    dueDate: todayDateString,
    isClosed: true,
    responseEmployeeId: 15,
    responseEmployeeName: '楊世昌',
    responseTime: withToday('12:10'),
  },
];

// ===== Helper: Get abnormal logs for a passdown record =====
export const getAbnormalLogsForPassdown = (passdownId) => {
  return abnormalLogsData
    .filter((log) => log.passdownId === passdownId)
    .sort((a, b) => new Date(b.responseTime) - new Date(a.responseTime));
};

// ===== Helper: Get unique sections, systems, subsystems for filter =====
export const getSectionOptions = () => {
  const sections = [...new Set(passdownSections.map((ps) => ps.section))];
  return sections.sort();
};

export const getSystemOptionsBySection = (section) => {
  const systems = [...new Set(
    passdownSections
      .filter((ps) => ps.section === section)
      .map((ps) => ps.system),
  )];
  return systems.sort();
};

export const getSubSystemOptionsBySystemAndSection = (section, system) => {
  const subsystems = [...new Set(
    passdownSections
      .filter((ps) => ps.section === section && ps.system === system)
      .map((ps) => ps.subsystem),
  )];
  return subsystems.sort();
};

// ===== Hierarchy JSON Structure (Optimized for performance) =====
/**
 * 將平面 passdownSections 陣列轉換為嵌套 JSON 結構
 * 格式: { section: { system: [subsystems] } }
 * 用途: 加速層級篩選時的查詢效能，替代每次重新計算
 *
 * 效能優勢:
 * - O(1) 查詢：透過鍵值存取替代陣列掃描
 * - 減少 GC 壓力：避免每次都生成新的 Set/陣列
 * - 代碼可讀性：層級關係直觀
 *
 * API 接口抽象: hierarchyService.js 中的所有函式透過此結構查詢
 * 後端集成規劃: 若改為 API，後端應直接返回此格式
 */
export const buildHierarchyJson = () => {
  const hierarchy = {};

  passdownSections.forEach((node) => {
    // 初始化課別層級
    if (!hierarchy[node.section]) {
      hierarchy[node.section] = {};
    }

    // 初始化系統層級
    if (!hierarchy[node.section][node.system]) {
      hierarchy[node.section][node.system] = [];
    }

    // 添加子系統（避免重複）
    if (!hierarchy[node.section][node.system].includes(node.subsystem)) {
      hierarchy[node.section][node.system].push(node.subsystem);
    }
  });

  return hierarchy;
};

// 一次性構建，於應用啟動時執行
export const passdownHierarchy = buildHierarchyJson();
