import { useCallback, useEffect, useState } from 'react';
import { Alert, DatePicker, Input, Select } from 'antd';
import { CloseOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
const { RangePicker } = DatePicker;

function hasAnyOptionalValue(item) {
  if (!item) return false;
  return Boolean(item.vendor || item.affected || item.reason || item.moveLoss);
}

function buildInitialValues({ mode, initialValue, defaultDate, defaultEmployeeSectionId, defaultSubsystem, sites }) {
  if (mode === 'edit' && initialValue) {
    return {
      site: initialValue.site || '',
      dateRange: [
        initialValue.startDate ? dayjs(initialValue.startDate) : null,
        initialValue.endDate ? dayjs(initialValue.endDate) : null,
      ],
      description: initialValue.description || '',
      affected: initialValue.affected || '',
      reason: initialValue.reason || '',
      moveLoss: initialValue.moveLoss || '',
      employeeSectionId: initialValue.employeeSectionId || null,
      subsystem: initialValue.subsystem || null,
      vendor: initialValue.vendor || '',
    };
  }
  const base = defaultDate || dayjs();
  return {
    site: sites[0] || '',
    dateRange: [base, base],
    description: '',
    affected: '',
    reason: '',
    moveLoss: '',
    employeeSectionId: defaultEmployeeSectionId || null,
    subsystem: defaultSubsystem || null,
    vendor: '',
  };
}

export default function WorkItemForm(props) {
  const {
    mode,
    groupedSystemOptions,
    getSubsystemsBySectionId,
    sites,
    onClose,
    onSubmit,
    submitting,
  } = props;

  const [values, setValues] = useState(() => buildInitialValues(props));
  const [error, setError] = useState('');
  const [showOptional, setShowOptional] = useState(() =>
    props.mode === 'edit' && hasAnyOptionalValue(props.initialValue)
  );

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const subsystemList = values.employeeSectionId
    ? getSubsystemsBySectionId(values.employeeSectionId)
    : null;
  const subsystemOptions = Array.isArray(subsystemList)
    ? subsystemList.map((s) => ({ label: s, value: s }))
    : null;

  const update = (patch) => setValues((v) => ({ ...v, ...patch }));

  const [startD, endD] = values.dateRange || [];
  const canSubmit =
    values.site && startD && endD && values.description.trim() && values.employeeSectionId &&
    (subsystemOptions ? !!values.subsystem : true);

  const handleSubmit = () => {
    if (!canSubmit) {
      setError('請完成必填欄位');
      return;
    }
    onSubmit({
      ...values,
      startDate: startD.format('YYYY-MM-DD'),
      endDate: endD.format('YYYY-MM-DD'),
      subsystem: subsystemOptions ? values.subsystem : null,
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="wi-modal-overlay" onClick={handleOverlayClick}>
      <div className="wi-modal-card" role="dialog" aria-modal="true">
        <div className="wi-modal-header">
          <h2>{mode === 'edit' ? '編輯工項' : '新增工項'}</h2>
          <button className="wi-modal-close" onClick={onClose} aria-label="關閉">
            <CloseOutlined />
          </button>
        </div>

        <div className="wi-modal-body">
          <Field label="Site" required>
            <Select
              value={values.site || undefined}
              onChange={(v) => update({ site: v })}
              options={sites.map((s) => ({ label: s, value: s }))}
              placeholder="選擇 Site"
            />
          </Field>
          <Field label="When" required>
            <RangePicker
              value={values.dateRange}
              onChange={(range) => update({ dateRange: range || [null, null] })}
              allowClear={false}
              style={{ width: '100%' }}
            />
          </Field>

          <Field label="System" required>
            <Select
              value={values.employeeSectionId || undefined}
              onChange={(v) => update({ employeeSectionId: v, subsystem: null })}
              options={groupedSystemOptions}
              placeholder="選擇 System"
              showSearch
              optionFilterProp="label"
            />
          </Field>
          {subsystemOptions && (
            <Field label="Subsystem" required>
              <Select
                value={values.subsystem || undefined}
                onChange={(v) => update({ subsystem: v })}
                options={subsystemOptions}
                placeholder="選擇 Subsystem"
              />
            </Field>
          )}

          <Field label="Description" required className="full-row">
            <Input.TextArea
              value={values.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="工項詳細內容，可換行輸入"
              autoSize={{ minRows: 3, maxRows: 8 }}
            />
          </Field>

          <div className="full-row">
            <button
              type="button"
              className="wi-modal-optional-toggle"
              onClick={() => setShowOptional((s) => !s)}
            >
              <DownOutlined className={showOptional ? 'open' : ''} />
              {showOptional ? '收起其他欄位' : '展開填寫其他欄位 (Vendor / Affected / Reason / Move Loss)'}
            </button>
          </div>

          {showOptional && (
            <>
              <Field label="Vendor">
                <Input
                  value={values.vendor}
                  onChange={(e) => update({ vendor: e.target.value })}
                  placeholder="例如：帆宣"
                />
              </Field>
              <Field label="Affected">
                <Input
                  value={values.affected}
                  onChange={(e) => update({ affected: e.target.value })}
                  placeholder="例如：F11 P3"
                />
              </Field>
              <Field label="Reason">
                <Input
                  value={values.reason}
                  onChange={(e) => update({ reason: e.target.value })}
                  placeholder="原因說明"
                />
              </Field>
              <Field label="Move Loss">
                <Input
                  value={values.moveLoss}
                  onChange={(e) => update({ moveLoss: e.target.value })}
                  placeholder="例如：~500 wafers"
                />
              </Field>
            </>
          )}

          {error && (
            <div className="full-row">
              <Alert type="error" showIcon message={error} />
            </div>
          )}
        </div>

        <div className="wi-modal-actions">
          <button className="wi-modal-btn-cancel" onClick={onClose}>取消</button>
          <button
            className="wi-modal-btn-submit"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? '送出中...' : mode === 'edit' ? '儲存變更' : '新增工項'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children, className }) {
  return (
    <div className={`wi-modal-field${className ? ` ${className}` : ''}`}>
      <span className="wi-modal-field-label">
        {label}
        {required && <span className="required">*</span>}
      </span>
      {children}
    </div>
  );
}
