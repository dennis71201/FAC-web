import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Modal, Row, Space, Typography, message, FloatButton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {
  abnormalLogsData,
  getInitialPassdownStatus,
  passdownData,
  passdownSections,
  passdownStatuses,
  passdownStatusColorMap,
  passdownStatusInlineColorMap,
  passdownTypes,
  sites,
} from '../mock/passdown';
import * as passdownService from '../services/passdownService';
import * as hierarchyService from '../services/hierarchyService';
import { getEmployees } from '../services/employeesService';
import {
  extractAttachmentPayload,
  toUploadFileList,
  uploadSingleFile,
} from '../services/uploadService';
import { useAuth } from '../context/AuthContext';
import PassdownSummaryLayer from '../components/passdown/PassdownSummaryLayer';
import PassdownFilterPanel from '../components/passdown/PassdownFilterPanel';
import PassdownAnalyticsLayer from '../components/passdown/PassdownAnalyticsLayer';
import PassdownTableLayer from '../components/passdown/PassdownTableLayer';
import PassdownHierarchyModal from '../components/passdown/PassdownHierarchyModal';
import { PassdownCreateModal, PassdownHistoryModal, PassdownReplyModal } from '../components/passdown/PassdownModals';
import '../styles/passdown.css';

dayjs.extend(isBetween);

const { Text } = Typography;
const ABNORMAL_STATUSES = ['重大異常', '一般異常', '處理中', '已結案'];

const getSiteNameById = (siteId) => sites.find((site) => site.id === siteId)?.name || '';

const sortByLatestResponse = (logs) => [...logs].sort((a, b) => new Date(b.responseTime) - new Date(a.responseTime));

