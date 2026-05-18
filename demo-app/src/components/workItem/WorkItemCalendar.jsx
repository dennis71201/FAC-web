import { useMemo } from 'react';
import dayjs from 'dayjs';

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getCalendarDays(year, month) {
  const firstDay = dayjs().year(year).month(month).startOf('month');
  const lastDay = firstDay.endOf('month');
  const startDow = firstDay.day();
  const daysInMonth = lastDay.date();

  const days = [];
  const prevMonth = firstDay.subtract(1, 'month');
  const prevDays = prevMonth.daysInMonth();
  for (let i = startDow - 1; i >= 0; i -= 1) {
    days.push({ date: prevMonth.date(prevDays - i), outside: true });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    days.push({ date: firstDay.date(d), outside: false });
  }
  const remainder = days.length % 7;
  if (remainder > 0) {
    const nextMonth = firstDay.add(1, 'month');
    for (let d = 1; d <= 7 - remainder; d += 1) {
      days.push({ date: nextMonth.date(d), outside: true });
    }
  }
  return days;
}

export default function WorkItemCalendar({ year, month, workItems, onDateClick, selectedDate }) {
  const today = dayjs();
  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const countByDate = useMemo(() => {
    const map = {};
    workItems.forEach((item) => {
      const start = dayjs(item.startDate);
      const end = dayjs(item.endDate || item.startDate);
      for (let d = start; d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) {
        const dateKey = d.format('YYYY-MM-DD');
        map[dateKey] = (map[dateKey] || 0) + 1;
      }
    });
    return map;
  }, [workItems]);

  return (
    <div className="wi-calendar">
      <div className="wi-calendar-header">
        {weekdays.map((d) => (
          <div key={d} className="wi-calendar-header-cell">{d}</div>
        ))}
      </div>
      <div className="wi-calendar-grid">
        {calendarDays.map(({ date, outside }, idx) => {
          const dateStr = date.format('YYYY-MM-DD');
          const isToday = date.isSame(today, 'day');
          const isWeekend = date.day() === 0 || date.day() === 6;
          const isSelected = selectedDate && date.isSame(selectedDate, 'day');
          const count = countByDate[dateStr] || 0;

          const cellClasses = [
            'wi-calendar-cell',
            outside && 'outside',
            isWeekend && 'weekend',
            isToday && 'today',
            isSelected && !isToday && 'selected',
          ].filter(Boolean).join(' ');

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
              </div>
              {count > 0 && !isWeekend && (
                <div className="cell-entries">
                  <span className="cell-total-badge">{count}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
