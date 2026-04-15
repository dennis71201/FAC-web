import { useMemo } from 'react';
import { UnorderedListOutlined } from '@ant-design/icons';

const tagStyleMap = {
  '出差': { background: 'rgba(34, 197, 94, 0.1)', color: '#166534' },
  '請假': { background: 'rgba(249, 115, 22, 0.1)', color: '#9a3412' },
  '公假': { background: 'rgba(59, 130, 246, 0.1)', color: '#1e40af' },
};

export default function AttendanceSidebar({ selectedDate, records, employees }) {
  const dateStr = selectedDate?.format('YYYY-MM-DD') || '';

  // Get records for selected date
  const dayRecords = useMemo(() => {
    return records.filter((r) => r.date === dateStr);
  }, [records, dateStr]);

  // Calculate summary stats
  const summary = useMemo(() => {
    const counts = { '出差': new Set(), '請假': new Set(), '公假': new Set() };
    dayRecords.forEach((r) => {
      if (counts[r.type]) counts[r.type].add(r.employeeId);
    });
    return {
      tripCount: counts['出差'].size,
      leaveCount: counts['請假'].size,
      officialCount: counts['公假'].size,
    };
  }, [dayRecords]);

  // Group all non-regular employees by department-section
  const detailGroups = useMemo(() => {
    const groups = {};
    dayRecords.forEach((r) => {
      const emp = employees.find((e) => e.key === r.employeeId);
      if (!emp) return;
      const groupKey = `${emp.department} - ${emp.section}`;
      if (!groups[groupKey]) groups[groupKey] = [];
      if (!groups[groupKey].some((item) => item.employeeId === r.employeeId && item.type === r.type)) {
        groups[groupKey].push({
          employeeId: r.employeeId,
          name: emp.name,
          type: r.type,
          note: r.note,
        });
      }
    });
    return groups;
  }, [dayRecords, employees]);

  return (
    <div className="att-sidebar">
      {/* Summary Card */}
      <div className="att-sidebar-card">
        <div className="card-header">
          <h3>日出勤摘要</h3>
          <span className="card-date-badge">{dateStr}</span>
        </div>
        <div className="card-stats card-stats-3">
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
            此日無出差/請假/公假紀錄
          </div>
        ) : (
          Object.entries(detailGroups).map(([groupLabel, items]) => (
            <div key={groupLabel} className="att-leave-group">
              <div className="att-leave-group-header">
                <span className="group-bar" />
                <span className="group-label">{groupLabel}</span>
              </div>
              <div className="att-leave-group-list">
                {items.map((item, i) => {
                  const style = tagStyleMap[item.type] || {};
                  return (
                    <div key={i} className="att-leave-row">
                      <span className="leave-name">{item.name}</span>
                      <span className="leave-type-tag" style={style}>
                        {item.type}
                      </span>
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
