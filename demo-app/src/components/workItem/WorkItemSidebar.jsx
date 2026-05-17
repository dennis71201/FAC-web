import { useMemo, useState } from 'react';
import { Popconfirm, Tooltip, Button } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ColumnConfigPanel from './ColumnConfigPanel';
import { useAuth } from '../../context/AuthContext';

function fmtDateTime(iso) {
  if (!iso) return '';
  return dayjs(iso).format('MM/DD HH:mm');
}

export default function WorkItemSidebar({
  selectedDate,
  onSelectedDateChange,
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

  const canShowConfigBtn = isAdmin && configEnabled;

  const dateStr = selectedDate?.format('YYYY-MM-DD') || '';
  const dayItems = useMemo(() => {
    const list = workItems.filter((w) => {
      const start = w.startDate || w.endDate;
      const end = w.endDate || w.startDate;
      if (!start || !end) return false;
      return start <= dateStr && end >= dateStr;
    });
    return list.sort((a, b) => b.id - a.id);
  }, [workItems, dateStr]);

  const columnLabelMap = useMemo(() => {
    const m = {};
    allColumns.forEach((c) => { m[c.key] = c.label; });
    return m;
  }, [allColumns]);

  const handlePrev = () => onSelectedDateChange?.(selectedDate.subtract(1, 'day'));
  const handleNext = () => onSelectedDateChange?.(selectedDate.add(1, 'day'));

  return (
    <div className="wi-sidebar">
      <div className="wi-sidebar-card">
        <div className="card-header">
          <div className="card-date-nav">
            <Button
              type="text"
              size="small"
              icon={<LeftOutlined />}
              onClick={handlePrev}
              aria-label="前一天"
            />
            <span className="card-date-text">{dateStr}</span>
            <Button
              type="text"
              size="small"
              icon={<RightOutlined />}
              onClick={handleNext}
              aria-label="後一天"
            />
          </div>
          <div className="card-header-actions">
            <span className="card-count-badge">{dayItems.length} 筆</span>
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

        {dayItems.length > 0 && (
          <div className="wi-item-list">
            {dayItems.map((item) => (
              <WorkItemRow
                key={item.id}
                item={item}
                displayColumns={displayColumns}
                columnLabelMap={columnLabelMap}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkItemRow({ item, displayColumns, columnLabelMap, onEdit, onDelete }) {
  const extraColumns = displayColumns.filter((k) => k !== 'description');

  return (
    <div className="wi-item">
      <div className="wi-item-header">
        <div className="wi-item-tags">
          {item.system && (
            <span className="wi-item-tag subsystem">
              {item.subsystem ? `${item.system}-${item.subsystem}` : item.system}
            </span>
          )}
        </div>
        <div className="wi-item-actions">
          <Tooltip title="編輯">
            <button className="wi-icon-btn" onClick={() => onEdit(item)} aria-label="編輯">
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
            <button className="wi-icon-btn danger" aria-label="刪除">
              <DeleteOutlined />
            </button>
          </Popconfirm>
        </div>
      </div>

      <div className="wi-item-description">{item.description || '（無描述）'}</div>

      {extraColumns.length > 0 && (
        <div className="wi-item-extra-grid">
          {extraColumns.map((key) => {
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
          })}
        </div>
      )}

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
  );
}
