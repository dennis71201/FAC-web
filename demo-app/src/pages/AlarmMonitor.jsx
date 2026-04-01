import { useState, useMemo } from 'react';
import { Table, Tag, Select, Tabs, DatePicker, Row, Col, Badge, Typography, Tooltip, Card } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { alarmData, categoryTabs, priorityOptions, priorityColorMap } from '../mock/alarm';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const LINE_COLORS = [
  '#3b82f6', '#ef4444', '#f97316', '#22c55e', '#8b5cf6',
  '#06b6d4', '#ec4899', '#eab308', '#14b8a6', '#6366f1',
];

export default function AlarmMonitor() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [filterSite, setFilterSite] = useState(null);
  const [filterSection, setFilterSection] = useState(null);
  const [filterPriorities, setFilterPriorities] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [selectedEquipments, setSelectedEquipments] = useState([]);

  const sectionOptions = useMemo(() => {
    const sections = [...new Set(alarmData.map((d) => d.section))];
    return sections.map((s) => ({ label: s, value: s }));
  }, []);

  const siteOptions = useMemo(() => {
    const sites = [...new Set(alarmData.map((d) => d.site))];
    return sites.map((s) => ({ label: s, value: s }));
  }, []);

  const filteredData = useMemo(() => {
    return alarmData.filter((item) => {
      if (activeTab !== 'ALL' && item.category !== activeTab) return false;
      if (filterSite && item.site !== filterSite) return false;
      if (filterSection && item.section !== filterSection) return false;
      if (filterPriorities.length > 0 && !filterPriorities.includes(item.priority)) return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const itemTime = dayjs(item.time);
        if (!itemTime.isBetween(dateRange[0].startOf('day'), dateRange[1].endOf('day'), null, '[]')) return false;
      }
      return true;
    });
  }, [activeTab, filterSite, filterSection, filterPriorities, dateRange]);

  // All unique equipment tag names from filtered data
  const equipmentOptions = useMemo(() => {
    const tags = [...new Set(filteredData.map((d) => d.tagName))].sort();
    return tags.map((t) => ({ label: t, value: t }));
  }, [filteredData]);

  // Chart data: daily trend line chart for selected equipments
  const trendChartData = useMemo(() => {
    const targets = selectedEquipments.length > 0 ? selectedEquipments : [];
    if (targets.length === 0) return { data: [], keys: [] };

    // Collect all dates across filtered data
    const allDates = new Set();
    filteredData.forEach((d) => allDates.add(dayjs(d.time).format('MM/DD')));

    const dayMap = {};
    filteredData.forEach((d) => {
      if (!targets.includes(d.tagName)) return;
      const date = dayjs(d.time).format('MM/DD');
      if (!dayMap[date]) dayMap[date] = { date };
      dayMap[date][d.tagName] = (dayMap[date][d.tagName] || 0) + d.count;
    });

    // Fill missing dates with 0 for each selected equipment
    allDates.forEach((date) => {
      if (!dayMap[date]) dayMap[date] = { date };
      targets.forEach((tag) => {
        if (dayMap[date][tag] === undefined) dayMap[date][tag] = 0;
      });
    });

    return {
      data: Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date)),
      keys: targets,
    };
  }, [filteredData, selectedEquipments]);

  const columns = [
    {
      title: 'Time',
      dataIndex: 'time',
      width: 160,
      defaultSortOrder: 'descend',
      sorter: (a, b) => dayjs(a.time).unix() - dayjs(b.time).unix(),
    },
    { title: 'Site', dataIndex: 'site', width: 70 },
    { title: 'Section', dataIndex: 'section', width: 130 },
    {
      title: 'Tag Name',
      dataIndex: 'tagName',
      width: 170,
      render: (val) => <Text code style={{ fontSize: 12 }}>{val}</Text>,
    },
    { title: 'Message', dataIndex: 'message', width: 170 },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: { showTitle: false },
      width: 220,
      render: (val) => (
        <Tooltip placement="topLeft" title={val}>
          {val}
        </Tooltip>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      width: 80,
      render: (val) => <Tag color={priorityColorMap[val]}>{val}</Tag>,
      sorter: (a, b) => a.priority.localeCompare(b.priority),
    },
    {
      title: 'Count',
      dataIndex: 'count',
      width: 70,
      render: (val) => <Badge count={val} style={{ backgroundColor: '#64748B' }} />,
      sorter: (a, b) => a.count - b.count,
    },
  ];

  const tabItems = categoryTabs.map((tab) => ({
    key: tab,
    label: tab === 'ALL' ? 'ALL' : tab,
  }));

  return (
    <div>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Alarm</Title>
      </div>

      <div className="filter-bar">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 12 }}
          size="small"
        />
        <Row gutter={12} align="middle">
          <Col>
            <Select
              placeholder="廠區"
              allowClear
              style={{ width: 100 }}
              value={filterSite}
              onChange={setFilterSite}
              options={siteOptions}
            />
          </Col>
          <Col>
            <Select
              placeholder="Section"
              allowClear
              style={{ width: 160 }}
              value={filterSection}
              onChange={setFilterSection}
              options={sectionOptions}
            />
          </Col>
          <Col>
            <Select
              placeholder="Priority"
              mode="multiple"
              allowClear
              style={{ width: 200 }}
              value={filterPriorities}
              onChange={setFilterPriorities}
              options={priorityOptions}
            />
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: 260 }}
            />
          </Col>
        </Row>
      </div>

      {/* Daily Alarm Trend — Line Chart per equipment */}
      <Card
        size="small"
        title="設備每日 Alarm 趨勢"
        extra={
          <Select
            mode="multiple"
            placeholder="選擇設備查看趨勢"
            allowClear
            style={{ width: 420 }}
            value={selectedEquipments}
            onChange={setSelectedEquipments}
            options={equipmentOptions}
            maxTagCount={3}
            maxTagTextLength={18}
          />
        }
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: '12px 8px' } }}
      >
        {selectedEquipments.length === 0 ? (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            請從右上方選擇設備以查看趨勢圖
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendChartData.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <RTooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              {trendChartData.keys.map((tag, i) => (
                <Line
                  key={tag}
                  type="monotone"
                  dataKey={tag}
                  name={tag}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="table-card">
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 15, showSizeChanger: false, showTotal: (total) => `共 ${total} 筆` }}
          size="middle"
          scroll={{ x: 1070 }}
        />
      </div>
    </div>
  );
}
