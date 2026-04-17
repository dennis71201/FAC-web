import { useState, useMemo } from 'react';
import { Select, DatePicker, FloatButton } from 'antd';
import { PlusOutlined, CalendarOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { employees, sectionsData, departmentOptions } from '../mock/employees';
import { attendanceRecords } from '../mock/attendance';
import AttendanceCalendar from '../components/AttendanceCalendar';
import AttendanceSidebar from '../components/AttendanceSidebar';
import '../styles/attendance.css';

const activeEmployees = employees.filter((e) => e.isActive);

const legendItems = [
  { label: '出差', dotColor: '#22c55e', bg: 'rgba(34,197,94,0.08)', text: '#166534' },
  { label: '請假', dotColor: '#f97316', bg: 'rgba(249,115,22,0.08)', text: '#9a3412' },
  { label: '公假', dotColor: '#3b82f6', bg: 'rgba(59,130,246,0.08)', text: '#1e40af' },
  { label: 'Training', dotColor: '#a855f7', bg: 'rgba(168,85,247,0.08)', text: '#6b21a8' },
  { label: 'FWA', dotColor: '#06b6d4', bg: 'rgba(6,182,212,0.08)', text: '#155e75' },
];

export default function AttendanceRecord() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const year = currentMonth.year();
  const month = currentMonth.month();

  // Section options cascade from selected department
  const sectionOptions = useMemo(() => {
    if (!selectedDept) return [];
    return (sectionsData[selectedDept] || []).map((s) => ({ label: s, value: s }));
  }, [selectedDept]);

  // Filter employees by dept/section
  const filteredEmployees = useMemo(() => {
    let list = activeEmployees;
    if (selectedDept) {
      list = list.filter((e) => e.department === selectedDept);
    }
    if (selectedSection) {
      list = list.filter((e) => e.section === selectedSection);
    }
    return list;
  }, [selectedDept, selectedSection]);

  // Filter attendance records to matching employees
  const filteredRecords = useMemo(() => {
    const empIds = new Set(filteredEmployees.map((e) => e.key));
    return attendanceRecords.filter((r) => empIds.has(r.employeeId));
  }, [filteredEmployees]);

  const handleDeptChange = (value) => {
    setSelectedDept(value || null);
    setSelectedSection(null);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSidebarOpen(true);
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
            options={departmentOptions.map((d) => ({ label: d, value: d }))}
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
          <AttendanceCalendar
            year={year}
            month={month}
            records={filteredRecords}
            employees={filteredEmployees}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        </div>
        <div className="att-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
        <div className="att-sidebar-wrap">
          <AttendanceSidebar
            selectedDate={selectedDate}
            records={filteredRecords}
            employees={filteredEmployees}
          />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        tooltip="新增出勤紀錄"
      />
    </div>
  );
}
