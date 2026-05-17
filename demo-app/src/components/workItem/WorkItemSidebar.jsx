import { useMemo, useState } from 'react';
import { Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, SettingOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ColumnConfigPanel from './ColumnConfigPanel';
import { useAuth } from '../../context/AuthContext';

function fmtDateTime(iso) {
  if (!iso) return '';
  return dayjs(iso).format('MM/DD HH:mm');
}

function firstLine(text) {
  if (!text) return '';
  const idx = text.indexOf('\n');
  return idx >= 0 ? text.slice(0, idx) : text;
}

export default function WorkItemSidebar({
  selectedDate,
  workItems,
  displayColumns,
  allColumns,
  onColumnsChange,
  configScopeLabel,
  configEnabled,
  onEdit,
  onDelete,
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrator';
  const [showConfig, setShowConfig] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);

  const canShowConfigBtn = isAdmin && configEnabled;

  const dateStr = selectedDate?.format('YYYY-MM-DD') || '';
  const dayItems = useMemo(
    () => workItems.filter((w) => {
      const start = w.startDate || w.endDate;
      const end = w.endDate || w.startDate;
      if (!start || !end) return false;
      return start <= dateStr && end >= dateStr;
    }),
    [workItems, dateStr]
  );

  // Group by (creator, subsystem). Same person across different subsystems = separate groups.
  const personGroups = useMemo(() => {
    const map = new Map();
    dayItems.forEach((item) => {
      const pid = item.createdBy?.employeeId ?? 'unknown';
      const key = `${pid}__${item.subsystem || ''}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          employeeId: pid,
          name: item.createdBy?.name || `ID-${pid}`,
          section: item.section,
          system: item.system,
          subsystem: item.subsystem || null,
          items: [],
        });
      }
      map.get(key).items.push(item);
    });
    // Sort by name then subsystem; items by id desc (newest first)
    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const nameCmp = a.name.localeCompare(b.name, 'zh-Hant');
      if (nameCmp !== 0) return nameCmp;
      return (a.subsystem || '').localeCompare(b.subsystem || '');
    });
    arr.forEach((g) => g.items.sort((a, b) => b.id - a.id));
    return arr;
  }, [dayItems]);

  const columnLabelMap = useMemo(() => {
    const m = {};
    allColumns.forEach((c) => { m[c.key] = c.label; });
    return m;
  }, [allColumns]);

  const toggle = (id) => setExpandedItemId((prev) => (prev === id ? null : id));

  return (
    <div className="wi-sidebar">
      <div className="wi-sidebar-card">
        <div className="card-header">
          <h3>當日工項</h3>
          <div className="card-header-actions">
            <span className="card-date-badge">{dateStr}</span>
            {canShowConfigBtn && (
              <Tooltip title={showConfig ? '收起欄位設定' : '設定顯示欄位'}>
                <button
                  className="wi-icon-btn"
                  onClick={() => setShowConfig((s) => !s)}
                  aria-label="設定顯示欄位"
                >
                  <SettingOutlined />
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {showConfig && canShowConfigBtn && (
          <ColumnConfigPanel
            allColumns={allColumns}
            selectedColumns={displayColumns}
            onChange={onColumnsChange}
            scopeLabel={configScopeLabel}
          />
        )}

        {dayItems.length === 0 && (
          <div className="wi-list-empty">此日無工項紀錄</div>
        )}

        {personGroups.map((group) => (
          <div key={group.key} className="wi-person-group">
            <div className="wi-person-header">
              <span className="wi-person-bar" />
              <span className="wi-person-name">{group.name}</span>
              <span className="wi-person-meta">
                {group.section} / {group.system}{group.subsystem ? ` / ${group.subsystem}` : ''}
              </span>
              <span className="wi-person-count">{group.items.length}</span>
            </div>
            <div className="wi-person-items">
              {group.items.map((item) => {
                const expanded = expandedItemId === item.id;
                return (
                  <WorkItemRow
                    key={item.id}
                    item={item}
                    expanded={expanded}
                    onToggle={() => toggle(item.id)}
                    displayColumns={displayColumns}
                    columnLabelMap={columnLabelMap}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkItemRow({ item, expanded, onToggle, displayColumns, columnLabelMap, onEdit, onDelete }) {
  const renderField = (key) => {
    const value = item[key];
    const isEmpty = value === null || value === undefined || String(value).trim() === '';
    return (
      <div className="wi-item-field" key={key}>
        <span className="wi-item-field-label">{columnLabelMap[key] || key}</span>
        <span className={`wi-item-field-value${isEmpty ? ' muted' : ''}`}>
          {isEmpty ? '—' : String(value)}
        </span>
      </div>
    );
  };

  const collapsedDesc = firstLine(item.description) || '（無描述）';

  return (
    <div className={`wi-item ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="wi-item-summary" onClick={onToggle} role="button" tabIndex={0}>
        <span className="wi-item-summary-text">{collapsedDesc}</span>
        <DownOutlined className={`wi-item-chevron ${expanded ? 'open' : ''}`} />
      </div>

      <div className="wi-item-body">
        <div className="wi-item-body-inner">
          <div className="wi-item-actions-row">
            <Tooltip title="編輯">
              <button className="wi-icon-btn" onClick={(e) => { e.stopPropagation(); onEdit(item); }} aria-label="編輯">
                <EditOutlined />
              </button>
            </Tooltip>
            <Popconfirm
              title="確認刪除此工項？"
              onConfirm={() => onDelete(item.id)}
              okText="刪除"
              cancelText="取消"
              placement="left"
            >
              <button className="wi-icon-btn danger" onClick={(e) => e.stopPropagation()} aria-label="刪除">
                <DeleteOutlined />
              </button>
            </Popconfirm>
          </div>

          {displayColumns.map((key) => renderField(key))}

          <div className="wi-item-meta">
            {item.startDate && item.endDate && item.startDate !== item.endDate && (
              <span>區間：<b>{item.startDate} ~ {item.endDate}</b></span>
            )}
            <span>建立：<b>{item.createdBy?.name || '—'}</b> · {fmtDateTime(item.createdBy?.at)} · #{item.id}</span>
            {item.lastEditedBy && item.lastEditedBy.at !== item.createdBy?.at && (
              <span>最後編輯：<b>{item.lastEditedBy.name}</b> · {fmtDateTime(item.lastEditedBy.at)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
