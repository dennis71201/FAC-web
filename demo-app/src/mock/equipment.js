export const siteOptions = ['A廠', 'B廠'];
export const categoryOptions = ['EI', 'HVAC', 'WTS'];

export const statusOptions = [
  { label: '運轉', value: '運轉', color: 'green' },
  { label: '計畫性保養', value: '計畫性保養', color: 'blue' },
  { label: '備機', value: '備機', color: 'default' },
  { label: '故障', value: '故障', color: 'red' },
  { label: '擴充', value: '擴充', color: 'orange' },
];

export const statusColorMap = {
  '運轉': '#22c55e',
  '計畫性保養': '#3b82f6',
  '備機': '#94a3b8',
  '故障': '#ef4444',
  '擴充': '#f97316',
};

export const statusTagColorMap = {
  '運轉': 'green',
  '計畫性保養': 'blue',
  '備機': 'default',
  '故障': 'red',
  '擴充': 'orange',
};

// history: array of { date, status, remark } sorted ascending by date
// The current status/remark is the latest state. history records past changes.
export const equipmentData = [
  // A廠 EI - UPS (3台)
  { key: '1', site: 'A廠', category: 'EI', mainSystem: 'Power Distribution', subSystem: 'UPS', equipment: 'UPS-A01', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28',
    history: [
      { date: '2026-03-20', status: '計畫性保養', remark: '年度保養' },
      { date: '2026-03-22', status: '運轉', remark: '保養完成' },
    ] },
  { key: '2', site: 'A廠', category: 'EI', mainSystem: 'Power Distribution', subSystem: 'UPS', equipment: 'UPS-A02', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  { key: '3', site: 'A廠', category: 'EI', mainSystem: 'Power Distribution', subSystem: 'UPS', equipment: 'UPS-A03', status: '備機', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  // A廠 EI - Transformer (2台)
  { key: '4', site: 'A廠', category: 'EI', mainSystem: 'Power Distribution', subSystem: 'Transformer', equipment: 'TR-A01', status: '計畫性保養', redundancy: '1+1', remark: 'Plan Completed 03/25', date: '2026-03-25',
    history: [
      { date: '2026-03-18', status: '運轉', remark: '' },
      { date: '2026-03-23', status: '計畫性保養', remark: '停機保養中' },
    ] },
  { key: '5', site: 'A廠', category: 'EI', mainSystem: 'Power Distribution', subSystem: 'Transformer', equipment: 'TR-A02', status: '運轉', redundancy: '1+1', remark: '', date: '2026-03-28', history: [] },
  // A廠 HVAC - Chiller (4台)
  { key: '6', site: 'A廠', category: 'HVAC', mainSystem: 'Chiller', subSystem: 'Centrifugal Chiller', equipment: 'CH-A01', status: '運轉', redundancy: '3+1', remark: '', date: '2026-03-28', history: [] },
  { key: '7', site: 'A廠', category: 'HVAC', mainSystem: 'Chiller', subSystem: 'Centrifugal Chiller', equipment: 'CH-A02', status: '運轉', redundancy: '3+1', remark: '', date: '2026-03-28',
    history: [
      { date: '2026-03-15', status: '故障', remark: '冷媒洩漏' },
      { date: '2026-03-19', status: '計畫性保養', remark: '維修中' },
      { date: '2026-03-24', status: '運轉', remark: '維修完成' },
    ] },
  { key: '8', site: 'A廠', category: 'HVAC', mainSystem: 'Chiller', subSystem: 'Centrifugal Chiller', equipment: 'CH-A03', status: '運轉', redundancy: '3+1', remark: '', date: '2026-03-28', history: [] },
  { key: '9', site: 'A廠', category: 'HVAC', mainSystem: 'Chiller', subSystem: 'Centrifugal Chiller', equipment: 'CH-A04', status: '備機', redundancy: '3+1', remark: '', date: '2026-03-28', history: [] },
  // A廠 HVAC - MAU (3台)
  { key: '10', site: 'A廠', category: 'HVAC', mainSystem: 'AHU', subSystem: 'MAU', equipment: 'MAU-A01', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  { key: '11', site: 'A廠', category: 'HVAC', mainSystem: 'AHU', subSystem: 'MAU', equipment: 'MAU-A02', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  { key: '12', site: 'A廠', category: 'HVAC', mainSystem: 'AHU', subSystem: 'MAU', equipment: 'MAU-A03', status: '故障', redundancy: '2+1', remark: 'Occur 03/27 bearing異常', date: '2026-03-27',
    history: [
      { date: '2026-03-20', status: '運轉', remark: '' },
      { date: '2026-03-27', status: '故障', remark: 'Occur 03/27 bearing異常' },
    ] },
  // A廠 HVAC - RCU (5台)
  { key: '13', site: 'A廠', category: 'HVAC', mainSystem: 'AHU', subSystem: 'RCU', equipment: 'RCU-A01', status: '運轉', redundancy: '4+1', remark: '', date: '2026-03-28', history: [] },
  { key: '14', site: 'A廠', category: 'HVAC', mainSystem: 'AHU', subSystem: 'RCU', equipment: 'RCU-A02', status: '運轉', redundancy: '4+1', remark: '', date: '2026-03-28', history: [] },
  { key: '15', site: 'A廠', category: 'HVAC', mainSystem: 'AHU', subSystem: 'RCU', equipment: 'RCU-A03', status: '運轉', redundancy: '4+1', remark: '', date: '2026-03-28', history: [] },
  { key: '16', site: 'A廠', category: 'HVAC', mainSystem: 'AHU', subSystem: 'RCU', equipment: 'RCU-A04', status: '運轉', redundancy: '4+1', remark: '', date: '2026-03-28', history: [] },
  { key: '17', site: 'A廠', category: 'HVAC', mainSystem: 'AHU', subSystem: 'RCU', equipment: 'RCU-A05', status: '備機', redundancy: '4+1', remark: '', date: '2026-03-28', history: [] },
  // A廠 WTS - RO (3台)
  { key: '18', site: 'A廠', category: 'WTS', mainSystem: 'UPW', subSystem: 'RO System', equipment: 'RO-A01', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  { key: '19', site: 'A廠', category: 'WTS', mainSystem: 'UPW', subSystem: 'RO System', equipment: 'RO-A02', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  { key: '20', site: 'A廠', category: 'WTS', mainSystem: 'UPW', subSystem: 'RO System', equipment: 'RO-A03', status: '計畫性保養', redundancy: '2+1', remark: 'membrane清洗中', date: '2026-03-26',
    history: [
      { date: '2026-03-18', status: '運轉', remark: '' },
      { date: '2026-03-26', status: '計畫性保養', remark: 'membrane清洗中' },
    ] },
  // A廠 WTS - EDI (2台)
  { key: '21', site: 'A廠', category: 'WTS', mainSystem: 'UPW', subSystem: 'EDI', equipment: 'EDI-A01', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  { key: '22', site: 'A廠', category: 'WTS', mainSystem: 'UPW', subSystem: 'EDI', equipment: 'EDI-A02', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  // A廠 WTS - PCW Pump (4台)
  { key: '23', site: 'A廠', category: 'WTS', mainSystem: 'PCW', subSystem: 'PCW Pump', equipment: 'PCW-P-A01', status: '運轉', redundancy: '3+1', remark: '', date: '2026-03-28', history: [] },
  { key: '24', site: 'A廠', category: 'WTS', mainSystem: 'PCW', subSystem: 'PCW Pump', equipment: 'PCW-P-A02', status: '運轉', redundancy: '3+1', remark: '', date: '2026-03-28', history: [] },
  { key: '25', site: 'A廠', category: 'WTS', mainSystem: 'PCW', subSystem: 'PCW Pump', equipment: 'PCW-P-A03', status: '運轉', redundancy: '3+1', remark: '', date: '2026-03-28', history: [] },
  { key: '26', site: 'A廠', category: 'WTS', mainSystem: 'PCW', subSystem: 'PCW Pump', equipment: 'PCW-P-A04', status: '計畫性保養', redundancy: '3+1', remark: 'Plan Completed 03/26', date: '2026-03-26',
    history: [
      { date: '2026-03-18', status: '運轉', remark: '' },
      { date: '2026-03-24', status: '計畫性保養', remark: '停機保養' },
      { date: '2026-03-26', status: '計畫性保養', remark: 'Plan Completed 03/26' },
    ] },
  // B廠 EI - UPS (3台)
  { key: '27', site: 'B廠', category: 'EI', mainSystem: 'Power Distribution', subSystem: 'UPS', equipment: 'UPS-B01', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  { key: '28', site: 'B廠', category: 'EI', mainSystem: 'Power Distribution', subSystem: 'UPS', equipment: 'UPS-B02', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  { key: '29', site: 'B廠', category: 'EI', mainSystem: 'Power Distribution', subSystem: 'UPS', equipment: 'UPS-B03', status: '備機', redundancy: '2+1', remark: '', date: '2026-03-28',
    history: [
      { date: '2026-03-16', status: '故障', remark: 'battery異常' },
      { date: '2026-03-21', status: '計畫性保養', remark: '更換battery' },
      { date: '2026-03-25', status: '備機', remark: '' },
    ] },
  // B廠 EI - Generator (2台)
  { key: '30', site: 'B廠', category: 'EI', mainSystem: 'Power Distribution', subSystem: 'Generator', equipment: 'GEN-B01', status: '備機', redundancy: '1+1', remark: '', date: '2026-03-28', history: [] },
  { key: '31', site: 'B廠', category: 'EI', mainSystem: 'Power Distribution', subSystem: 'Generator', equipment: 'GEN-B02', status: '運轉', redundancy: '1+1', remark: '', date: '2026-03-28', history: [] },
  // B廠 HVAC - Chiller (3台)
  { key: '32', site: 'B廠', category: 'HVAC', mainSystem: 'Chiller', subSystem: 'Centrifugal Chiller', equipment: 'CH-B01', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  { key: '33', site: 'B廠', category: 'HVAC', mainSystem: 'Chiller', subSystem: 'Centrifugal Chiller', equipment: 'CH-B02', status: '擴充', redundancy: '2+1', remark: '預計04月完成', date: '2026-03-20',
    history: [
      { date: '2026-03-10', status: '備機', remark: '' },
      { date: '2026-03-20', status: '擴充', remark: '預計04月完成' },
    ] },
  { key: '34', site: 'B廠', category: 'HVAC', mainSystem: 'Chiller', subSystem: 'Centrifugal Chiller', equipment: 'CH-B03', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  // B廠 HVAC - MAU (2台)
  { key: '35', site: 'B廠', category: 'HVAC', mainSystem: 'AHU', subSystem: 'MAU', equipment: 'MAU-B01', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  { key: '36', site: 'B廠', category: 'HVAC', mainSystem: 'AHU', subSystem: 'MAU', equipment: 'MAU-B02', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  // B廠 WTS - RO (2台)
  { key: '37', site: 'B廠', category: 'WTS', mainSystem: 'UPW', subSystem: 'RO System', equipment: 'RO-B01', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  { key: '38', site: 'B廠', category: 'WTS', mainSystem: 'UPW', subSystem: 'RO System', equipment: 'RO-B02', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  // B廠 WTS - EDI (2台)
  { key: '39', site: 'B廠', category: 'WTS', mainSystem: 'UPW', subSystem: 'EDI', equipment: 'EDI-B01', status: '故障', redundancy: '2+1', remark: 'Occur 03/26 膜片損壞', date: '2026-03-26',
    history: [
      { date: '2026-03-18', status: '運轉', remark: '' },
      { date: '2026-03-26', status: '故障', remark: 'Occur 03/26 膜片損壞' },
    ] },
  { key: '40', site: 'B廠', category: 'WTS', mainSystem: 'UPW', subSystem: 'EDI', equipment: 'EDI-B02', status: '運轉', redundancy: '2+1', remark: '', date: '2026-03-28', history: [] },
  // B廠 WTS - Cooling Tower (3台)
  { key: '41', site: 'B廠', category: 'WTS', mainSystem: 'PCW', subSystem: 'Cooling Tower', equipment: 'CT-B01', status: '運轉', redundancy: '3+1', remark: '', date: '2026-03-28', history: [] },
  { key: '42', site: 'B廠', category: 'WTS', mainSystem: 'PCW', subSystem: 'Cooling Tower', equipment: 'CT-B02', status: '運轉', redundancy: '3+1', remark: '', date: '2026-03-28', history: [] },
  { key: '43', site: 'B廠', category: 'WTS', mainSystem: 'PCW', subSystem: 'Cooling Tower', equipment: 'CT-B03', status: '備機', redundancy: '3+1', remark: '', date: '2026-03-28', history: [] },
];

// Given a target date, resolve the status/remark of a machine at that point in time.
// Logic: find the latest history entry on or before targetDate. If none, use current status.
export function getStatusAtDate(machine, targetDateStr) {
  if (!machine.history || machine.history.length === 0) {
    return { status: machine.status, remark: machine.remark };
  }
  // history is sorted ascending by date
  let resolved = null;
  for (const entry of machine.history) {
    if (entry.date <= targetDateStr) {
      resolved = entry;
    } else {
      break;
    }
  }
  // If targetDate is after all history, use current status
  if (targetDateStr >= machine.date) {
    return { status: machine.status, remark: machine.remark };
  }
  // If found a history entry
  if (resolved) {
    return { status: resolved.status, remark: resolved.remark };
  }
  // If targetDate is before all history entries, assume current status (initial state)
  return { status: machine.status, remark: '' };
}
