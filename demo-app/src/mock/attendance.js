export const attendanceTypes = {
  work: { label: '出勤', color: '#22c55e' },
  training: { label: 'Training', color: '#3b82f6' },
  '特休': { label: '特休', color: '#8b5cf6' },
  '病假': { label: '病假', color: '#ef4444' },
  '公假': { label: '公假', color: '#06b6d4' },
  '事假': { label: '事假', color: '#f59e0b' },
};

// Generate attendance for March 2026
function generateAttendance() {
  const records = [];
  const employeeIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11'];

  employeeIds.forEach((empId) => {
    for (let day = 1; day <= 28; day++) {
      const date = `2026-03-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(2026, 2, day).getDay();

      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Random attendance type
      const rand = Math.random();
      let type, hours;

      if (rand < 0.78) {
        type = 'work';
        hours = [8, 8, 8, 10, 12][Math.floor(Math.random() * 5)];
      } else if (rand < 0.85) {
        type = 'training';
        hours = 8;
      } else if (rand < 0.90) {
        type = '特休';
        hours = 0;
      } else if (rand < 0.94) {
        type = '病假';
        hours = 0;
      } else if (rand < 0.97) {
        type = '公假';
        hours = 0;
      } else {
        type = '事假';
        hours = 0;
      }

      records.push({
        employeeId: empId,
        date,
        type,
        hours,
      });
    }
  });

  return records;
}

export const attendanceRecords = generateAttendance();
