export const attendanceTypes = {
  '出差': { label: '出差', color: '#22c55e' },
  '請假': { label: '請假', color: '#f97316' },
  '公假': { label: '公假', color: '#3b82f6' },
  'Training': { label: 'Training', color: '#a855f7' },
  'FWA': { label: 'FWA', color: '#06b6d4' },
};

const businessTripNotes = ['客戶拜訪', '跨廠支援', '供應商會議', '設備驗收', '現場勘查'];
const officialNotes = ['外部稽核', '政府機關', '教育訓練', '公會活動'];
const trainingNotes = ['新人訓練', '安全講習', '技能認證', '外部課程', '線上研習'];
const fwaNotes = ['居家辦公', '彈性上班', '異地辦公'];

function generateAttendance() {
  const records = [];
  const employeeIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '13', '15'];

  // Generate for March and April 2026
  [{ month: 2, year: 2026, days: 31 }, { month: 3, year: 2026, days: 30 }].forEach(({ month, year, days }) => {
    employeeIds.forEach((empId) => {
      for (let day = 1; day <= days; day++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOfWeek = new Date(year, month, day).getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        const rand = Math.random();

        // Only generate records for non-regular attendance (~25% of days)
        if (rand < 0.70) {
          // Regular work day — no record needed
          continue;
        } else if (rand < 0.78) {
          // 出差
          records.push({
            employeeId: empId, date, type: '出差',
            note: businessTripNotes[Math.floor(Math.random() * businessTripNotes.length)],
          });
        } else if (rand < 0.85) {
          // 請假
          records.push({ employeeId: empId, date, type: '請假', note: '' });
        } else if (rand < 0.90) {
          // 公假
          records.push({
            employeeId: empId, date, type: '公假',
            note: officialNotes[Math.floor(Math.random() * officialNotes.length)],
          });
        } else if (rand < 0.95) {
          // Training
          records.push({
            employeeId: empId, date, type: 'Training',
            note: trainingNotes[Math.floor(Math.random() * trainingNotes.length)],
          });
        } else {
          // FWA
          records.push({
            employeeId: empId, date, type: 'FWA',
            note: fwaNotes[Math.floor(Math.random() * fwaNotes.length)],
          });
        }
      }
    });
  });

  return records;
}

export const attendanceRecords = generateAttendance();
