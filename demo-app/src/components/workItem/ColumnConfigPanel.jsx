export default function ColumnConfigPanel({ allColumns, selectedColumns, onChange, scopeLabel }) {
  const toggle = (key) => {
    if (selectedColumns.includes(key)) {
      onChange(selectedColumns.filter((c) => c !== key));
    } else {
      onChange([...selectedColumns, key]);
    }
  };

  return (
    <div className="wi-column-config">
      <div className="wi-column-config-title">
        右側欄顯示欄位設定（{scopeLabel}）
      </div>
      <div className="wi-column-config-list">
        {allColumns.map((col) => {
          const checked = selectedColumns.includes(col.key);
          return (
            <label key={col.key} className={col.required ? 'disabled' : ''}>
              <input
                type="checkbox"
                checked={checked}
                disabled={col.required}
                onChange={() => !col.required && toggle(col.key)}
              />
              {col.label}
              {col.required && <span style={{ fontSize: 10, marginLeft: 2 }}>(必)</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}
