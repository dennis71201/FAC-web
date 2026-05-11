import { Input } from 'antd';
import { LinkOutlined } from '@ant-design/icons';

export default function LinkBlock({ data, readOnly, onChange }) {
  if (readOnly) {
    const href = data?.url || '#';
    return (
      <a
        className="link-block-view"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        <LinkOutlined className="link-block-icon" />
        <div className="link-block-text">
          <div className="link-block-label">{data?.label || '未命名連結'}</div>
          {data?.description && (
            <div className="link-block-description">{data.description}</div>
          )}
        </div>
      </a>
    );
  }

  return (
    <div className="link-block-edit" onMouseDown={(e) => e.stopPropagation()}>
      <Input
        size="small"
        placeholder="顯示名稱"
        value={data?.label || ''}
        onChange={(e) => onChange?.({ ...data, label: e.target.value })}
      />
      <Input
        size="small"
        placeholder="網址 https://..."
        value={data?.url || ''}
        onChange={(e) => onChange?.({ ...data, url: e.target.value })}
      />
      <Input
        size="small"
        placeholder="說明（選填）"
        value={data?.description || ''}
        onChange={(e) => onChange?.({ ...data, description: e.target.value })}
      />
    </div>
  );
}
