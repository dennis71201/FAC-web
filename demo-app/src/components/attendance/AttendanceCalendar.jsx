import { useMemo } from 'react';
import dayjs from 'dayjs';
import { buildTypeClassName, getRecordsForDate } from '../../utils/attendance';

const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

function getCalendarDays(year, month) {
  const firstDay = dayjs().year(year).month(month).startOf('month');
  const lastDay = firstDay.endOf('month');
  const startDow = firstDay.day(); // 0=Sun
  const daysInMonth = lastDay.date();

  const days = [];

  // Leading days from previous month
  const prevMonth = firstDay.subtract(1, 'month');
  const prevDays = prevMonth.daysInMonth();
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({
      date: prevMonth.date(prevDays - i),
      outside: true,
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: firstDay.date(d),
      outside: false,
    });
  }

  // Trailing days to fill last row
  const remainder = days.length % 7;
  if (remainder > 0) {
    const nextMonth = firstDay.add(1, 'month');
    for (let d = 1; d <= 7 - remainder; d++) {
      days.push({
        date: nextMonth.date(d),
        outside: true,
      });
    }
  }

  return days;
}

export default function AttendanceCalendar({ year, month, records, onDateClick, selectedDate }) {
  const today = dayjs();
  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  // Group records by date → { dept → { type → count } }
  // For each calendar day, find all records overlapping that date
  const summaryByDate = useMemo(() => {
    const map = {};
    calendarDays.forEach(({ date }) => {
      const dateKey = date.format('YYYY-MM-DD');
      const dayRecords = getRecordsForDate(records, date);
      if (dayRecords.length === 0) return;

      const deptMap = {};
      dayRecords.forEach((r) => {
        const dept = r.employeeDepartment || '未分類';
        if (!dept) return;
        if (!deptMap[dept]) deptMap[dept] = {};
        const typeName = r.attendanceTypeName || '未定義';
        deptMap[dept][typeName] = (deptMap[dept][typeName] || 0) + 1;
      });
      map[dateKey] = deptMap;
    });
    return map;
  }, [records, calendarDays]);

  return (
    <div className="att-calendar">
      <div className="att-calendar-header">
        {weekdays.map((d) => (
          <div key={d} className="att-calendar-header-cell">{d}</div>
        ))}
      </div>
      <div className="att-calendar-grid">
        {calendarDays.map(({ date, outside }, idx) => {
          const dateStr = date.format('YYYY-MM-DD');
          const isToday = date.isSame(today, 'day');
          const isWeekend = date.day() === 0 || date.day() === 6;
          const isSelected = selectedDate && date.isSame(selectedDate, 'day');
          const daySummary = summaryByDate[dateStr]; // { dept: { type: count } }

          const cellClasses = [
            'att-calendar-cell',
            outside && 'outside',
            isWeekend && 'weekend',
            isToday && 'today',
            isSelected && !isToday && 'selected',
          ].filter(Boolean).join(' ');

          // Collect department rows for this day
          const deptRows = [];
          if (daySummary) {
            Object.entries(daySummary).forEach(([dept, types]) => {
              const badges = Object.entries(types).map(([type, count]) => ({
                type,
                count,
                label: type,
                className: buildTypeClassName(type),
              }));
              if (badges.length > 0) {
                deptRows.push({ dept, badges });
              }
            });
          }

          return (
            <div
              key={idx}
              className={cellClasses}
              onClick={() => !outside && onDateClick?.(date)}
            >
              <div className="cell-day">
                {isToday ? (
                  <span className="cell-day-number">{date.date()}</span>
                ) : (
                  <span>{date.date()}</span>
                )}
                {isToday && <span className="cell-today-badge">今日</span>}
              </div>
              {deptRows.length > 0 && (
                <div className="cell-entries">
                  {deptRows.map(({ dept, badges }) => (
                    <div key={dept} className="cell-dept-row">
                      <span className="cell-dept-label">{dept}</span>
                      <span className="cell-dept-badges">
                        {badges.map(({ type, count, label, className }) => (
                          <span key={type} className={`cell-badge ${className}`}>
                            {label} {count}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
