import { useState, useEffect, useCallback } from 'react';
import { DatePicker, TimePicker, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { attendanceTypes } from '../../mock/attendance';

const typeKeys = Object.keys(attendanceTypes);

const defaultStartTime = dayjs().hour(9).minute(0).second(0);
const defaultEndTime = dayjs().hour(18).minute(0).second(0);

export default function AddAttendanceModal({ visible, onClose, onSubmit, defaultDate }) {
  const [selectedType, setSelectedType] = useState(null);
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [note, setNote] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedType(null);
      setIsAllDay(false);
      setStartDate(defaultDate || dayjs());
      setEndDate(defaultDate || dayjs());
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
      setNote('');
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

  const canSubmit = selectedType && startDate && endDate;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleStartDateChange = (d) => {
    setStartDate(d);
    if (d && endDate && d.isAfter(endDate, 'day')) {
      setEndDate(d);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      type: selectedType,
      startDate,
      endDate,
      startTime: isAllDay ? null : startTime,
      endTime: isAllDay ? null : endTime,
      isAllDay,
      note,
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
              {typeKeys.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`att-modal-chip ${selectedType === type ? 'active' : ''}`}
                  data-type={type}
                  onClick={() => setSelectedType(type)}
                >
                  {attendanceTypes[type].label}
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
                  onChange={(e) => setIsAllDay(e.target.checked)}
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
                    onChange={setStartTime}
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
                  onChange={setEndDate}
                  allowClear={false}
                  disabledDate={(d) => startDate && d.isBefore(startDate, 'day')}
                  style={{ width: '100%' }}
                />
                {!isAllDay && (
                  <TimePicker
                    value={endTime}
                    onChange={setEndTime}
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
        </div>

        {/* Actions */}
        <div className="att-modal-actions">
          <button type="button" className="att-modal-btn-cancel" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="att-modal-btn-submit"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            提交申請
          </button>
        </div>
      </div>
    </div>
  );
}
