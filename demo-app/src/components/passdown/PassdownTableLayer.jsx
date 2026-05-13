import { Button, Card, Col, Popover, Row, Space, Table, Tag, Tooltip, Typography } from 'antd';
import {
  ClockCircleFilled,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileOutlined,
  WarningFilled,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { normalizeAttachments } from '../../services/uploadService';

const { Text } = Typography;

export default function PassdownTableLayer({
  filteredRecords,
  chartDrilldownStatus,
  setChartDrilldownStatus,
  getRowClassName,
  ABNORMAL_STATUSES,
  passdownStatusColorMap,
  applyChartDrilldown,
  canManageRecord,
  resolveEmployeeDisplayName,
  openEditModal,
  confirmDelete,
  openReplyModal,
  openHistoryModal,
  expandedRowRender,
  expandedRowKeys,
  setExpandedRowKeys,
  message,
}) {
  const renderAttachmentCell = (attachments) => {
    const normalizedAttachments = normalizeAttachments(attachments);
    if (normalizedAttachments.length === 0) return <Text type="secondary">-</Text>;

    if (normalizedAttachments.length === 1) {
      const firstAttachment = normalizedAttachments[0];
      return (
        <Button
          type="text"
          size="small"
          icon={<FileOutlined />}
          onClick={() => message.info(`模擬開啟附件: ${firstAttachment.fileName}`)}
        >
          1
        </Button>
      );
    }

    const content = (
      <div className="passdown-attachment-popover">
        {normalizedAttachments.map((attachment) => (
          <Button
            key={attachment.fileId}
            type="link"
            size="small"
            onClick={() => message.info(`模擬開啟附件: ${attachment.fileName}`)}
          >
            {attachment.fileName}
            {attachment.fileSize > 0 ? ` (${Math.ceil(attachment.fileSize / 1024)} KB)` : ''}
          </Button>
        ))}
      </div>
    );

    return (
      <Popover content={content} trigger="click">
        <Button type="text" size="small" icon={<FileOutlined />}>
          {normalizedAttachments.length}
        </Button>
      </Popover>
    );
  };

  const tableColumns = [
    {
      title: '日期/時間',
      dataIndex: 'passdownTime',
      width: 155,
      sorter: (a, b) => dayjs(a.passdownTime).unix() - dayjs(b.passdownTime).unix(),
      render: (value) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(value).format('YYYY-MM-DD')}</Text>
          <Text type="secondary" className="passdown-mono">{dayjs(value).format('HH:mm')}</Text>
        </Space>
      ),
    },
    {
      title: '類型',
      dataIndex: 'passdownType',
      width: 100,
      render: (value) => <Text>{value}</Text>,
    },
    {
      title: '狀態',
      dataIndex: 'passdownStatus',
      width: 120,
      render: (status) => (
        <Tag
          className="passdown-status-tag"
          style={{
            color: passdownStatusColorMap[status],
            backgroundColor: `${passdownStatusColorMap[status]}26`,
            borderColor: `${passdownStatusColorMap[status]}66`,
          }}
          onClick={() => applyChartDrilldown(status)}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: '廠區/系統',
      width: 165,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.siteName}</Text>
          <Text type="secondary">{record.passdownSectionName} / {record.passdownSystemName}</Text>
        </Space>
      ),
    },
    {
      title: '內容描述',
      dataIndex: 'passdownDescription',
      ellipsis: { showTitle: false },
      render: (value) => <Tooltip title={value}>{value}</Tooltip>,
    },
    {
      title: '交接人員',
      width: 130,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{resolveEmployeeDisplayName(record.createEmployeeId, record.createEmployeeName)}</Text>
          <Text type="secondary">交接給 {resolveEmployeeDisplayName(record.receiveEmployeeId, record.receiveEmployeeName)}</Text>
        </Space>
      ),
    },
    {
      title: '附件',
      dataIndex: 'passdownAttachments',
      width: 80,
      render: (attachments) => renderAttachmentCell(attachments),
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const isAbnormal = ABNORMAL_STATUSES.includes(record.passdownStatus);
        const canManage = canManageRecord(record);

        return (
          <Space size={2} wrap>
            {canManage && (
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
                編輯
              </Button>
            )}
            {canManage && (
              <Button type="text" size="small" icon={<DeleteOutlined />} danger onClick={() => confirmDelete(record)}>
                刪除
              </Button>
            )}
            {isAbnormal && (
              <Button type="text" size="small" icon={<WarningFilled />} onClick={() => openReplyModal(record)}>
                回覆
              </Button>
            )}
            {isAbnormal && (
              <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openHistoryModal(record)}>
                歷程
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Card className="passdown-layer" title={`運轉交接列表 (${filteredRecords.length} 筆)`}>
      {chartDrilldownStatus && (
        <div className="passdown-drilldown-banner">
          <Space>
            <ClockCircleFilled />
            <Text>目前以圖表鑽取篩選狀態: {chartDrilldownStatus}</Text>
            <Button type="link" size="small" onClick={() => setChartDrilldownStatus(null)}>
              取消鑽取
            </Button>
          </Space>
        </div>
      )}

      <Table
        rowKey="id"
        columns={tableColumns}
        dataSource={filteredRecords}
        rowClassName={getRowClassName}
        sticky
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Showing 1 to ${Math.min(total, 10)} of ${total} entries`,
        }}
        scroll={{ x: 1300 }}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => ABNORMAL_STATUSES.includes(record.passdownStatus),
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
        }}
      />
    </Card>
  );
}
