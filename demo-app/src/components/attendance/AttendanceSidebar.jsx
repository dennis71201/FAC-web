import { useState, useMemo } from 'react';
import { Popconfirm } from 'antd';
import { UnorderedListOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatDuration, formatRecordTimeRange, getRecordsForDate } from '../../utils/attendance';
import { useAuth } from '../../context/AuthContext';

const summaryTypeOrder = ['出差', '請假', '公假', 'Training', 'FWA'];

export default function AttendanceSidebar({ selectedDate, records, onDelete }) {
  const dateStr = selectedDate?.format('YYYY-MM-DD') || '';
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrator';

  const canDelete = (rec) => isAdmin || Number(rec.employeeId) === Number(user?.employeeId);

  // Get records for selected date (supports multi-day ranges)
  const dayRecords = useMemo(() => {
    return getRecordsForDate(records, dateStr);
  }, [records, dateStr]);

  // Calculate summary stats
  const summary = useMemo(() => {
    const counts = {
      出差: new Set(),
      請假: new Set(),
      公假: new Set(),
      Training: new Set(),
      FWA: new Set(),
    };

    dayRecords.forEach((r) => {
      const typeName = r.attendanceTypeName;
      if (counts[typeName]) counts[typeName].add(r.employeeId);
    });

    return {
      tripCount: counts.出差.size,
      leaveCount: counts.請假.size,
      officialCount: counts.公假.size,
      trainingCount: counts.Training.size,
      fwaCount: counts.FWA.size,
    };
  }, [dayRecords]);

  // Group records by department-section → employees → records[]
  const detailGroups = useMemo(() => {
    const groups = {};

    dayRecords.forEach((r) => {
      const groupKey = `${r.employeeDepartment || '未分類'} - ${r.employeeSection || '未分類'}`;
      if (!groups[groupKey]) groups[groupKey] = {};

      if (!groups[groupKey][r.employeeId]) {
        groups[groupKey][r.employeeId] = {
          employeeId: r.employeeId,
          name: r.employeeName || `ID-${r.employeeId}`,
          records: [],
        };
      }

      // Avoid duplicate record entries
      if (!groups[groupKey][r.employeeId].records.some((rec) => rec.id === r.id)) {
        groups[groupKey][r.employeeId].records.push(r);
      }
    });

    return groups;
  }, [dayRecords]);

  const summaryStatItems = [
    { key: summaryTypeOrder[0], label: '出差', value: summary.tripCount, color: '#166534' },
    { key: summaryTypeOrder[1], label: '請假', value: summary.leaveCount, color: '#ea580c' },
    { key: summaryTypeOrder[2], label: '公假', value: summary.officialCount, color: '#2563eb' },
    { key: summaryTypeOrder[3], label: 'Training', value: summary.trainingCount, color: '#7c3aed' },
    { key: summaryTypeOrder[4], label: 'FWA', value: summary.fwaCount, color: '#0891b2' },
  ];

  const getTagStyle = (record) => ({
    background: `${record.attendanceTypeColor}1A`,
    color: record.attendanceTypeColor,
  });

  const handleToggle = (employeeId) => {
    setExpandedEmployee((prev) => (prev === employeeId ? null : employeeId));
  };

  return (
    <div className="att-sidebar">
      {/* Summary Card */}
      <div className="att-sidebar-card">
        <div className="card-header">
          <h3>日出勤摘要</h3>
          <span className="card-date-badge">{dateStr}</span>
        </div>
        <div className="card-stats card-stats-5">
          {summaryStatItems.map((item) => (
            <div className="stat-box" key={item.key}>
              <div className="stat-label">{item.label}</div>
              <div className="stat-value" style={{ color: item.color }}>
                {item.value}
                <span className="stat-unit">人</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail List Card */}
      <div className="att-sidebar-card">
        <div className="leave-list-title">
          <UnorderedListOutlined />
          人員清單
        </div>
        {Object.keys(detailGroups).length === 0 ? (
          <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>
            此日無出勤紀錄
          </div>
        ) : (
          Object.entries(detailGroups).map(([groupLabel, empMap]) => (
            <div key={groupLabel} className="att-leave-group">
              <div className="att-leave-group-header">
                <span className="group-bar" />
                <span className="group-label">{groupLabel}</span>
              </div>
              <div className="att-leave-group-list">
                {Object.values(empMap).map((person) => {
                  const isExpanded = expandedEmployee === person.employeeId;
                  return (
                    <div
                      key={person.employeeId}
                      className={`att-leave-row ${isExpanded ? 'expanded' : ''}`}
                    >
                      {/* Collapsed header — always visible */}
                      <div
                        className="att-leave-row-header"
                        onClick={() => handleToggle(person.employeeId)}
                      >
                        <span className="leave-name">{person.name}</span>
                        <div className="leave-tags-inline">
                          {person.records.map((rec) => {
                            const style = getTagStyle(rec);
                            return (
                              <span key={rec.id} className="leave-type-tag" style={style}>
                                {rec.attendanceTypeName} {formatDuration(rec)}
                              </span>
                            );
                          })}
                        </div>
                        <DownOutlined className={`leave-chevron ${isExpanded ? 'open' : ''}`} />
                      </div>

                      {/* Expanded body */}
                      <div className="att-leave-row-body">
                        {person.records.map((rec) => {
                          const style = getTagStyle(rec);
                          return (
                            <div key={rec.id} className="att-record-detail">
                              <div className="att-record-top">
                                <div className="att-record-info">
                                  <span className="leave-type-tag" style={style}>
                                    {rec.attendanceTypeName}
                                  </span>
                                  <span className="att-duration">{formatDuration(rec)}</span>
                                  <span className="att-date-range">
                                    {formatRecordTimeRange(rec)}
                                  </span>
                                </div>
                                {canDelete(rec) && (
                                  <Popconfirm
                                    title="確認刪除此紀錄？"
                                    onConfirm={() => onDelete?.(rec.id)}
                                    okText="刪除"
                                    cancelText="取消"
                                    placement="left"
                                  >
                                    <button
                                      className="att-delete-btn"
                                      aria-label="刪除紀錄"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <DeleteOutlined />
                                    </button>
                                  </Popconfirm>
                                )}
                              </div>
                              {rec.note && (
                                <div className="att-record-note">{rec.note}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
