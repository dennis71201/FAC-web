import { useState, useMemo } from 'react';
import {
  Table, Tag, Select, Button, Drawer, Form, Input, DatePicker, Upload, Space,
  Row, Col, Modal, message, Typography, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined, UploadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  passdownData, systemOptions, passdownStatusOptions, passdownStatusColorMap, shiftOptions,
} from '../mock/passdown';
import { employees } from '../mock/employees';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

const activeEmployees = employees.filter((e) => e.isActive);
const siteOptions = ['A廠', 'B廠'];

export default function Passdown() {
  const [data, setData] = useState(passdownData);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // Filters
  const [dateRange, setDateRange] = useState(null);
  const [filterSite, setFilterSite] = useState(null);
  const [filterSystem, setFilterSystem] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterSite && item.site !== filterSite) return false;
      if (filterSystem && filterSystem !== 'ALL' && item.system !== filterSystem) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        if (!item.event.toLowerCase().includes(kw) && !item.process.toLowerCase().includes(kw)) return false;
      }
      if (dateRange && dateRange[0] && dateRange[1]) {
        const itemDate = dayjs(item.date);
        if (itemDate.isBefore(dateRange[0].startOf('day')) || itemDate.isAfter(dateRange[1].endOf('day'))) return false;
      }
      return true;
    });
  }, [data, filterSite, filterSystem, filterStatus, searchKeyword, dateRange]);

  const openCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
    });
    setDrawerOpen(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '確認刪除',
      content: `確定要刪除此交接紀錄？（${record.equipment} - ${record.event.slice(0, 20)}...）`,
      okText: '刪除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setData((prev) => prev.filter((item) => item.key !== record.key));
        message.success('紀錄已刪除');
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const record = {
        ...values,
        date: values.date.format('YYYY-MM-DD HH:mm'),
        imageCount: 0,
      };

      if (editingRecord) {
        setData((prev) =>
          prev.map((item) =>
            item.key === editingRecord.key ? { ...item, ...record } : item
          )
        );
        message.success('紀錄更新成功');
      } else {
        setData((prev) => [{ ...record, key: String(Date.now()) }, ...prev]);
        message.success('紀錄新增成功');
      }

      setDrawerOpen(false);
      form.resetFields();
    });
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      width: 140,
      defaultSortOrder: 'descend',
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    { title: 'Site', dataIndex: 'site', width: 60 },
    { title: 'System', dataIndex: 'system', width: 80 },
    { title: 'Equipment', dataIndex: 'equipment', width: 110 },
    {
      title: 'Event',
      dataIndex: 'event',
      ellipsis: { showTitle: false },
      width: 220,
      render: (val) => <Tooltip placement="topLeft" title={val}>{val}</Tooltip>,
    },
    { title: 'Process', dataIndex: 'process', width: 140 },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 90,
      render: (val) => <Tag color={passdownStatusColorMap[val]}>{val}</Tag>,
    },
    { title: 'Shift', dataIndex: 'shift', width: 80 },
    { title: 'Owner', dataIndex: 'owner', width: 80 },
    {
      title: '圖片',
      dataIndex: 'imageCount',
      width: 60,
      render: (val) =>
        val > 0 ? (
          <Space size={2}>
            <PictureOutlined style={{ color: '#64748B' }} />
            <span>{val}</span>
          </Space>
        ) : (
          <span style={{ color: '#ccc' }}>-</span>
        ),
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            編輯
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>Passdown</Title>
      </div>

      <div className="filter-bar">
        <Row gutter={12} align="middle" wrap>
          <Col>
            <RangePicker value={dateRange} onChange={setDateRange} style={{ width: 260 }} />
          </Col>
          <Col>
            <Select placeholder="廠區" allowClear style={{ width: 90 }} value={filterSite} onChange={setFilterSite}
              options={siteOptions.map((s) => ({ label: s, value: s }))}
            />
          </Col>
          <Col>
            <Select placeholder="System" allowClear style={{ width: 110 }} value={filterSystem} onChange={setFilterSystem}
              options={systemOptions.map((s) => ({ label: s, value: s }))}
            />
          </Col>
          <Col>
            <Select placeholder="狀態" allowClear style={{ width: 110 }} value={filterStatus} onChange={setFilterStatus}
              options={passdownStatusOptions}
            />
          </Col>
          <Col>
            <Search
              placeholder="搜尋 Event / Process..."
              allowClear
              style={{ width: 220 }}
              onSearch={setSearchKeyword}
              onChange={(e) => !e.target.value && setSearchKeyword('')}
            />
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增紀錄
            </Button>
          </Col>
        </Row>
      </div>

      <div className="table-card">
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `共 ${total} 筆` }}
          size="middle"
          scroll={{ x: 1260 }}
        />
      </div>

      {/* Create / Edit Drawer */}
      <Drawer
        title={editingRecord ? '編輯交接紀錄' : '新增交接紀錄'}
        width={520}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        extra={
          <Space>
            <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              {editingRecord ? '更新' : '新增'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="日期時間" rules={[{ required: true, message: '請選擇日期' }]}>
                <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="site" label="廠區" rules={[{ required: true }]}>
                <Select options={siteOptions.map((s) => ({ label: s, value: s }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="system" label="System" rules={[{ required: true }]}>
                <Select options={systemOptions.filter((s) => s !== 'ALL').map((s) => ({ label: s, value: s }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="equipment" label="Equipment" rules={[{ required: true, message: '請輸入設備' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="event" label="Event" rules={[{ required: true, message: '請輸入事件描述' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="process" label="Process">
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select options={passdownStatusOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="shift" label="Shift" rules={[{ required: true }]}>
                <Select options={shiftOptions.map((s) => ({ label: s, value: s }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="owner" label="Owner" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={activeEmployees.map((e) => ({ label: e.name, value: e.name }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="附件圖片">
            <Upload listType="picture-card" beforeUpload={() => false} maxCount={5}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 4, fontSize: 12 }}>上傳</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
