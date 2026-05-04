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

// Helper: format date string
function fmtDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Helper: add N calendar days to a date string, skipping weekends
function addWeekdays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  let added = 0;
  while (added < n) {
    dt.setDate(dt.getDate() + 1);
    const dow = dt.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

// Helper: random int between min and max (inclusive)
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAttendance() {
  const records = [];
  let nextId = 1;
  const employeeIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '13', '15'];

  // Generate for March and April 2026
  [{ month: 2, year: 2026, days: 31 }, { month: 3, year: 2026, days: 30 }].forEach(({ month, year, days }) => {
    employeeIds.forEach((empId) => {
      for (let day = 1; day <= days; day++) {
        const startDate = fmtDate(year, month, day);
        const dayOfWeek = new Date(year, month, day).getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        const rand = Math.random();

        // Only generate records for non-regular attendance (~25% of days)
        if (rand < 0.70) {
          continue;
        }

        let type, note, isAllDay, endDate, startTime, endTime;

        if (rand < 0.78) {
          type = '出差';
          note = businessTripNotes[Math.floor(Math.random() * businessTripNotes.length)];
        } else if (rand < 0.85) {
          type = '請假';
          note = '';
        } else if (rand < 0.90) {
          type = '公假';
          note = officialNotes[Math.floor(Math.random() * officialNotes.length)];
        } else if (rand < 0.95) {
          type = 'Training';
          note = trainingNotes[Math.floor(Math.random() * trainingNotes.length)];
        } else {
          type = 'FWA';
          note = fwaNotes[Math.floor(Math.random() * fwaNotes.length)];
        }

        // Determine duration variant
        const durationRand = Math.random();

        if (durationRand < 0.55) {
          // Single all-day
          isAllDay = true;
          endDate = startDate;
          startTime = null;
          endTime = null;
        } else if (durationRand < 0.70) {
          // Multi-day (1~3 extra weekdays)
          isAllDay = true;
          const extraDays = randInt(1, 3);
          endDate = addWeekdays(startDate, extraDays);
          startTime = null;
          endTime = null;
        } else {
          // Partial-day (2~6 hours)
          isAllDay = false;
          endDate = startDate;
          const startHour = randInt(8, 14);
          const hours = randInt(2, 6);
          const endHour = Math.min(startHour + hours, 18);
          startTime = `${String(startHour).padStart(2, '0')}:00`;
          endTime = `${String(endHour).padStart(2, '0')}:00`;
        }

        records.push({
          id: nextId++,
          employeeId: empId,
          type,
          startDate,
          endDate,
          startTime,
          endTime,
          isAllDay,
          note,
        });
      }
    });
  });

  return records;
}

/**
 * Get all records that overlap with a given date string (YYYY-MM-DD).
 * A record overlaps if startDate <= dateStr <= endDate.
 */
export function getRecordsForDate(records, dateStr) {
  return records.filter((r) => r.startDate <= dateStr && dateStr <= r.endDate);
}

/**
 * Format the duration of a record for display.
 * All-day → "N天", Partial → "N小時"
 */
export function formatDuration(record) {
  if (record.isAllDay) {
    const start = new Date(record.startDate);
    const end = new Date(record.endDate);
    let days = 0;
    const dt = new Date(start);
    while (dt <= end) {
      const dow = dt.getDay();
      if (dow !== 0 && dow !== 6) days++;
      dt.setDate(dt.getDate() + 1);
    }
    return `${days}天`;
  }
  // Partial day — calculate hours from startTime/endTime
  const [sh, sm] = record.startTime.split(':').map(Number);
  const [eh, em] = record.endTime.split(':').map(Number);
  const hours = (eh * 60 + em - sh * 60 - sm) / 60;
  return `${hours}小時`;
}

export const attendanceRecords = generateAttendance();
