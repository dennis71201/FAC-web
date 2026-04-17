import { useState, useMemo } from 'react';
import { Popconfirm } from 'antd';
import { UnorderedListOutlined, DownOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRecordsForDate, formatDuration } from '../../mock/attendance';

const tagStyleMap = {
  '出差': { background: 'rgba(34, 197, 94, 0.1)', color: '#166534' },
  '請假': { background: 'rgba(249, 115, 22, 0.1)', color: '#9a3412' },
  '公假': { background: 'rgba(59, 130, 246, 0.1)', color: '#1e40af' },
  'Training': { background: 'rgba(168, 85, 247, 0.1)', color: '#6b21a8' },
  'FWA': { background: 'rgba(6, 182, 212, 0.1)', color: '#155e75' },
};

export default function AttendanceSidebar({ selectedDate, records, employees, onDelete }) {
  const dateStr = selectedDate?.format('YYYY-MM-DD') || '';
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  // Get records for selected date (supports multi-day ranges)
  const dayRecords = useMemo(() => {
    return getRecordsForDate(records, dateStr);
  }, [records, dateStr]);

  // Calculate summary stats
  const summary = useMemo(() => {
    const counts = { '出差': new Set(), '請假': new Set(), '公假': new Set(), 'Training': new Set(), 'FWA': new Set() };
    dayRecords.forEach((r) => {
      if (counts[r.type]) counts[r.type].add(r.employeeId);
    });
    return {
      tripCount: counts['出差'].size,
      leaveCount: counts['請假'].size,
      officialCount: counts['公假'].size,
      trainingCount: counts['Training'].size,
      fwaCount: counts['FWA'].size,
    };
  }, [dayRecords]);

  // Group records by department-section → employees → records[]
  const detailGroups = useMemo(() => {
    const groups = {};
    dayRecords.forEach((r) => {
      const emp = employees.find((e) => e.key === r.employeeId);
      if (!emp) return;
      const groupKey = `${emp.department} - ${emp.section}`;
      if (!groups[groupKey]) groups[groupKey] = {};
      if (!groups[groupKey][r.employeeId]) {
        groups[groupKey][r.employeeId] = {
          employeeId: r.employeeId,
          name: emp.name,
          records: [],
        };
      }
      // Avoid duplicate record entries
      if (!groups[groupKey][r.employeeId].records.some((rec) => rec.id === r.id)) {
        groups[groupKey][r.employeeId].records.push(r);
      }
    });
    return groups;
  }, [dayRecords, employees]);

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
          <div className="stat-box">
            <div className="stat-label">出差</div>
            <div className="stat-value" style={{ color: '#166534' }}>
              {summary.tripCount}
              <span className="stat-unit">人</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">請假</div>
            <div className="stat-value" style={{ color: '#ea580c' }}>
              {summary.leaveCount}
              <span className="stat-unit">人</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">公假</div>
            <div className="stat-value" style={{ color: '#2563eb' }}>
              {summary.officialCount}
              <span className="stat-unit">人</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Training</div>
            <div className="stat-value" style={{ color: '#7c3aed' }}>
              {summary.trainingCount}
              <span className="stat-unit">人</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">FWA</div>
            <div className="stat-value" style={{ color: '#0891b2' }}>
              {summary.fwaCount}
              <span className="stat-unit">人</span>
            </div>
          </div>
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
                            const style = tagStyleMap[rec.type] || {};
                            return (
                              <span key={rec.id} className="leave-type-tag" style={style}>
                                {rec.type} {formatDuration(rec)}
                              </span>
                            );
                          })}
                        </div>
                        <DownOutlined className={`leave-chevron ${isExpanded ? 'open' : ''}`} />
                      </div>

                      {/* Expanded body */}
                      <div className="att-leave-row-body">
                        {person.records.map((rec) => {
                          const style = tagStyleMap[rec.type] || {};
                          return (
                            <div key={rec.id} className="att-record-detail">
                              <div className="att-record-top">
                                <div className="att-record-info">
                                  <span className="leave-type-tag" style={style}>
                                    {rec.type}
                                  </span>
                                  <span className="att-duration">{formatDuration(rec)}</span>
                                  {rec.isAllDay ? (
                                    <span className="att-date-range">
                                      {rec.startDate === rec.endDate
                                        ? rec.startDate
                                        : `${rec.startDate} ~ ${rec.endDate}`}
                                    </span>
                                  ) : (
                                    <span className="att-date-range">
                                      {rec.startTime} - {rec.endTime}
                                    </span>
                                  )}
                                </div>
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
