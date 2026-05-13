import { Card, Col, DatePicker, Form, Input, Modal, Row, Select, Space, Switch, Tag, Timeline, Typography, Upload } from 'antd';
import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  CloseOutlined,
  FileOutlined,
  PlusOutlined,
  WarningFilled,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { normalizeAttachments } from '../../services/uploadService';

const { Text, Title } = Typography;
const { TextArea } = Input;

export function PassdownCreateModal({
  createModalOpen,
  setCreateModalOpen,
  editRecord,
  setEditRecord,
  createForm,
  submitCreateModal,
  sites,
  passdownSections,
  passdownTypes,
  typePreviewStatus,
  passdownStatusColorMap,
  activeEmployees,
  employeesLoading,
  uploadingAttachments,
  handleCreateAttachmentUpload,
  handleCreateAttachmentRemove,
}) {
  const selectedSection = Form.useWatch('passdownSectionName', createForm);
  const selectedSystem = Form.useWatch('passdownSystemName', createForm);

  const sectionOptions = [...new Set(passdownSections.map((item) => item.section))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }));

  const systemOptions = [...new Set(
    passdownSections
      .filter((item) => item.section === selectedSection)
      .map((item) => item.system),
  )]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }));

  const subsystemOptions = [...new Set(
    passdownSections
      .filter((item) => item.section === selectedSection && item.system === selectedSystem)
      .map((item) => item.subsystem),
  )]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }));

  return (
    <Modal
      title={<Space><PlusOutlined /> {editRecord ? '編輯交接事項' : '新增交接事項'}</Space>}
      open={createModalOpen}
      centered
      onCancel={() => {
        setCreateModalOpen(false);
        setEditRecord(null);
        createForm.resetFields();
      }}
      onOk={submitCreateModal}
      okText={editRecord ? '更新' : '送出'}
      cancelText="取消"
      width={820}
    >
      <Form form={createForm} layout="vertical">
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="passdownTime" label="發生時間" rules={[{ required: true, message: '請選擇時間' }]}>
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="siteId" label="廠區 / Site" rules={[{ required: true, message: '請選擇廠區' }]}>
              <Select options={sites.map((site) => ({ label: site.name, value: site.id }))} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item name="passdownSectionName" label="課別" rules={[{ required: true, message: '請選擇課別' }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="請先選擇課別"
                options={sectionOptions}
                onChange={() => createForm.setFieldsValue({ passdownSystemName: undefined, passdownSubSystemName: undefined, passdownSectionId: undefined })}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="passdownSystemName" label="系統" rules={[{ required: true, message: '請選擇系統' }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="請先選擇系統"
                options={systemOptions}
                disabled={!selectedSection}
                onChange={() => createForm.setFieldsValue({ passdownSubSystemName: undefined, passdownSectionId: undefined })}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="passdownSubSystemName" label="子系統" rules={[{ required: true, message: '請選擇子系統' }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="請先選擇子系統"
                options={subsystemOptions}
                disabled={!selectedSystem}
                onChange={(value) => {
                  const matchedNode = passdownSections.find(
                    (item) =>
                      item.section === createForm.getFieldValue('passdownSectionName') &&
                      item.system === createForm.getFieldValue('passdownSystemName') &&
                      item.subsystem === value,
                  );
                  createForm.setFieldValue('passdownSectionId', matchedNode?.id);
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="passdownSectionId" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="passdownType" label="交接類型" rules={[{ required: true, message: '請選擇交接類型' }]}>
          <Select options={passdownTypes.map((item) => ({ label: item.label, value: item.value }))} />
        </Form.Item>

        <div className="passdown-type-preview">
          <Text type="secondary">狀態預覽</Text>
          <Tag
            style={{
              marginLeft: 8,
              color: passdownStatusColorMap[typePreviewStatus],
              borderColor: `${passdownStatusColorMap[typePreviewStatus]}66`,
              backgroundColor: `${passdownStatusColorMap[typePreviewStatus]}26`,
            }}
          >
            {typePreviewStatus}
          </Tag>
        </div>

        <Form.Item
          name="passdownDescription"
          label="內容描述 (Description)"
          rules={[{ required: true, message: '請輸入內容描述' }, { max: 1500, message: '最多 1500 字' }]}
        >
          <TextArea rows={4} showCount maxLength={1500} placeholder="請詳細描述交接事項、處置過程與後續追蹤" />
        </Form.Item>

        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="createEmployeeId" label="建立人員" rules={[{ required: true, message: '請選擇建立人員' }]}>
              <Select
                showSearch
                optionFilterProp="label"
                loading={employeesLoading}
                disabled={employeesLoading}
                options={activeEmployees.map((employee) => ({
                  label: (typeof employee.name === 'string' && employee.name.trim()) || `#${employee.employeeId} 人員查無姓名`,
                  value: employee.id,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="receiveEmployeeId" label="接收人員" rules={[{ required: true, message: '請選擇接收人員' }]}>
              <Select
                showSearch
                optionFilterProp="label"
                loading={employeesLoading}
                disabled={employeesLoading}
                options={activeEmployees.map((employee) => ({
                  label: (typeof employee.name === 'string' && employee.name.trim()) || `#${employee.employeeId} 人員查無姓名`,
                  value: employee.id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="passdownAttachments" label="附件 (Attachments)" valuePropName="fileList" getValueFromEvent={(event) => event?.fileList || []}>
          <Upload.Dragger
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            customRequest={handleCreateAttachmentUpload}
            onRemove={handleCreateAttachmentRemove}
          >
            <p className="ant-upload-drag-icon"><FileOutlined /></p>
            <p className="ant-upload-text">點擊或拖曳檔案至此上傳</p>
            <p className="ant-upload-hint">
              支援 JPG, PNG, PDF (單檔最大 10MB)
              {uploadingAttachments ? '，上傳中...' : ''}
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function PassdownReplyModal({
  replyModalOpen,
  setReplyModalOpen,
  replyRecord,
  setReplyRecord,
  replyForm,
  submitReplyModal,
  uploadingAttachments,
  handleReplyAttachmentUpload,
  handleReplyAttachmentRemove,
}) {
  return (
    <Modal
      title={<Space><WarningFilled style={{ color: '#E57373' }} /> 異常處理回覆</Space>}
      open={replyModalOpen}
      onCancel={() => {
        setReplyModalOpen(false);
        setReplyRecord(null);
      }}
      onOk={submitReplyModal}
      okText="Update"
      cancelText="Cancel"
      width={760}
    >
      {replyRecord && (
        <div className="passdown-reply-context">
          <Text strong>事件編號: ABN-{replyRecord.id.toString().padStart(4, '0')}</Text>
          <Text type="secondary">設備: {replyRecord.passdownSystemName} / {replyRecord.passdownSubSystemName}</Text>
        </div>
      )}

      <Form form={replyForm} layout="vertical">
        <Form.Item name="rcContent" label="R/C (Root Cause) 根本原因" rules={[{ required: true, message: '請輸入根本原因' }, { max: 1500 }]}>
          <TextArea rows={4} maxLength={1500} showCount placeholder="請詳細說明造成異常的根本原因..." />
        </Form.Item>

        <Form.Item name="caContent" label="C/A (Corrective Action) 矯正措施" rules={[{ required: true, message: '請輸入矯正措施' }, { max: 1500 }]}>
          <TextArea rows={4} maxLength={1500} showCount placeholder="請說明當下採取的緊急處置或矯正方案..." />
        </Form.Item>

        <Form.Item name="paContent" label="P/A (Preventive Action) 預防措施" rules={[{ max: 1500 }]}>
          <TextArea rows={3} maxLength={1500} showCount placeholder="請說明未來如何避免此類異常再次發生..." />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="planDate"
              label="Plan Date 預計完成日"
              rules={[
                ({ getFieldValue }) => ({
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (value.startOf('day').isBefore(dayjs().startOf('day'))) {
                      return Promise.reject(new Error('Plan Date 不可早於今日'));
                    }
                    const dueDate = getFieldValue('dueDate');
                    if (dueDate && dueDate.isBefore(value, 'day')) {
                      return Promise.reject(new Error('Plan Date 不可晚於 Due Date'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dueDate"
              label="Due Date 期限"
              rules={[
                ({ getFieldValue }) => ({
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const planDate = getFieldValue('planDate');
                    if (planDate && value.isBefore(planDate, 'day')) {
                      return Promise.reject(new Error('Due Date 不可早於 Plan Date'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="responseAttachments" label="回覆附件 (Attachments)" valuePropName="fileList" getValueFromEvent={(event) => event?.fileList || []}>
          <Upload.Dragger
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            customRequest={handleReplyAttachmentUpload}
            onRemove={handleReplyAttachmentRemove}
          >
            <p className="ant-upload-drag-icon"><FileOutlined /></p>
            <p className="ant-upload-text">點擊或拖曳檔案至此上傳</p>
            <p className="ant-upload-hint">
              支援 JPG, PNG, PDF (單檔最大 10MB)
              {uploadingAttachments ? '，上傳中...' : ''}
            </p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item name="isClosed" valuePropName="checked" label="Is Closed? (是否結案)">
          <Switch checkedChildren={<CheckCircleFilled />} unCheckedChildren={<CloseOutlined />} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function PassdownHistoryModal({
  historyModalOpen,
  setHistoryModalOpen,
  historyRecord,
  setHistoryRecord,
  getLogsForRecord,
  resolveEmployeeDisplayName,
}) {
  return (
    <Modal
      title={
        <Space direction="vertical" size={0}>
          <Title level={4} style={{ margin: 0 }}>查看異常歷程</Title>
          {historyRecord && (
            <Text className="passdown-mono">事件編號: ABN-{historyRecord.id.toString().padStart(4, '0')}</Text>
          )}
        </Space>
      }
      open={historyModalOpen}
      onCancel={() => {
        setHistoryModalOpen(false);
        setHistoryRecord(null);
      }}
      footer={null}
      width={860}
    >
      {historyRecord && (
        <Timeline
          items={[
            {
              dot: <WarningFilled style={{ color: '#E57373' }} />,
              children: (
                <Card className="passdown-history-card major">
                  <Tag color="error">異常發起</Tag>
                  <Text className="passdown-mono">{dayjs(historyRecord.passdownTime).format('YYYY-MM-DD HH:mm')}</Text>
                  <Title level={5}>{historyRecord.passdownDescription}</Title>
                  <Text type="secondary">
                    發起人: {resolveEmployeeDisplayName(historyRecord.createEmployeeId, historyRecord.createEmployeeName)}
                  </Text>
                </Card>
              ),
            },
            ...getLogsForRecord(historyRecord.id).map((log) => ({
              dot: log.isClosed ? <CheckCircleFilled style={{ color: '#26A69A' }} /> : <ClockCircleFilled style={{ color: '#FFB74D' }} />,
              children: (
                <Card className={`passdown-history-card ${log.isClosed ? 'closed' : 'pending'}`}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text strong>{resolveEmployeeDisplayName(log.responseEmployeeId, log.responseEmployeeName)}</Text>
                    <Tag color={log.isClosed ? 'success' : 'processing'}>{log.isClosed ? '已結案' : '變更狀態為處理中'}</Tag>
                  </Space>
                  <Text className="passdown-mono">{dayjs(log.responseTime).format('YYYY-MM-DD HH:mm')}</Text>
                  <div className="passdown-history-content">
                    <p><strong>R/C:</strong> {log.rcContent}</p>
                    <p><strong>C/A:</strong> {log.caContent}</p>
                    {log.paContent && <p><strong>P/A:</strong> {log.paContent}</p>}
                    <Space split={<span>|</span>}>
                      <Text className="passdown-mono"><CalendarOutlined /> 預計完工日: {log.planDate || '-'}</Text>
                      <Text className="passdown-mono"><CalendarOutlined /> 期限: {log.dueDate || '-'}</Text>
                    </Space>
                    {normalizeAttachments(log.responseAttachments).length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text strong>附件:</Text>
                        <Space direction="vertical" size={4} style={{ marginTop: 4, width: '100%' }}>
                          {normalizeAttachments(log.responseAttachments).map((attachment) => (
                            <Text key={attachment.fileId} className="passdown-mono">
                              <FileOutlined /> {attachment.fileName}
                              {attachment.fileSize > 0 ? ` (${Math.ceil(attachment.fileSize / 1024)} KB)` : ''}
                            </Text>
                          ))}
                        </Space>
                      </div>
                    )}
                  </div>
                </Card>
              ),
            })),
          ]}
        />
      )}
    </Modal>
  );
}
