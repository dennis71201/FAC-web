import { useMemo } from 'react';
import dayjs from 'dayjs';

const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

const typeConfig = {
  '出差': { label: '出差', className: 'type-出差' },
  '請假': { label: '請假', className: 'type-請假' },
  '公假': { label: '公假', className: 'type-公假' },
};

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

export default function AttendanceCalendar({ year, month, records, employees, onDateClick, selectedDate }) {
  const today = dayjs();
  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  // Build employee lookup: id → department
  const empDeptMap = useMemo(() => {
    const map = {};
    employees.forEach((e) => { map[e.key] = e.department; });
    return map;
  }, [employees]);

  // Group records by date → { dept → { type → count } }
  const summaryByDate = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      const dept = empDeptMap[r.employeeId];
      if (!dept) return;
      if (!map[r.date]) map[r.date] = {};
      if (!map[r.date][dept]) map[r.date][dept] = {};
      map[r.date][dept][r.type] = (map[r.date][dept][r.type] || 0) + 1;
    });
    return map;
  }, [records, empDeptMap]);

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
                ...(typeConfig[type] || { label: type, className: '' }),
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
                            {label}{count}
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
