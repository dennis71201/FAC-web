import { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { uploadFile, resolveAssetUrl } from '../utils';

export default function VideoBlock({ data, readOnly, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const result = await uploadFile(file);
      if (result?.warning) {
        message.warning(result.warning);
      }
      onChange?.({ ...data, url: result.url });
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
        <div className="video-block-empty">
          <VideoCameraOutlined style={{ fontSize: 32, color: '#cbd5e1' }} />
        </div>
      );
    }
    return (
      <video className="video-block-view" controls src={resolveAssetUrl(data.url)} />
    );
  }

  return (
    <div className="video-block-edit">
      {data?.url ? (
        <video
          className="video-block-preview"
          controls
          src={resolveAssetUrl(data.url)}
        />
      ) : (
        <div className="video-block-empty">
          <VideoCameraOutlined style={{ fontSize: 32, color: '#cbd5e1' }} />
        </div>
      )}
      <div className="video-block-controls" onMouseDown={(e) => e.stopPropagation()}>
        <Upload
          accept="video/*"
          beforeUpload={handleUpload}
          showUploadList={false}
          disabled={uploading}
        >
          <Button icon={<UploadOutlined />} loading={uploading} size="small">
            {data?.url ? '更換影片' : '上傳影片'}
          </Button>
        </Upload>
      </div>
    </div>
  );
}
