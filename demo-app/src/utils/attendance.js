import dayjs from 'dayjs';

export function getRecordsForDate(records, dateValue) {
  if (!dateValue) {
    return [];
  }

  const day = dayjs(dateValue);
  const dayStart = day.startOf('day');
  const dayEnd = day.endOf('day');

  return records.filter((record) => {
    const start = dayjs(record.startTime);
    const end = dayjs(record.endTime);
    return start.isBefore(dayEnd) && end.isAfter(dayStart);
  });
}

export function formatDuration(record) {
  const start = dayjs(record.startTime);
  const end = dayjs(record.endTime);

  if (record.isAllDay) {
    const days = Math.max(end.endOf('day').diff(start.startOf('day'), 'day') + 1, 1);
    return `${days}天`;
  }

  const totalMinutes = Math.max(end.diff(start, 'minute'), 0);
  const hours = totalMinutes / 60;
  const rounded = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  return `${rounded}小時`;
}

export function formatRecordTimeRange(record) {
  const start = dayjs(record.startTime);
  const end = dayjs(record.endTime);

  if (record.isAllDay) {
    const startDate = start.format('YYYY-MM-DD');
    const endDate = end.format('YYYY-MM-DD');
    return startDate === endDate ? startDate : `${startDate} ~ ${endDate}`;
  }

  if (start.isSame(end, 'day')) {
    return `${start.format('YYYY-MM-DD HH:mm')} - ${end.format('HH:mm')}`;
  }

  return `${start.format('YYYY-MM-DD HH:mm')} - ${end.format('YYYY-MM-DD HH:mm')}`;
}

export function buildTypeClassName(typeName) {
  const map = {
    出差: 'type-出差',
    請假: 'type-請假',
    公假: 'type-公假',
    Training: 'type-training',
    FWA: 'type-fwa',
  };
  return map[typeName] || '';
}
