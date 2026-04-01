import { useState, useMemo } from 'react';
import { Calendar, Radio, Select, Table, Tag, Badge, Card, Row, Col, Typography, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { employees } from '../mock/employees';
import { attendanceRecords, attendanceTypes } from '../mock/attendance';

const { Title } = Typography;

const activeEmployees = employees.filter((e) => e.isActive);

const typeTagColor = {
  work: 'green',
  training: 'blue',
  '特休': 'purple',
  '病假': 'red',
  '公假': 'cyan',
  '事假': 'orange',
};

export default function AttendanceSheet() {
  const [viewMode, setViewMode] = useState('individual');
  const [selectedEmployee, setSelectedEmployee] = useState(activeEmployees[0]?.key);
  const [managerDate, setManagerDate] = useState(dayjs('2026-03-20'));

  // Individual view: calendar cell render
  const cellRender = (current, info) => {
    if (info.type !== 'date') return info.originNode;

    const dateStr = current.format('YYYY-MM-DD');
    const record = attendanceRecords.find(
      (r) => r.employeeId === selectedEmployee && r.date === dateStr
    );

    if (!record) return info.originNode;

    const typeInfo = attendanceTypes[record.type];
    const label = record.type === 'work' ? `${record.hours}h` : typeInfo?.label || record.type;

    return (
      <div style={{ position: 'relative' }}>
        {info.originNode}
        <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)' }}>
          <Tag
            color={typeTagColor[record.type]}
            style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0 }}
          >
            {label}
          </Tag>
        </div>
      </div>
    );
  };

  // Manager view: table data for selected date
  const managerTableData = useMemo(() => {
    const dateStr = managerDate.format('YYYY-MM-DD');
    return activeEmployees.map((emp) => {
      const record = attendanceRecords.find(
        (r) => r.employeeId === emp.key && r.date === dateStr
      );
      return {
        key: emp.key,
        name: emp.name,
        department: emp.department,
        type: record?.type || '-',
        hours: record?.hours ?? '-',
      };
    });
  }, [managerDate]);

  const managerColumns = [
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '部門', dataIndex: 'department', width: 80 },
    {
      title: '出勤類型',
      dataIndex: 'type',
      width: 120,
      render: (val) => {
        if (val === '-') return <span style={{ color: '#ccc' }}>-</span>;
        const info = attendanceTypes[val];
        return <Tag color={typeTagColor[val]}>{info?.label || val}</Tag>;
      },
    },
    {
      title: '工時',
      dataIndex: 'hours',
      width: 80,
      render: (val) => (val === '-' || val === 0) ? <span style={{ color: '#ccc' }}>{val}</span> : `${val}h`,
    },
  ];

  // Summary stats for manager view
  const summary = useMemo(() => {
    const total = managerTableData.length;
    const present = managerTableData.filter((r) => r.type === 'work' || r.type === 'training').length;
    const leave = managerTableData.filter((r) => ['特休', '病假', '公假', '事假'].includes(r.type)).length;
    const absent = total - present - leave;
    return { total, present, leave, absent };
  }, [managerTableData]);

  return (
    <div>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Attendance Sheet</Title>
        <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)} buttonStyle="solid">
          <Radio.Button value="individual">個人視角</Radio.Button>
          <Radio.Button value="manager">主管視角</Radio.Button>
        </Radio.Group>
      </div>

      {viewMode === 'individual' ? (
        <div>
          <div className="filter-bar">
            <Row gutter={12} align="middle">
              <Col>
                <span style={{ marginRight: 8, color: '#64748B' }}>員工：</span>
                <Select
                  style={{ width: 160 }}
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  options={activeEmployees.map((e) => ({ label: `${e.name} (${e.department})`, value: e.key }))}
                />
              </Col>
              <Col>
                <span style={{ marginLeft: 16, fontSize: 12, color: '#94a3b8' }}>
                  點擊日期查看出勤狀態，顏色標記代表不同類型
                </span>
              </Col>
            </Row>
            <Row gutter={8} style={{ marginTop: 8 }}>
              {Object.entries(attendanceTypes).map(([key, val]) => (
                <Col key={key}>
                  <Tag color={typeTagColor[key]} style={{ fontSize: 11 }}>{val.label}</Tag>
                </Col>
              ))}
            </Row>
          </div>
          <Card style={{ border: '1px solid #e2e8f0' }}>
            <Calendar
              cellRender={cellRender}
              defaultValue={dayjs('2026-03-15')}
            />
          </Card>
        </div>
      ) : (
        <div>
          <div className="filter-bar">
            <Row gutter={16} align="middle">
              <Col>
                <span style={{ marginRight: 8, color: '#64748B' }}>日期：</span>
                <DatePicker
                  value={managerDate}
                  onChange={(d) => d && setManagerDate(d)}
                  style={{ width: 160 }}
                />
              </Col>
              <Col flex="auto" style={{ textAlign: 'right' }}>
                <Badge color="#22c55e" text={`出勤 ${summary.present}`} style={{ marginRight: 16 }} />
                <Badge color="#f59e0b" text={`請假 ${summary.leave}`} style={{ marginRight: 16 }} />
                <Badge color="#94a3b8" text={`未登記 ${summary.absent}`} />
              </Col>
            </Row>
          </div>
          <div className="table-card">
            <Table
              columns={managerColumns}
              dataSource={managerTableData}
              pagination={false}
              size="middle"
            />
          </div>
        </div>
      )}
    </div>
  );
}
