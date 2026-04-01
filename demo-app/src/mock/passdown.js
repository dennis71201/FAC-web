export const systemOptions = ['ALL', 'WTS', 'EI', 'GC', 'HVAC', 'Maint', 'Others'];

export const passdownStatusOptions = [
  { label: '處理中', value: '處理中', color: 'blue' },
  { label: '已完成', value: '已完成', color: 'green' },
  { label: '待追蹤', value: '待追蹤', color: 'orange' },
];

export const passdownStatusColorMap = {
  '處理中': 'blue',
  '已完成': 'green',
  '待追蹤': 'orange',
};

export const shiftOptions = ['日班', '夜班', '小夜班'];

export const passdownData = [
  { key: '1', date: '2026-03-28 08:00', site: 'A廠', system: 'HVAC', equipment: 'RCU-A01', event: 'RCU bearing異常振動，已通知廠商檢修', process: 'Cleanroom Air Handling', status: '處理中', shift: '日班', owner: '王小明', imageCount: 2 },
  { key: '2', date: '2026-03-28 08:00', site: 'A廠', system: 'WTS', equipment: 'PCW-P-A01', event: 'PCW Pump 計畫性保養完成，恢復運轉', process: 'PCW System', status: '已完成', shift: '日班', owner: '李大華', imageCount: 3 },
  { key: '3', date: '2026-03-27 20:00', site: 'B廠', system: 'EI', equipment: 'UPS-B01', event: 'UPS自動切換至bypass模式，已手動恢復', process: 'Power Distribution', status: '已完成', shift: '夜班', owner: '陳志偉', imageCount: 1 },
  { key: '4', date: '2026-03-27 20:00', site: 'A廠', system: 'GC', equipment: 'CDA-COMP-01', event: '壓縮機異常振動，暫時切換至備機運轉', process: 'CDA System', status: '處理中', shift: '夜班', owner: '張建國', imageCount: 0 },
  { key: '5', date: '2026-03-27 08:00', site: 'B廠', system: 'WTS', equipment: 'EDI-B01', event: 'EDI膜片損壞，已訂購備品，預計3天到貨', process: 'UPW System', status: '待追蹤', shift: '日班', owner: '吳淑芬', imageCount: 2 },
  { key: '6', date: '2026-03-27 08:00', site: 'A廠', system: 'EI', equipment: 'TR-A01', event: 'Transformer保養完成，油溫恢復正常', process: 'Power Distribution', status: '已完成', shift: '日班', owner: '林美玲', imageCount: 1 },
  { key: '7', date: '2026-03-26 20:00', site: 'B廠', system: 'HVAC', equipment: 'CH-B02', event: '冰水機擴充工程進度確認，管路施工中', process: 'Chiller Plant', status: '處理中', shift: '小夜班', owner: '趙文龍', imageCount: 4 },
  { key: '8', date: '2026-03-26 08:00', site: 'A廠', system: 'WTS', equipment: 'RO-A01', event: 'RO membrane清洗完成，水質恢復正常', process: 'UPW System', status: '已完成', shift: '日班', owner: '李大華', imageCount: 0 },
  { key: '9', date: '2026-03-26 08:00', site: 'B廠', system: 'GC', equipment: 'SCR-B01', event: 'Scrubber水流量偏低，調整閥門後恢復', process: 'Exhaust Treatment', status: '已完成', shift: '日班', owner: '洪振宇', imageCount: 1 },
  { key: '10', date: '2026-03-25 20:00', site: 'A廠', system: 'EI', equipment: 'ACB-A02', event: 'Breaker意外跳脫，檢查後重新送電', process: 'Power Distribution', status: '已完成', shift: '夜班', owner: '周雅琪', imageCount: 2 },
  { key: '11', date: '2026-03-25 08:00', site: 'A廠', system: 'HVAC', equipment: 'MAU-A01', event: 'MAU pre-filter更換完成', process: 'Air Handling', status: '已完成', shift: '日班', owner: '楊世昌', imageCount: 0 },
  { key: '12', date: '2026-03-25 08:00', site: 'B廠', system: 'WTS', equipment: 'WWT-B01', event: '廢水pH值異常，加藥系統調整中', process: 'Wastewater Treatment', status: '待追蹤', shift: '日班', owner: '蔡怡君', imageCount: 1 },
  { key: '13', date: '2026-03-24 20:00', site: 'A廠', system: 'GC', equipment: 'VMB-A01', event: 'VMB區域gas leak sensor觸發，確認為誤報', process: 'Gas Distribution', status: '已完成', shift: '夜班', owner: '黃俊傑', imageCount: 3 },
  { key: '14', date: '2026-03-24 08:00', site: 'B廠', system: 'EI', equipment: 'GEN-B01', event: '緊急發電機燃油補充完成', process: 'Emergency Power', status: '已完成', shift: '日班', owner: '許家豪', imageCount: 0 },
  { key: '15', date: '2026-03-24 08:00', site: 'A廠', system: 'WTS', equipment: 'UV-A01', event: 'UV燈管更換，殺菌強度恢復正常', process: 'UPW System', status: '已完成', shift: '日班', owner: '李大華', imageCount: 1 },
];
