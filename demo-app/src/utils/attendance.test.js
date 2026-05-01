import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  getRecordsForDate,
  formatDuration,
  formatRecordTimeRange,
  buildTypeClassName,
} from './attendance.js';

const allDayRecord = {
  id: 1,
  startTime: '2026-04-17T00:00:00.000Z',
  endTime: '2026-04-17T23:59:59.000Z',
  isAllDay: true,
};

const multiDayAllDay = {
  id: 2,
  startTime: '2026-04-17T00:00:00.000Z',
  endTime: '2026-04-19T23:59:59.000Z',
  isAllDay: true,
};

const partialSameDay = {
  id: 3,
  startTime: '2026-04-17T01:00:00.000Z',
  endTime: '2026-04-17T04:00:00.000Z',
  isAllDay: false,
};

const crossDayRecord = {
  id: 4,
  startTime: '2026-04-17T13:00:00.000Z',
  endTime: '2026-04-17T21:00:00.000Z',
  isAllDay: false,
};

const halfHourRecord = {
  id: 5,
  startTime: '2026-04-17T01:00:00.000Z',
  endTime: '2026-04-17T03:30:00.000Z',
  isAllDay: false,
};

describe('getRecordsForDate', () => {
  const records = [allDayRecord, multiDayAllDay, partialSameDay, crossDayRecord];

  it('日期為空時回傳空陣列', () => {
    expect(getRecordsForDate(records, null)).toEqual([]);
    expect(getRecordsForDate(records, undefined)).toEqual([]);
  });

  it('回傳當日有重疊的紀錄', () => {
    const result = getRecordsForDate(records, dayjs('2026-04-17T08:00:00.000Z'));
    const ids = result.map((r) => r.id);
    expect(ids).toContain(allDayRecord.id);
    expect(ids).toContain(partialSameDay.id);
  });

  it('多日全天紀錄在每一天都會出現', () => {
    const day1 = getRecordsForDate(records, dayjs('2026-04-18T08:00:00.000Z')).map((r) => r.id);
    const day2 = getRecordsForDate(records, dayjs('2026-04-19T08:00:00.000Z')).map((r) => r.id);
    expect(day1).toContain(multiDayAllDay.id);
    expect(day2).toContain(multiDayAllDay.id);
  });

  it('多日全天紀錄不會出現在範圍外的日期', () => {
    const before = getRecordsForDate(records, dayjs('2026-04-16T08:00:00.000Z')).map((r) => r.id);
    const after = getRecordsForDate(records, dayjs('2026-04-20T08:00:00.000Z')).map((r) => r.id);
    expect(before).not.toContain(multiDayAllDay.id);
    expect(after).not.toContain(multiDayAllDay.id);
  });

  it('跨日紀錄在 start 與 end 兩天都會出現', () => {
    const recordCrossingMidnight = {
      id: 99,
      startTime: '2026-04-17T13:00:00.000Z',
      endTime: '2026-04-18T02:00:00.000Z',
      isAllDay: false,
    };
    const day1 = getRecordsForDate([recordCrossingMidnight], dayjs('2026-04-17T20:00:00.000Z'));
    const day2 = getRecordsForDate([recordCrossingMidnight], dayjs('2026-04-18T01:00:00.000Z'));
    expect(day1.map((r) => r.id)).toContain(99);
    expect(day2.map((r) => r.id)).toContain(99);
  });

  it('完全不相關的日期回傳空陣列', () => {
    const result = getRecordsForDate([allDayRecord], dayjs('2026-05-01T08:00:00.000Z'));
    expect(result).toEqual([]);
  });
});

describe('formatDuration', () => {
  it('全天單日顯示「1天」', () => {
    expect(formatDuration(allDayRecord)).toBe('1天');
  });

  it('全天多日顯示「N天」', () => {
    expect(formatDuration(multiDayAllDay)).toBe('3天');
  });

  it('整數小時顯示「N小時」', () => {
    expect(formatDuration(partialSameDay)).toBe('3小時');
  });

  it('非整數小時顯示一位小數', () => {
    expect(formatDuration(halfHourRecord)).toBe('2.5小時');
  });

  it('跨日的非全天紀錄回傳總分鐘換算', () => {
    expect(formatDuration(crossDayRecord)).toBe('8小時');
  });

  it('結束早於開始的紀錄回傳 0 小時', () => {
    const invalid = {
      isAllDay: false,
      startTime: '2026-04-17T10:00:00.000Z',
      endTime: '2026-04-17T08:00:00.000Z',
    };
    expect(formatDuration(invalid)).toBe('0小時');
  });
});

describe('formatRecordTimeRange', () => {
  it('全天單日顯示日期', () => {
    expect(formatRecordTimeRange(allDayRecord)).toBe('2026-04-17');
  });

  it('全天多日顯示日期區間', () => {
    expect(formatRecordTimeRange(multiDayAllDay)).toBe('2026-04-17 ~ 2026-04-19');
  });

  it('非全天同日顯示「日期 起 - 訖」', () => {
    const r = {
      isAllDay: false,
      startTime: '2026-04-17T01:00:00.000Z',
      endTime: '2026-04-17T04:00:00.000Z',
    };
    const out = formatRecordTimeRange(r);
    expect(out).toMatch(/^2026-04-17 \d{2}:\d{2} - \d{2}:\d{2}$/);
  });

  it('非全天跨日顯示完整起訖日期時間', () => {
    const r = {
      isAllDay: false,
      startTime: '2026-04-17T13:00:00.000Z',
      endTime: '2026-04-18T02:00:00.000Z',
    };
    const out = formatRecordTimeRange(r);
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2} - \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

describe('buildTypeClassName', () => {
  it('回傳已知假別對應的 class 名稱', () => {
    expect(buildTypeClassName('出差')).toBe('type-出差');
    expect(buildTypeClassName('請假')).toBe('type-請假');
    expect(buildTypeClassName('公假')).toBe('type-公假');
    expect(buildTypeClassName('Training')).toBe('type-training');
    expect(buildTypeClassName('FWA')).toBe('type-fwa');
  });

  it('未知假別回傳空字串', () => {
    expect(buildTypeClassName('Unknown')).toBe('');
    expect(buildTypeClassName(null)).toBe('');
    expect(buildTypeClassName(undefined)).toBe('');
  });
});
