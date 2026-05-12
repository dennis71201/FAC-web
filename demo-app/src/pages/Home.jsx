import { useEffect, useState } from 'react';
import { Button, Space, Spin, message } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import BlockEditor from '../components/BlockEditor';
import { useAuth } from '../context/AuthContext';
import { getHomePageLayout, saveHomePageLayout } from '../services/homepageService';

const EMPTY_LAYOUT = { blocks: [], layout: [] };

export default function Home() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrator';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [layout, setLayout] = useState(EMPTY_LAYOUT);
  const [draftLayout, setDraftLayout] = useState(EMPTY_LAYOUT);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getHomePageLayout()
      .then((result) => {
        if (cancelled) return;
        const next = result?.layout || EMPTY_LAYOUT;
        setLayout(next);
        setDraftLayout(next);
      })
      .catch((err) => {
        if (cancelled) return;
        message.error(err?.message || '載入 homepage 失敗');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnterEdit = () => {
    setDraftLayout(layout);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraftLayout(layout);
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveHomePageLayout(draftLayout);
      setLayout(draftLayout);
      setEditing(false);
      message.success('homepage 已更新');
    } catch (err) {
      message.error(err?.message || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 240 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        {isAdmin && (
          <Space>
            {editing ? (
              <>
                <Button icon={<CloseOutlined />} onClick={handleCancel} disabled={saving}>
                  取消
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={saving}
                >
                  儲存
                </Button>
              </>
            ) : (
              <Button icon={<EditOutlined />} onClick={handleEnterEdit}>
                編輯 homepage
              </Button>
            )}
          </Space>
        )}
      </div>

      <BlockEditor
        value={editing ? draftLayout : layout}
        onChange={editing ? setDraftLayout : undefined}
        readOnly={!editing}
      />
    </div>
  );
}
