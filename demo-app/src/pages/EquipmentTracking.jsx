import { useState, useMemo } from 'react';
import {
  Table, Tag, Select, Button, Modal, Form, Input, Tabs, Space, Row, Col,
  message, Typography, Tooltip, Divider, DatePicker, Alert,
} from 'antd';
import { PlusOutlined, EditOutlined, HistoryOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  equipmentData, siteOptions, categoryOptions, statusOptions, statusColorMap, getStatusAtDate,
} from '../mock/equipment';

const { Title, Text } = Typography;

const TODAY = '2026-03-29';

const groupKey = (item) => `${item.site}||${item.category}||${item.mainSystem}||${item.subSystem}`;

export default function EquipmentTracking() {
  const [data, setData] = useState(equipmentData);
  const [filterSite, setFilterSite] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [filterDate, setFilterDate] = useState(null); // null = today/current
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [addForm] = Form.useForm();

  const isHistoryMode = filterDate && filterDate.format('YYYY-MM-DD') < TODAY;
  const targetDateStr = filterDate ? filterDate.format('YYYY-MM-DD') : TODAY;

  // Filter + resolve status at target date
  const resolvedData = useMemo(() => {
    return data
      .filter((item) => {
        if (filterSite && item.site !== filterSite) return false;
        if (activeCategory !== 'ALL' && item.category !== activeCategory) return false;
        return true;
      })
      .map((item) => {
        if (!filterDate || targetDateStr >= TODAY) return item;
        const { status, remark } = getStatusAtDate(item, targetDateStr);
        return { ...item, status, remark };
      });
  }, [data, filterSite, activeCategory, filterDate, targetDateStr]);

  // Group equipment
  const groupedData = useMemo(() => {
    const groups = {};
    resolvedData.forEach((item) => {
      const key = groupKey(item);
      if (!groups[key]) {
        groups[key] = {
          key,
          site: item.site,
          category: item.category,
          mainSystem: item.mainSystem,
          subSystem: item.subSystem,
          redundancy: item.redundancy,
          machines: [],
        };
      }
      groups[key].machines.push(item);
    });
    return Object.values(groups);
  }, [resolvedData]);

  const categoryTabItems = [
    { key: 'ALL', label: 'ALL' },
    ...categoryOptions.map((c) => ({ key: c, label: c })),
  ];

  const openEdit = (group) => {
    setEditingGroup({ ...group, machines: group.machines.map((m) => ({ ...m })) });
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (!editingGroup) return;
    setData((prev) => {
      const updated = [...prev];
      editingGroup.machines.forEach((machine) => {
        const idx = updated.findIndex((d) => d.key === machine.key);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], status: machine.status, remark: machine.remark, date: dayjs().format('YYYY-MM-DD') };
        }
      });
      return updated;
    });
    setEditModalOpen(false);
    message.success('設備狀態更新成功');
  };

  const updateMachineInEdit = (machineKey, field, value) => {
    setEditingGroup((prev) => ({
      ...prev,
      machines: prev.machines.map((m) =>
        m.key === machineKey ? { ...m, [field]: value } : m
      ),
    }));
  };

  const handleAdd = () => {
    addForm.validateFields().then((values) => {
      const newRecord = {
        ...values,
        key: String(Date.now()),
        date: dayjs().format('YYYY-MM-DD'),
        remark: values.remark || '',
        history: [],
      };
      setData((prev) => [newRecord, ...prev]);
      setAddModalOpen(false);
      addForm.resetFields();
      message.success('設備新增成功');
    });
  };

  const columns = [
    { title: 'Site', dataIndex: 'site', width: 60 },
    { title: 'Main System', dataIndex: 'mainSystem', width: 140 },
    { title: 'Sub System', dataIndex: 'subSystem', width: 130 },
    {
      title: 'N+R',
      dataIndex: 'redundancy',
      width: 60,
      render: (val) => <Text type="secondary" style={{ fontSize: 12 }}>{val}</Text>,
    },
    {
      title: 'Equipment',
      key: 'machines',
      render: (_, record) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {record.machines.map((m) => (
            <Tooltip
              key={m.key}
              title={
                <span>
                  {m.equipment}<br />
                  狀態：{m.status}
                  {m.remark && <><br />備註：{m.remark}</>}
                </span>
              }
            >
              <div
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  padding: '2px 8px',
                  borderRadius: 4,
                  border: `1.5px solid ${statusColorMap[m.status]}`,
                  background: `${statusColorMap[m.status]}18`,
                  fontSize: 12,
                  cursor: 'default',
                  whiteSpace: 'nowrap',
                  minWidth: 70,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: statusColorMap[m.status],
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: '#334155', fontWeight: 500 }}>{m.equipment}</span>
                </div>
                {m.remark ? (
                  <div style={{ fontSize: 10, color: '#64748B', lineHeight: 1.2, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.remark}
                  </div>
                ) : null}
              </div>
            </Tooltip>
          ))}
        </div>
      ),
    },
    ...( isHistoryMode ? [] : [{
      title: '',
      width: 70,
      render: (_, record) => (
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
          編輯
        </Button>
      ),
    }]),
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Equipment Tracking</Title>
      </div>

      <div className="filter-bar">
        <Row gutter={12} align="middle">
          <Col>
            <Select
              placeholder="廠區"
              allowClear
              style={{ width: 100 }}
              value={filterSite}
              onChange={setFilterSite}
              options={siteOptions.map((s) => ({ label: s, value: s }))}
            />
          </Col>
          <Col>
            <DatePicker
              value={filterDate}
              onChange={setFilterDate}
              placeholder="查詢日期"
              allowClear
              style={{ width: 150 }}
              suffixIcon={<HistoryOutlined />}
            />
          </Col>
          <Col>
            <Space size={8} style={{ marginLeft: 8 }}>
              {statusOptions.map((s) => (
                <span key={s.value} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748B' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: statusColorMap[s.value], display: 'inline-block' }} />
                  {s.label}
                </span>
              ))}
            </Space>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            {!isHistoryMode && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
                新增設備
              </Button>
            )}
          </Col>
        </Row>
      </div>

      {isHistoryMode && (
        <Alert
          message={`歷史紀錄模式 — 顯示 ${targetDateStr} 的設備狀態快照（唯讀）`}
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          closable
        />
      )}

      <div className="table-card">
        <Tabs
          activeKey={activeCategory}
          onChange={setActiveCategory}
          items={categoryTabItems}
          type="card"
          style={{ padding: '12px 16px 0' }}
        />
        <Table
          columns={columns}
          dataSource={groupedData}
          pagination={false}
          size="middle"
          scroll={{ x: 700 }}
        />
      </div>

      {/* Add Equipment Modal */}
      <Modal
        title="新增設備"
        open={addModalOpen}
        onOk={handleAdd}
        onCancel={() => { setAddModalOpen(false); addForm.resetFields(); }}
        okText="新增"
        cancelText="取消"
        width={520}
      >
        <Form form={addForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="site" label="廠區" rules={[{ required: true, message: '請選擇廠區' }]}>
                <Select options={siteOptions.map((s) => ({ label: s, value: s }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="類別" rules={[{ required: true, message: '請選擇類別' }]}>
                <Select options={categoryOptions.map((c) => ({ label: c, value: c }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="mainSystem" label="Main System" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subSystem" label="Sub System" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="equipment" label="Equipment" rules={[{ required: true, message: '請輸入設備編號' }]}>
            <Input placeholder="e.g. UPS-A04" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="狀態" rules={[{ required: true }]}>
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="redundancy" label="N+Redundancy">
                <Input placeholder="e.g. 2+1" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="Remark">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        title={editingGroup ? `編輯 — ${editingGroup.subSystem}（${editingGroup.site}）` : '編輯'}
        open={editModalOpen}
        onOk={handleEditSave}
        onCancel={() => setEditModalOpen(false)}
        okText="儲存"
        cancelText="取消"
        width={600}
      >
        {editingGroup && (
          <div style={{ marginTop: 16 }}>
            <Row gutter={16} style={{ marginBottom: 12, color: '#64748B', fontSize: 13 }}>
              <Col span={8}><Text type="secondary">Main System:</Text> {editingGroup.mainSystem}</Col>
              <Col span={8}><Text type="secondary">Sub System:</Text> {editingGroup.subSystem}</Col>
              <Col span={8}><Text type="secondary">N+R:</Text> {editingGroup.redundancy}</Col>
            </Row>
            <Divider style={{ margin: '8px 0 16px' }} />
            {editingGroup.machines.map((machine) => (
              <Row key={machine.key} gutter={12} align="middle" style={{ marginBottom: 12 }}>
                <Col span={6}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: statusColorMap[machine.status],
                        display: 'inline-block',
                      }}
                    />
                    <Text strong style={{ fontSize: 13 }}>{machine.equipment}</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <Select
                    value={machine.status}
                    onChange={(val) => updateMachineInEdit(machine.key, 'status', val)}
                    options={statusOptions}
                    style={{ width: '100%' }}
                    size="small"
                  />
                </Col>
                <Col span={10}>
                  <Input
                    value={machine.remark}
                    onChange={(e) => updateMachineInEdit(machine.key, 'remark', e.target.value)}
                    placeholder="備註..."
                    size="small"
                  />
                </Col>
              </Row>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
