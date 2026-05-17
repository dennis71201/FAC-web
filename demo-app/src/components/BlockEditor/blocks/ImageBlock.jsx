import { useState } from 'react';
import { Upload, Button, Input, App } from 'antd';
import { UploadOutlined, PictureOutlined } from '@ant-design/icons';
import { uploadFile, resolveAssetUrl } from '../utils';

export default function ImageBlock({ data, readOnly, onChange }) {
  const [uploading, setUploading] = useState(false);
  const { message } = App.useApp();

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const result = await uploadFile(file);
      if (result?.warning) {
        message.warning(result.warning);
      }
      onChange?.({ ...data, url: result.url, alt: data?.alt || file.name });
    } catch (err) {
      message.error(err?.message || '上傳失敗');
    } finally {
      setUploading(false);
    }
    return false;
  };

  if (readOnly) {
    if (!data?.url) {
      return (
        <div className="image-block-empty">
          <PictureOutlined style={{ fontSize: 32, color: '#cbd5e1' }} />
        </div>
      );
    }
    return (
      <figure className="image-block-view">
        <img src={resolveAssetUrl(data.url)} alt={data.alt || ''} />
        {data.caption && <figcaption>{data.caption}</figcaption>}
      </figure>
    );
  }

  return (
    <div className="image-block-edit">
      {data?.url ? (
        <img
          className="image-block-preview"
          src={resolveAssetUrl(data.url)}
          alt={data.alt || ''}
        />
      ) : (
        <div className="image-block-empty">
          <PictureOutlined style={{ fontSize: 32, color: '#cbd5e1' }} />
        </div>
      )}
      <div className="image-block-controls" onMouseDown={(e) => e.stopPropagation()}>
        <Upload
          accept="image/*"
          beforeUpload={handleUpload}
          showUploadList={false}
          disabled={uploading}
        >
          <Button icon={<UploadOutlined />} loading={uploading} size="small">
            {data?.url ? '更換圖片' : '上傳圖片'}
          </Button>
        </Upload>
        <Input
          size="small"
          placeholder="圖片說明（選填）"
          value={data?.caption || ''}
          onChange={(e) => onChange?.({ ...data, caption: e.target.value })}
        />
      </div>
    </div>
  );
}
