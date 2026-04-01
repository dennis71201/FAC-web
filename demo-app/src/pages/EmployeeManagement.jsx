import { useState, useMemo } from 'react';
import {
  Table, Tag, Select, Button, Modal, Form, Input, Space, Row, Col, Switch,
  Popconfirm, message, Typography, Avatar,
} from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined, UserOutlined } from '@ant-design/icons';
import { employees as initialEmployees, departmentOptions, roleOptions } from '../mock/employees';

const { Title } = Typography;

export default function EmployeeManagement() {
  const [data, setData] = useState(initialEmployees);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [filterDept, setFilterDept] = useState(null);
  const [filterRole, setFilterRole] = useState(null);
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (!showInactive && !item.isActive) return false;
      if (filterDept && item.department !== filterDept) return false;
      if (filterRole && item.role !== filterRole) return false;
      return true;
    });
  }, [data, showInactive, filterDept, filterRole]);

  const openCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDeactivate = (record) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === record.key ? { ...item, isActive: false } : item
      )
    );
    message.success(`${record.name} 已停用`);
  };

  const handleReactivate = (record) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === record.key ? { ...item, isActive: true } : item
      )
    );
    message.success(`${record.name} 已重新啟用`);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingRecord) {
        setData((prev) =>
          prev.map((item) =>
            item.key === editingRecord.key ? { ...item, ...values } : item
          )
        );
        message.success('員工資料更新成功');
      } else {
        const newEmployee = {
          ...values,
          key: String(Date.now()),
          isActive: true,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setData((prev) => [newEmployee, ...prev]);
        message.success('員工新增成功');
      }
      setModalOpen(false);
      form.resetFields();
    });
  };

  const columns = [
    {
      title: '',
      width: 40,
      render: (_, record) => (
        <Avatar
          size="small"
          icon={<UserOutlined />}
          style={{
            backgroundColor: record.isActive ? '#64748B' : '#cbd5e1',
          }}
        />
      ),
    },
    { title: '工號', dataIndex: 'employeeId', width: 100 },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 100,
      render: (val, record) => (
        <span style={{ color: record.isActive ? '#334155' : '#94a3b8' }}>
          {val}
        </span>
      ),
    },
    {
      title: '部門',
      dataIndex: 'department',
      width: 80,
      render: (val) => <Tag>{val}</Tag>,
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 100,
      render: (val) => (
        <Tag color={val === 'admin' ? 'blue' : 'default'}>
          {val === 'admin' ? '管理者' : '一般使用者'}
        </Tag>
      ),
    },
    {
      title: '狀態',
      dataIndex: 'isActive',
      width: 80,
      render: (val) => (
        <Tag color={val ? 'green' : 'red'}>
          {val ? '在職' : '停用'}
        </Tag>
      ),
    },
    { title: '建立日期', dataIndex: 'createdAt', width: 110 },
    {
      title: '操作',
      width: 140,
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            編輯
          </Button>
          {record.isActive ? (
            <Popconfirm
              title="確認停用"
              description={`確定要停用 ${record.name} 嗎？`}
              onConfirm={() => handleDeactivate(record)}
              okText="確認"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<StopOutlined />}>
                停用
              </Button>
            </Popconfirm>
          ) : (
            <Button type="link" size="small" style={{ color: '#22c55e' }} onClick={() => handleReactivate(record)}>
              啟用
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <Title level={4} style={{ margin: 0 }}>員工表管理</Title>
      </div>

      <div className="filter-bar">
        <Row gutter={12} align="middle">
          <Col>
            <Select
              placeholder="部門"
              allowClear
              style={{ width: 100 }}
              value={filterDept}
              onChange={setFilterDept}
              options={departmentOptions.map((d) => ({ label: d, value: d }))}
            />
          </Col>
          <Col>
            <Select
              placeholder="角色"
              allowClear
              style={{ width: 120 }}
              value={filterRole}
              onChange={setFilterRole}
              options={roleOptions}
            />
          </Col>
          <Col>
            <Space>
              <Switch
                checked={showInactive}
                onChange={setShowInactive}
                size="small"
              />
              <span style={{ fontSize: 13, color: '#64748B' }}>顯示已停用</span>
            </Space>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增員工
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
          rowClassName={(record) => (!record.isActive ? 'inactive-row' : '')}
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        title={editingRecord ? '編輯員工' : '新增員工'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={editingRecord ? '更新' : '新增'}
        cancelText="取消"
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="employeeId" label="工號" rules={[{ required: true, message: '請輸入工號' }]}>
            <Input placeholder="e.g. FAC-016" disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '請輸入姓名' }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="部門" rules={[{ required: true, message: '請選擇部門' }]}>
                <Select options={departmentOptions.map((d) => ({ label: d, value: d }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="role" label="角色" rules={[{ required: true, message: '請選擇角色' }]}>
                <Select options={roleOptions} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
