import { useState, useEffect, useCallback } from 'react';
import { Alert, DatePicker, TimePicker, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const defaultStartTime = dayjs().hour(9).minute(0).second(0);
const defaultEndTime = dayjs().hour(18).minute(0).second(0);

export default function AddAttendanceModal({
  visible,
  onClose,
  onSubmit,
  defaultDate,
  attendanceTypes,
  submitting,
}) {
  const typeOptions = attendanceTypes || [];
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [note, setNote] = useState('');
  const [timeError, setTimeError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedTypeId(null);
      setIsAllDay(false);
      setStartDate(defaultDate || dayjs());
      setEndDate(defaultDate || dayjs());
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
      setNote('');
      setTimeError('');
    }
  }, [visible, defaultDate]);

  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, handleKeyDown]);

  if (!visible) return null;

  const canSubmit = selectedTypeId && startDate && endDate && !timeError;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleStartDateChange = (d) => {
    setStartDate(d);
    if (d && endDate && d.isAfter(endDate, 'day')) {
      setEndDate(d);
    }
    setTimeError('');
  };

  const combineDateTime = (dateValue, timeValue) => dateValue
    .hour(timeValue.hour())
    .minute(timeValue.minute())
    .second(0)
    .millisecond(0);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const rangeStart = isAllDay
      ? startDate.startOf('day')
      : combineDateTime(startDate, startTime);
    const rangeEnd = isAllDay
      ? endDate.endOf('day')
      : combineDateTime(endDate, endTime);

    if (!rangeEnd.isAfter(rangeStart)) {
      setTimeError('結束時間需晚於開始時間，跨日時請調整日期。');
      return;
    }

    onSubmit({
      attendanceTypeId: selectedTypeId,
      startTime: rangeStart.toISOString(),
      endTime: rangeEnd.toISOString(),
      isAllDay,
      note: note.trim(),
    });
  };

  return (
    <div className="att-modal-overlay" onClick={handleOverlayClick}>
      <div className="att-modal-card" role="dialog" aria-modal="true" aria-label="新增出勤紀錄">
        {/* Header */}
        <div className="att-modal-header">
          <h2>新增出勤紀錄</h2>
          <button className="att-modal-close" onClick={onClose} aria-label="關閉">
            <CloseOutlined />
          </button>
        </div>

        {/* Body */}
        <div className="att-modal-body">
          {/* Type Selection */}
          <div>
            <span className="att-modal-label">出勤類別</span>
            <div className="att-modal-chips">
              {typeOptions.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`att-modal-chip ${selectedTypeId === type.id ? 'active' : ''}`}
                  data-type={type.name}
                  onClick={() => {
                    setSelectedTypeId(type.id);
                    setTimeError('');
                  }}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <div className="att-modal-time-header">
              <span className="att-modal-label">選擇時間</span>
              <label className="att-modal-allday">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => {
                    setIsAllDay(e.target.checked);
                    setTimeError('');
                  }}
                />
                <span>全天</span>
              </label>
            </div>
            <div className="att-modal-time-grid">
              {/* Start */}
              <div className="att-modal-time-col">
                <span className="col-label">開始</span>
                <DatePicker
                  value={startDate}
                  onChange={handleStartDateChange}
                  allowClear={false}
                  style={{ width: '100%' }}
                />
                {!isAllDay && (
                  <TimePicker
                    value={startTime}
                    onChange={(value) => {
                      if (value) {
                        setStartTime(value);
                        setTimeError('');
                      }
                    }}
                    format="hh:mm A"
                    use12Hours
                    allowClear={false}
                    style={{ width: '100%' }}
                  />
                )}
              </div>
              {/* End */}
              <div className="att-modal-time-col">
                <span className="col-label">結束</span>
                <DatePicker
                  value={endDate}
                  onChange={(value) => {
                    setEndDate(value);
                    setTimeError('');
                  }}
                  allowClear={false}
                  disabledDate={(d) => startDate && d.isBefore(startDate, 'day')}
                  style={{ width: '100%' }}
                />
                {!isAllDay && (
                  <TimePicker
                    value={endTime}
                    onChange={(value) => {
                      if (value) {
                        setEndTime(value);
                        setTimeError('');
                      }
                    }}
                    format="hh:mm A"
                    use12Hours
                    allowClear={false}
                    style={{ width: '100%' }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="att-modal-note">
            <span className="att-modal-label">備註 (選填)</span>
            <Input.TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="請輸入出勤事由..."
              rows={2}
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </div>

          {timeError && <Alert type="error" showIcon title={timeError} />}
        </div>

        {/* Actions */}
        <div className="att-modal-actions">
          <button type="button" className="att-modal-btn-cancel" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="att-modal-btn-submit"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
          >
            {submitting ? '提交中...' : '提交申請'}
          </button>
        </div>
      </div>
    </div>
  );
}