export default function Passdown() {
  const { user } = useAuth();
  const [records, setRecords] = useState([...passdownData]);
  const [abnormalLogs, setAbnormalLogs] = useState([...abnormalLogsData]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [createForm] = Form.useForm();
  const selectedPassdownType = Form.useWatch('passdownType', createForm);

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyRecord, setReplyRecord] = useState(null);
  const [replyForm] = Form.useForm();

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyRecord, setHistoryRecord] = useState(null);

  const [hierarchyModalOpen, setHierarchyModalOpen] = useState(false);
  const [hierarchySectionKeyword, setHierarchySectionKeyword] = useState('');
  const [hierarchySystemKeyword, setHierarchySystemKeyword] = useState('');
  const [hierarchySubsystemKeyword, setHierarchySubsystemKeyword] = useState('');
  const [hierarchyFilterDraftList, setHierarchyFilterDraftList] = useState([]);

  const [dateRange, setDateRange] = useState(null);
  const [filterSiteId, setFilterSiteId] = useState(null);
  const [filterStatuses, setFilterStatuses] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [filterHierarchy, setFilterHierarchy] = useState([]);
  const [chartDrilldownStatus, setChartDrilldownStatus] = useState(null);

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const currentEmployeeId = Number(user?.employeeId);
  const currentEmployeeName = user?.name || '';
  const isAdmin = user?.role === 'Administrator';

  const employeeMap = useMemo(
    () => new Map(activeEmployees.map((employee) => [Number(employee.id), employee])),
    [activeEmployees],
  );

  const resolveEmployeeDisplayName = useCallback(
    (employeeId, fallbackName = '') => {
      const directName = typeof fallbackName === 'string' ? fallbackName.trim() : '';
      if (directName) {
        return directName;
      }

      const matchedEmployee = employeeMap.get(Number(employeeId));
      if (matchedEmployee) {
        const matchedName = typeof matchedEmployee.name === 'string' ? matchedEmployee.name.trim() : '';
        return matchedName || '人員查無姓名';
      }

      return '查無此人員';
    },
    [employeeMap],
  );

  const refreshActiveEmployees = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setEmployeesLoading(true);
    }

    try {
      const fetchedEmployees = await getEmployees();
      setActiveEmployees(fetchedEmployees);
    } catch (error) {
      message.error(error.message || '取得員工資料失敗');
      setActiveEmployees([]);
    } finally {
      if (!silent) {
        setEmployeesLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refreshActiveEmployees();
  }, [refreshActiveEmployees]);

  const canManageRecord = (record) => isAdmin || Number(record?.createEmployeeId) === currentEmployeeId;

  const createAttachmentUploader = useCallback((form, fieldName) => {
    return async ({ file, onSuccess, onError }) => {
      setUploadingAttachments(true);
      try {
        const attachmentMeta = await uploadSingleFile(file, {
          uploadedBy: Number.isFinite(currentEmployeeId) ? currentEmployeeId : null,
        });

        const currentFileList = form.getFieldValue(fieldName) || [];
        const nextFileList = currentFileList.map((fileItem) => {
          if (fileItem.uid === file.uid) {
            return {
              ...fileItem,
              status: 'done',
              response: attachmentMeta,
              attachmentMeta,
            };
          }
          return fileItem;
        });

        form.setFieldValue(fieldName, nextFileList);
        onSuccess?.(attachmentMeta);
      } catch (error) {
        onError?.(error);
      } finally {
        setUploadingAttachments(false);
      }
    };
  }, [currentEmployeeId]);

  const handleCreateAttachmentUpload = useMemo(
    () => createAttachmentUploader(createForm, 'passdownAttachments'),
    [createAttachmentUploader, createForm],
  );

  const handleReplyAttachmentUpload = useMemo(
    () => createAttachmentUploader(replyForm, 'responseAttachments'),
    [createAttachmentUploader, replyForm],
  );

  const handleCreateAttachmentRemove = (file) => {
    const currentFileList = createForm.getFieldValue('passdownAttachments') || [];
    createForm.setFieldValue(
      'passdownAttachments',
      currentFileList.filter((item) => item.uid !== file.uid),
    );

    return true;
  };

  const handleReplyAttachmentRemove = (file) => {
    const currentFileList = replyForm.getFieldValue('responseAttachments') || [];
    replyForm.setFieldValue(
      'responseAttachments',
      currentFileList.filter((item) => item.uid !== file.uid),
    );

    return true;
  };

  const recentThreeDayRecords = useMemo(() => {
    const startDay = dayjs().startOf('day').subtract(2, 'day');
    return records.filter((record) => {
      const recordTime = dayjs(record.passdownTime);
      return !recordTime.isBefore(startDay);
    });
  }, [records]);

  const sectionOptions = useMemo(() => hierarchyService.getSectionOptions(), []);

  const filteredRecords = useMemo(() => {
    let list = [...records];
    // 預設依據 passdownTime (新到舊) 排序
    list.sort((a, b) => {
      const aTime = a.passdownTime ? new Date(a.passdownTime).getTime() : 0;
      const bTime = b.passdownTime ? new Date(b.passdownTime).getTime() : 0;
      return bTime - aTime;
    });

    if (dateRange && dateRange[0] && dateRange[1]) {
      list = list.filter((record) => dayjs(record.passdownTime).isBetween(dateRange[0], dateRange[1], 'minute', '[]'));
    }

    if (filterSiteId) {
      list = list.filter((record) => record.siteId === filterSiteId);
    }

    if (filterStatuses.length > 0) {
      list = list.filter((record) => filterStatuses.includes(record.passdownStatus));
    }

    if (filterHierarchy.length > 0) {
      const validSectionIds = new Set(
        filterHierarchy.flatMap((item) =>
          hierarchyService.getSectionIdsByCondition(item.section, item.system, item.subsystem),
        ),
      );
      list = list.filter((record) => validSectionIds.has(record.passdownSectionId));
    }

    if (keyword.trim()) {
      const searchText = keyword.trim().toLowerCase();
      list = list.filter((record) => {
        const createEmployeeDisplayName = resolveEmployeeDisplayName(record.createEmployeeId, record.createEmployeeName).toLowerCase();
        const receiveEmployeeDisplayName = resolveEmployeeDisplayName(record.receiveEmployeeId, record.receiveEmployeeName).toLowerCase();

        return (
          record.passdownDescription.toLowerCase().includes(searchText) ||
          createEmployeeDisplayName.includes(searchText) ||
          receiveEmployeeDisplayName.includes(searchText)
        );
      });
    }

    if (chartDrilldownStatus) {
      list = list.filter((record) => record.passdownStatus === chartDrilldownStatus);
    }

    return list;
  }, [records, dateRange, filterSiteId, filterStatuses, filterHierarchy, keyword, chartDrilldownStatus, resolveEmployeeDisplayName]);

  const statusCountsFromAll = useMemo(() => {
    return passdownStatuses.reduce((acc, status) => {
      acc[status.value] = recentThreeDayRecords.filter((record) => record.passdownStatus === status.value).length;
      return acc;
    }, {});
  }, [recentThreeDayRecords]);

  const summaryExceptionPieData = useMemo(() => {
    return passdownStatuses
      .filter((status) => status.value !== '正常')
      .map((status) => ({
        key: status.value,
        name: status.label,
        value: statusCountsFromAll[status.value] || 0,
        color: status.color,
      }))
      .filter((item) => item.value > 0);
  }, [statusCountsFromAll]);

  const summaryExceptionTotal = useMemo(
    () => summaryExceptionPieData.reduce((sum, item) => sum + item.value, 0),
    [summaryExceptionPieData],
  );

  const chartStatusCounts = useMemo(() => {
    return passdownStatuses.map((status) => ({
      key: status.value,
      name: status.label,
      value: filteredRecords.filter((record) => record.passdownStatus === status.value).length,
      color: status.color,
    }));
  }, [filteredRecords]);

  const exceptionPieData = useMemo(() => chartStatusCounts.filter((item) => item.key !== '正常' && item.value > 0), [chartStatusCounts]);

  const trendData = useMemo(() => {
    const bucket = new Map();

    filteredRecords.forEach((record) => {
      const day = dayjs(record.passdownTime).format('MM/DD');
      if (!bucket.has(day)) bucket.set(day, { day, major: 0, general: 0 });

      if (record.passdownStatus === '重大異常') bucket.get(day).major += 1;
      if (record.passdownStatus === '一般異常') bucket.get(day).general += 1;
    });

    return [...bucket.values()].sort((a, b) => dayjs(a.day, 'MM/DD').unix() - dayjs(b.day, 'MM/DD').unix());
  }, [filteredRecords]);

  const getLogsForRecord = (recordId) =>
    sortByLatestResponse(abnormalLogs.filter((item) => item.passdownId === recordId));

  const getLatestLogForRecord = (recordId) => getLogsForRecord(recordId)[0] || null;

  const openHierarchyModal = () => {
    setHierarchySectionKeyword('');
    setHierarchySystemKeyword('');
    setHierarchySubsystemKeyword('');

    setHierarchyFilterDraftList([...filterHierarchy]);

    setHierarchyModalOpen(true);
  };

  /**
   * 應用層級篩選（按下「確認」按鈕時調用）
   * 將 Modal 內的草稿狀態應用到主頁面篩選，表格隨之刷新
   */
  const applyHierarchySelection = () => {
    // 檢查是否至少有一個條件被選中
    if (hierarchyFilterDraftList.length === 0) {
      message.warning('請至少選擇一個篩選條件');
      return;
    }

    // 應用草稿狀態到主頁面篩選（filterHierarchy 變化會觸發 filteredRecords 重算）
    setFilterHierarchy(hierarchyFilterDraftList);

    // 關閉 Modal
    setHierarchyModalOpen(false);
  };

  /**
   * 取消 Modal（放棄所有修改）
   * 恢復到上次確認的篩選狀態，不改變主頁面篩選
   */
  const cancelHierarchySelection = () => {
    // 重置 Modal 內的所有狀態
    setHierarchySectionKeyword('');
    setHierarchySystemKeyword('');
    setHierarchySubsystemKeyword('');
    setHierarchyFilterDraftList([...filterHierarchy]); // 恢復為上次確認的狀態

    // 關閉 Modal
    setHierarchyModalOpen(false);
  };

  /**
   * 移除指定索引的條件
   */
  const removeHierarchyFilterDraft = (index) => {
    setHierarchyFilterDraftList((prev) => prev.filter((_, idx) => idx !== index));
  };

  /**
   * 清空所有條件
   */
  const clearHierarchyFilterDraftList = () => setHierarchyFilterDraftList([]);

  /**
   * 課別勾選框變化回調
   * checked: true 時添加該課別條件，false 時移除該課別下所有條件
   */
  const onCheckSection = (section, checked) => {
    setHierarchyFilterDraftList((prev) => {
      if (checked) {
        // 勾選課別 → 添加單獨的課別條件
        const exists = prev.some((item) => item.section === section && item.system === null && item.subsystem === null);
        if (exists) return prev;
        return [...prev, { section, system: null, subsystem: null }];
      } else {
        // 取消課別 → 移除該課別下所有條件
        return prev.filter((item) => item.section !== section);
      }
    });
  };

  /**
   * 系統勾選框變化回調
   * checked: true 時添加該系統條件（並自動包含課別）、移除同課別的粗粒度條件
   * checked: false 時移除該系統下所有條件
   */
  const onCheckSystem = (section, system, checked) => {
    setHierarchyFilterDraftList((prev) => {
      if (checked) {
        const exists = prev.some(
          (item) => item.section === section && item.system === system && item.subsystem === null,
        );
        if (exists) return prev;

        // 若同課別僅存在課別級條件，則升級為系統級條件，避免重複 Tag。
        const next = prev.filter(
          (item) => !(item.section === section && item.system === null && item.subsystem === null),
        );

        return [...next, { section, system, subsystem: null }];
      } else {
        // 取消系統 → 移除該系統下所有條件
        return prev.filter((item) => !(item.section === section && item.system === system));
      }
    });
  };

  /**
   * 子系統勾選框變化回調
   * checked: true 時添加該子系統條件（並自動包含課別與系統）、移除同系統的粗粒度條件
   * checked: false 時移除該子系統條件
   */
  const onCheckSubsystem = (section, system, subsystem, checked) => {
    setHierarchyFilterDraftList((prev) => {
      if (checked) {
        const exists = prev.some(
          (item) => item.section === section && item.system === system && item.subsystem === subsystem,
        );
        if (exists) return prev;

        // 若同系統僅存在系統級條件，則升級為子系統級條件，避免重複 Tag。
        const next = prev.filter(
          (item) => !(item.section === section && item.system === system && item.subsystem === null),
        );

        return [...next, { section, system, subsystem }];
      } else {
        // 取消子系統 → 移除該子系統條件
        return prev.filter(
          (item) => !(item.section === section && item.system === system && item.subsystem === subsystem),
        );
      }
    });
  };

  const openCreateModal = async () => {
    await refreshActiveEmployees();

    setEditRecord(null);
    createForm.resetFields();
    createForm.setFieldsValue({
      passdownTime: dayjs(),
      passdownType: '值班交接',
      createEmployeeId: Number.isFinite(currentEmployeeId) ? currentEmployeeId : undefined,
      passdownAttachments: [],
    });
    setCreateModalOpen(true);
  };

  const openEditModal = async (record) => {
    if (!canManageRecord(record)) {
      message.error('你只能編輯自己建立的交接事項');
      return;
    }

    await refreshActiveEmployees();

    setEditRecord(record);
    createForm.setFieldsValue({
      ...record,
      passdownTime: dayjs(record.passdownTime),
      passdownAttachments: toUploadFileList(record.passdownAttachments, `passdown-${record.id}`),
    });
    setCreateModalOpen(true);
  };

  const submitCreateModal = async () => {
    try {
      const values = await createForm.validateFields();
      if (editRecord && !canManageRecord(editRecord)) {
        throw new Error('你只能編輯自己建立的交接事項');
      }

      const attachmentPayload = extractAttachmentPayload(values.passdownAttachments || []);
      const isEditing = Boolean(editRecord);
      const resolvedCreateEmployeeId = isEditing
        ? Number(editRecord.createEmployeeId)
        : (Number.isFinite(currentEmployeeId) ? currentEmployeeId : Number(values.createEmployeeId));
      const selectedReceiveEmployee = activeEmployees.find((employee) => employee.id === Number(values.receiveEmployeeId));

      if (!selectedReceiveEmployee) {
        throw new Error('接收人員不存在，請重新選擇');
      }

      const matchedCreateEmployee = activeEmployees.find((employee) => employee.id === resolvedCreateEmployeeId);
      const createEmployeeName = isEditing
        ? (typeof editRecord.createEmployeeName === 'string' ? editRecord.createEmployeeName.trim() : '')
        : (currentEmployeeName.trim() || (matchedCreateEmployee?.name || '').trim());
      const receiveEmployeeName = typeof selectedReceiveEmployee.name === 'string' ? selectedReceiveEmployee.name.trim() : '';

      const payload = {
        ...values,
        createEmployeeId: resolvedCreateEmployeeId,
        passdownTime: values.passdownTime.format('YYYY-MM-DD HH:mm'),
        passdownAttachments: attachmentPayload,
        siteName: getSiteNameById(values.siteId),
        createEmployeeName,
        receiveEmployeeName,
        passdownSectionId:
          values.passdownSectionId ||
          passdownSections.find(
            (node) =>
              node.section === values.passdownSectionName &&
              node.system === values.passdownSystemName &&
              node.subsystem === values.passdownSubSystemName,
          )?.id,
      };

      if (editRecord) {
        const updated = await passdownService.updatePassdownRecord(editRecord.id, payload);
        setRecords((prev) => prev.map((record) => (record.id === editRecord.id ? updated : record)));
        message.success('交接事項已更新');
      } else {
        const created = await passdownService.createPassdownRecord(payload);
        setRecords((prev) => [created, ...prev]);
        message.success('交接事項已新增');
      }

      setCreateModalOpen(false);
      createForm.resetFields();
      setEditRecord(null);
    } catch (error) {
      message.error(error.message || '儲存失敗');
    }
  };

  const openReplyModal = (record) => {
    setReplyRecord(record);
    replyForm.resetFields();
    replyForm.setFieldsValue({
      isClosed: false,
      responseAttachments: [],
    });
    setReplyModalOpen(true);
  };

  const submitReplyModal = async () => {
    try {
      const values = await replyForm.validateFields();
      const payload = {
        ...values,
        responseAttachments: extractAttachmentPayload(values.responseAttachments || []),
        planDate: values.planDate ? values.planDate.format('YYYY-MM-DD') : null,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
        responseEmployeeId: Number.isFinite(currentEmployeeId) ? currentEmployeeId : 0,
        responseEmployeeName: currentEmployeeName || '未知使用者',
      };

      const newLog = await passdownService.addAbnormalLog(replyRecord.id, payload);
      setAbnormalLogs((prev) => [...prev, newLog]);

      setRecords((prev) =>
        prev.map((record) =>
          record.id === replyRecord.id
            ? {
                ...record,
                passdownStatus: payload.isClosed ? '已結案' : '處理中',
              }
            : record,
        ),
      );

      message.success('異常回覆已送出');
      setReplyModalOpen(false);
      setReplyRecord(null);
      replyForm.resetFields();
    } catch (error) {
      message.error(error.message || '回覆失敗');
    }
  };

  const openHistoryModal = (record) => {
    setHistoryRecord(record);
    setHistoryModalOpen(true);
  };

  const confirmDelete = (record) => {
    if (!canManageRecord(record)) {
      message.error('你只能刪除自己建立的交接事項');
      return;
    }

    Modal.confirm({
      title: '確認刪除此交接事項',
      content: `是否刪除 ${record.passdownSectionName} / ${record.passdownSystemName} / ${record.passdownSubSystemName}？`,
      okText: '刪除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const ok = await passdownService.deletePassdownRecord(record.id);
        if (ok) {
          setRecords((prev) => prev.filter((item) => item.id !== record.id));
          setAbnormalLogs((prev) => prev.filter((item) => item.passdownId !== record.id));
          message.success('交接事項已刪除');
        }
      },
    });
  };

  const clearAllFilters = () => {
    setDateRange(null);
    setFilterSiteId(null);
    setFilterStatuses([]);
    setKeyword('');
    setFilterHierarchy([]);
    setChartDrilldownStatus(null);
  };

  const applyChartDrilldown = (statusValue) => {
    setChartDrilldownStatus((prev) => (prev === statusValue ? null : statusValue));
  };

  const getRowClassName = (record) => {
    const statusClass = {
      正常: 'passdown-row-normal',
      重大異常: 'passdown-row-major',
      一般異常: 'passdown-row-general',
      處理中: 'passdown-row-pending',
      已結案: 'passdown-row-closed',
    };

    return statusClass[record.passdownStatus] || '';
  };

  const expandedRowRender = (record) => {
    const latestLog = getLatestLogForRecord(record.id);
    if (!latestLog) {
      return <Text type="secondary">此異常尚無回覆紀錄</Text>;
    }

    return (
      <div
        className="passdown-inline-abnormal"
        style={{ backgroundColor: passdownStatusInlineColorMap[record.passdownStatus] || '#F7F7F7' }}
      >
        <Row gutter={[16, 8]}>
          <Col xs={24} md={8}>
            <Text strong>Root Cause (R/C)</Text>
            <div>{latestLog.rcContent}</div>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Corrective Action (C/A)</Text>
            <div>{latestLog.caContent}</div>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Preventive Action (P/A)</Text>
            <div>{latestLog.paContent || '-'}</div>
          </Col>
          <Col xs={24}>
            <Space split={<span>|</span>} size="large">
              <Text className="passdown-mono">PlanDate: {latestLog.planDate || '-'}</Text>
              <Text className="passdown-mono">DueDate: {latestLog.dueDate || '-'}</Text>
              <Text className="passdown-mono">回覆時間: {dayjs(latestLog.responseTime).format('YYYY-MM-DD HH:mm')}</Text>
            </Space>
          </Col>
        </Row>
      </div>
    );
  };

  const typePreviewStatus = getInitialPassdownStatus(selectedPassdownType || '值班交接');

  return (
    <div className="passdown-page">
      <div className="passdown-shell">
        <section className="passdown-section">
          <PassdownSummaryLayer
            exceptionPieData={summaryExceptionPieData}
            exceptionTotal={summaryExceptionTotal}
            passdownStatuses={passdownStatuses}
            statusCountsFromAll={statusCountsFromAll}
            applyChartDrilldown={applyChartDrilldown}
          />
        </section>

        <section className="passdown-section">
          <PassdownFilterPanel
            dateRange={dateRange}
            setDateRange={setDateRange}
            filterSiteId={filterSiteId}
            setFilterSiteId={setFilterSiteId}
            filterStatuses={filterStatuses}
            setFilterStatuses={setFilterStatuses}
            sites={sites}
            passdownStatuses={passdownStatuses}
            openHierarchyModal={openHierarchyModal}
            keyword={keyword}
            setKeyword={setKeyword}
            clearAllFilters={clearAllFilters}
            filterHierarchy={filterHierarchy}
            setFilterHierarchy={setFilterHierarchy}
            chartDrilldownStatus={chartDrilldownStatus}
            setChartDrilldownStatus={setChartDrilldownStatus}
          />
          <PassdownAnalyticsLayer
            exceptionPieData={exceptionPieData}
            chartStatusCounts={chartStatusCounts}
            trendData={trendData}
            applyChartDrilldown={applyChartDrilldown}
          />
          <PassdownTableLayer
            filteredRecords={filteredRecords}
            chartDrilldownStatus={chartDrilldownStatus}
            setChartDrilldownStatus={setChartDrilldownStatus}
            getRowClassName={getRowClassName}
            ABNORMAL_STATUSES={ABNORMAL_STATUSES}
            passdownStatusColorMap={passdownStatusColorMap}
            applyChartDrilldown={applyChartDrilldown}
            canManageRecord={canManageRecord}
            resolveEmployeeDisplayName={resolveEmployeeDisplayName}
            openEditModal={openEditModal}
            confirmDelete={confirmDelete}
            openReplyModal={openReplyModal}
            openHistoryModal={openHistoryModal}
            expandedRowRender={expandedRowRender}
            expandedRowKeys={expandedRowKeys}
            setExpandedRowKeys={setExpandedRowKeys}
            message={message}
          />
        </section>
      </div>

      <FloatButton
        type="primary"
        icon={<PlusOutlined />}
        tooltip="新增運轉交接"
        onClick={openCreateModal}
      />

      <PassdownHierarchyModal
        hierarchyModalOpen={hierarchyModalOpen}
        hierarchyFilterDraftList={hierarchyFilterDraftList}
        removeHierarchyFilterDraft={removeHierarchyFilterDraft}
        clearHierarchyFilterDraftList={clearHierarchyFilterDraftList}
        hierarchySectionKeyword={hierarchySectionKeyword}
        setHierarchySectionKeyword={setHierarchySectionKeyword}
        hierarchySystemKeyword={hierarchySystemKeyword}
        setHierarchySystemKeyword={setHierarchySystemKeyword}
        hierarchySubsystemKeyword={hierarchySubsystemKeyword}
        setHierarchySubsystemKeyword={setHierarchySubsystemKeyword}
        sectionOptions={sectionOptions}
        applyHierarchySelection={applyHierarchySelection}
        cancelHierarchySelection={cancelHierarchySelection}
        onCheckSection={onCheckSection}
        onCheckSystem={onCheckSystem}
        onCheckSubsystem={onCheckSubsystem}
      />

      <PassdownCreateModal
        createModalOpen={createModalOpen}
        setCreateModalOpen={setCreateModalOpen}
        editRecord={editRecord}
        setEditRecord={setEditRecord}
        createForm={createForm}
        submitCreateModal={submitCreateModal}
        sites={sites}
        passdownSections={passdownSections}
        passdownTypes={passdownTypes}
        typePreviewStatus={typePreviewStatus}
        passdownStatusColorMap={passdownStatusColorMap}
        activeEmployees={activeEmployees}
        employeesLoading={employeesLoading}
        uploadingAttachments={uploadingAttachments}
        handleCreateAttachmentUpload={handleCreateAttachmentUpload}
        handleCreateAttachmentRemove={handleCreateAttachmentRemove}
      />

      <PassdownReplyModal
        replyModalOpen={replyModalOpen}
        setReplyModalOpen={setReplyModalOpen}
        replyRecord={replyRecord}
        setReplyRecord={setReplyRecord}
        replyForm={replyForm}
        submitReplyModal={submitReplyModal}
        uploadingAttachments={uploadingAttachments}
        handleReplyAttachmentUpload={handleReplyAttachmentUpload}
        handleReplyAttachmentRemove={handleReplyAttachmentRemove}
      />

      <PassdownHistoryModal
        historyModalOpen={historyModalOpen}
        setHistoryModalOpen={setHistoryModalOpen}
        historyRecord={historyRecord}
        setHistoryRecord={setHistoryRecord}
        getLogsForRecord={getLogsForRecord}
        resolveEmployeeDisplayName={resolveEmployeeDisplayName}
      />
    </div>
  );
}
