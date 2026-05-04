import { useState, useMemo, useEffect, useCallback } from 'react';
import { Alert, DatePicker, FloatButton, Select, Spin, message } from 'antd';
import { PlusOutlined, CalendarOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';
import AttendanceSidebar from '../components/attendance/AttendanceSidebar';
import AddAttendanceModal from '../components/attendance/AddAttendanceModal';
import { useAuth } from '../context/AuthContext';
import {
  createAttendanceRecord,
  deleteAttendanceRecord,
  getAttendanceRecords,
  getAttendanceTypes,
} from '../services/attendanceService';
import '../styles/attendance.css';

export default function AttendanceRecord() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [records, setRecords] = useState([]);
  const [attendanceTypes, setAttendanceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const year = currentMonth.year();
  const month = currentMonth.month() + 1;

  const loadAttendanceTypes = useCallback(async () => {
    const typeList = await getAttendanceTypes();
    setAttendanceTypes(typeList);
  }, []);

  const loadAttendanceRecords = useCallback(async () => {
    if (!user) return;

    const query = {
      year,
      month,
    };

    const result = await getAttendanceRecords(query);
    setRecords(result);
  }, [user, year, month]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;
    const initialize = async () => {
      setLoading(true);
      setError('');
      try {
        if (attendanceTypes.length === 0) {
          await loadAttendanceTypes();
        }
        await loadAttendanceRecords();
      } catch (apiError) {
        if (!mounted) return;
        setError(apiError.message || '載入出勤資料失敗，請稍後再試。');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();
    return () => {
      mounted = false;
    };
  }, [user, loadAttendanceTypes, loadAttendanceRecords, attendanceTypes.length]);

  const departmentOptions = useMemo(() => {
    const deptSet = new Set(records.map((record) => record.employeeDepartment).filter(Boolean));
    return Array.from(deptSet).sort().map((dept) => ({ label: dept, value: dept }));
  }, [records]);

  const sectionOptions = useMemo(() => {
    if (!selectedDept) return [];

    const sectionSet = new Set(
      records
        .filter((record) => record.employeeDepartment === selectedDept)
        .map((record) => record.employeeSection)
        .filter(Boolean)
    );

    return Array.from(sectionSet).sort().map((section) => ({ label: section, value: section }));
  }, [selectedDept, records]);

  const filteredRecords = useMemo(() => {
    let list = records;

    if (selectedDept) {
      list = list.filter((record) => record.employeeDepartment === selectedDept);
    }

    if (selectedSection) {
      list = list.filter((record) => record.employeeSection === selectedSection);
    }

    return list;
  }, [selectedDept, selectedSection, records]);

  const legendItems = useMemo(
    () => attendanceTypes.map((type) => ({
      label: type.name,
      dotColor: type.color,
      bg: `${type.color}1A`,
      text: type.color,
    })),
    [attendanceTypes]
  );

  const handleDeleteRecord = async (recordId) => {
    try {
      await deleteAttendanceRecord(recordId);
      setRecords((prev) => prev.filter((record) => record.id !== recordId));
      message.success('出勤紀錄已刪除');
    } catch (apiError) {
      message.error(apiError.message || '刪除失敗，請稍後再試。');
    }
  };

  const handleAddRecord = async (data) => {
    if (!user) return;

    const payload = {
      employeeId: Number(user.employeeId),
      attendanceTypeId: data.attendanceTypeId,
      startTime: data.startTime,
      endTime: data.endTime,
      isAllDay: data.isAllDay,
      note: data.note || null,
    };

    setSubmitting(true);
    try {
      await createAttendanceRecord(payload);
      await loadAttendanceRecords();
      setModalVisible(false);
      message.success('出勤紀錄新增成功');
    } catch (apiError) {
      message.error(apiError.message || '新增失敗，請稍後再試。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeptChange = (value) => {
    setSelectedDept(value || null);
    setSelectedSection(null);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSidebarOpen(true);
  };

  const handleReload = async () => {
    setError('');
    setLoading(true);
    try {
      await loadAttendanceTypes();
      await loadAttendanceRecords();
    } catch (apiError) {
      setError(apiError.message || '載入出勤資料失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-page">
      {/* Header */}
      <div className="att-header">
        <div className="att-header-title">
          <h4>出勤行事曆</h4>
          <p>檢視與管理團隊的出勤狀況與請假紀錄</p>
        </div>
        <div className="att-header-filters">
          <DatePicker
            picker="month"
            value={currentMonth}
            onChange={(d) => d && setCurrentMonth(d)}
            format="YYYY 年 MM 月"
            allowClear={false}
            suffixIcon={<CalendarOutlined />}
            style={{ width: 160 }}
          />
          <Select
            placeholder="部門"
            allowClear
            value={selectedDept || undefined}
            onChange={handleDeptChange}
            options={departmentOptions}
            style={{ width: 120 }}
          />
          <Select
            placeholder="課別"
            allowClear
            value={selectedSection || undefined}
            onChange={(v) => setSelectedSection(v || null)}
            options={sectionOptions}
            disabled={!selectedDept}
            style={{ width: 120 }}
          />
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          title={error}
          action={
            <a onClick={handleReload}>重新載入</a>
          }
          style={{ marginBottom: 12 }}
        />
      )}

      {/* Legend */}
      <div className="att-legend">
        <span className="att-legend-label">類別標記</span>
        {legendItems.map((item) => (
          <div
            key={item.label}
            className="att-legend-item"
            style={{ background: item.bg, color: item.text }}
          >
            <span className="att-legend-dot" style={{ background: item.dotColor }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className={`att-main ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <div className="att-calendar-wrap">
          {loading ? (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
              <Spin size="large" />
            </div>
          ) : (
            <AttendanceCalendar
              year={year}
              month={month - 1}
              records={filteredRecords}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />
          )}
        </div>
        <div className="att-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
        <div className="att-sidebar-wrap">
          <AttendanceSidebar
            selectedDate={selectedDate}
            records={filteredRecords}
            onDelete={handleDeleteRecord}
          />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        tooltip="新增出勤紀錄"
        onClick={() => setModalVisible(true)}
      />

      <AddAttendanceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddRecord}
        defaultDate={selectedDate}
        attendanceTypes={attendanceTypes}
        submitting={submitting}
      />
    </div>
  );
}
