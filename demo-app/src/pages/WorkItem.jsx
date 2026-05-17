import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, DatePicker, FloatButton, Select, Spin, message } from 'antd';
import { PlusOutlined, CalendarOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import WorkItemCalendar from '../components/workItem/WorkItemCalendar';
import WorkItemSidebar from '../components/workItem/WorkItemSidebar';
import WorkItemForm from '../components/workItem/WorkItemForm';
import { useAuth } from '../context/AuthContext';
import {
  getWorkItems,
  createWorkItem,
  updateWorkItem,
  deleteWorkItem,
  getSites,
  getAllColumns,
  getDisplayColumns,
  saveDisplayColumns,
  getGroupedSystemOptions,
  getSectionById,
  getSubsystemsBySectionId,
} from '../services/workItemService';
import '../styles/workItem.css';

export default function WorkItem() {
  const { user } = useAuth();
  const sites = useMemo(() => getSites(), []);
  const allColumns = useMemo(() => getAllColumns(), []);
  const groupedSystemOptions = useMemo(() => getGroupedSystemOptions(), []);

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedSite, setSelectedSite] = useState(null);
  // Default to logged-in user's own section/system. Falls back to null when
  // the JWT was issued before employeeSectionId was added — user re-logs in to populate.
  const [selectedEmployeeSectionId, setSelectedEmployeeSectionId] = useState(
    user?.employeeSectionId ?? null
  );
  const [selectedSubsystem, setSelectedSubsystem] = useState(null);

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [displayColumns, setDisplayColumns] = useState(['description']);

  const year = currentMonth.year();
  const month = currentMonth.month() + 1;

  const subsystemList = useMemo(
    () => (selectedEmployeeSectionId ? getSubsystemsBySectionId(selectedEmployeeSectionId) : null),
    [selectedEmployeeSectionId]
  );
  const subsystemOptions = useMemo(
    () => (Array.isArray(subsystemList) ? subsystemList.map((s) => ({ label: s, value: s })) : []),
    [subsystemList]
  );

  const loadData = useCallback(async () => {
    setError('');
    try {
      const list = await getWorkItems({ year, month });
      setWorkItems(list);
    } catch (e) {
      setError(e.message || '載入工項失敗');
    }
  }, [year, month]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadData().finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [loadData]);

  useEffect(() => {
    setDisplayColumns(getDisplayColumns(selectedEmployeeSectionId));
  }, [selectedEmployeeSectionId]);

  const filtered = useMemo(() => {
    return workItems.filter((w) => {
      if (selectedSite && w.site !== selectedSite) return false;
      if (selectedEmployeeSectionId && w.employeeSectionId !== selectedEmployeeSectionId) return false;
      if (selectedSubsystem && w.subsystem !== selectedSubsystem) return false;
      return true;
    });
  }, [workItems, selectedSite, selectedEmployeeSectionId, selectedSubsystem]);

  const groupingMode = selectedEmployeeSectionId ? 'none' : 'section';

  const configScopeLabel = useMemo(() => {
    if (!selectedEmployeeSectionId) return '請先選定 System';
    const sec = getSectionById(selectedEmployeeSectionId);
    return sec ? `${sec.sectionName} / ${sec.systemName}` : '';
  }, [selectedEmployeeSectionId]);

  const handleSystemChange = (v) => {
    setSelectedEmployeeSectionId(v || null);
    setSelectedSubsystem(null);
  };

  const handleColumnsChange = (cols) => {
    setDisplayColumns(cols);
    saveDisplayColumns(selectedEmployeeSectionId, cols);
  };

  const handleAddClick = () => {
    setModalMode('add');
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteWorkItem(id);
      await loadData();
      message.success('工項已刪除');
    } catch (e) {
      message.error(e.message || '刪除失敗');
    }
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (modalMode === 'edit' && editingItem) {
        await updateWorkItem(editingItem.id, payload, user);
        message.success('工項已更新');
      } else {
        await createWorkItem(payload, user);
        message.success('工項已新增');
      }
      await loadData();
      setModalVisible(false);
    } catch (e) {
      message.error(e.message || '操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="workitem-page">
      <div className="wi-header">
        <div className="wi-header-title">
          <h4>Daily Work Item</h4>
          <p>檢視與管理各組每日工項，點擊行事曆日期可在右側查看詳細內容</p>
        </div>
        <div className="wi-header-filters">
          <DatePicker
            picker="month"
            value={currentMonth}
            onChange={(d) => d && setCurrentMonth(d)}
            format="YYYY 年 MM 月"
            allowClear={false}
            suffixIcon={<CalendarOutlined />}
            style={{ width: 160 }}
          />
          <Select
            placeholder="Site"
            allowClear
            value={selectedSite || undefined}
            onChange={(v) => setSelectedSite(v || null)}
            options={sites.map((s) => ({ label: s, value: s }))}
            style={{ width: 110 }}
          />
          <Select
            placeholder="System"
            allowClear
            value={selectedEmployeeSectionId || undefined}
            onChange={handleSystemChange}
            options={groupedSystemOptions}
            showSearch
            optionFilterProp="label"
            style={{ width: 200 }}
          />
          {Array.isArray(subsystemList) && (
            <Select
              placeholder="Subsystem"
              allowClear
              value={selectedSubsystem || undefined}
              onChange={(v) => setSelectedSubsystem(v || null)}
              options={subsystemOptions}
              style={{ width: 130 }}
            />
          )}
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          action={<a onClick={loadData}>重新載入</a>}
          style={{ marginBottom: 12 }}
        />
      )}

      <div className={`wi-main ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <div className="wi-calendar-wrap">
          {loading ? (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
              <Spin size="large" />
            </div>
          ) : (
            <WorkItemCalendar
              year={year}
              month={month - 1}
              workItems={filtered}
              onDateClick={(d) => { setSelectedDate(d); setSidebarOpen(true); }}
              selectedDate={selectedDate}
              groupingMode={groupingMode}
            />
          )}
        </div>
        <div className="wi-sidebar-toggle" onClick={() => setSidebarOpen((s) => !s)}>
          {sidebarOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
        <div className="wi-sidebar-wrap">
          <WorkItemSidebar
            selectedDate={selectedDate}
            workItems={filtered}
            displayColumns={displayColumns}
            allColumns={allColumns}
            onColumnsChange={handleColumnsChange}
            configScopeLabel={configScopeLabel}
            configEnabled={!!selectedEmployeeSectionId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        tooltip="新增工項"
        onClick={handleAddClick}
      />

      {modalVisible && (
        <WorkItemForm
          key={`${modalMode}-${editingItem?.id ?? 'new'}`}
          mode={modalMode}
          initialValue={editingItem}
          defaultDate={selectedDate}
          defaultEmployeeSectionId={selectedEmployeeSectionId}
          defaultSubsystem={selectedSubsystem}
          groupedSystemOptions={groupedSystemOptions}
          getSubsystemsBySectionId={getSubsystemsBySectionId}
          sites={sites}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}
