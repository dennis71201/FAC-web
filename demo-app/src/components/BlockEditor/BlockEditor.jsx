import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './BlockEditor.css';

import GridLayout, { useContainerWidth } from 'react-grid-layout';
import { Button, Popconfirm } from 'antd';
import {
  FontSizeOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  LinkOutlined,
  DeleteOutlined,
  HolderOutlined,
} from '@ant-design/icons';

import TextBlock from './blocks/TextBlock';
import ImageBlock from './blocks/ImageBlock';
import VideoBlock from './blocks/VideoBlock';
import LinkBlock from './blocks/LinkBlock';

import {
  BLOCK_TYPES,
  createDefaultBlock,
  createDefaultLayoutItem,
} from './utils';

const BLOCK_RENDERERS = {
  [BLOCK_TYPES.TEXT]: TextBlock,
  [BLOCK_TYPES.IMAGE]: ImageBlock,
  [BLOCK_TYPES.VIDEO]: VideoBlock,
  [BLOCK_TYPES.LINK]: LinkBlock,
};

const BLOCK_LABELS = {
  [BLOCK_TYPES.TEXT]: '文字',
  [BLOCK_TYPES.IMAGE]: '圖片',
  [BLOCK_TYPES.VIDEO]: '影片',
  [BLOCK_TYPES.LINK]: '連結',
};

export default function BlockEditor({ value, onChange, readOnly }) {
  const { width, containerRef, mounted } = useContainerWidth();
  const blocks = value?.blocks || [];
  const layout = value?.layout || [];

  const addBlock = (type) => {
    const block = createDefaultBlock(type);
    const layoutItem = createDefaultLayoutItem(block.id, type);
    onChange?.({
      blocks: [...blocks, block],
      layout: [...layout, layoutItem],
    });
  };

  const removeBlock = (id) => {
    onChange?.({
      blocks: blocks.filter((b) => b.id !== id),
      layout: layout.filter((l) => l.i !== id),
    });
  };

  const updateBlockData = (id, newData) => {
    onChange?.({
      ...value,
      blocks: blocks.map((b) => (b.id === id ? { ...b, data: newData } : b)),
      layout,
    });
  };

  const handleLayoutChange = (newLayout) => {
    if (readOnly) return;
    onChange?.({
      blocks,
      layout: newLayout.map((l) => ({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h })),
    });
  };

  return (
    <div className={`block-editor ${readOnly ? '' : 'editable'}`}>
      {!readOnly && (
        <div className="block-editor-toolbar">
          <span className="block-editor-toolbar-label">新增區塊：</span>
          <Button icon={<FontSizeOutlined />} onClick={() => addBlock(BLOCK_TYPES.TEXT)}>
            文字
          </Button>
          <Button icon={<PictureOutlined />} onClick={() => addBlock(BLOCK_TYPES.IMAGE)}>
            圖片
          </Button>
          <Button icon={<VideoCameraOutlined />} onClick={() => addBlock(BLOCK_TYPES.VIDEO)}>
            影片
          </Button>
          <Button icon={<LinkOutlined />} onClick={() => addBlock(BLOCK_TYPES.LINK)}>
            連結
          </Button>
        </div>
      )}

      <div ref={containerRef}>
        {mounted && (
          <GridLayout
            width={width}
            layout={layout}
            cols={12}
            rowHeight={40}
            margin={[12, 12]}
            dragConfig={{ enabled: !readOnly, handle: '.block-item-header' }}
            resizeConfig={{ enabled: !readOnly, handles: ['se', 'e', 's'] }}
            onLayoutChange={handleLayoutChange}
            useCSSTransforms
          >
            {blocks.map((block) => {
              const Renderer = BLOCK_RENDERERS[block.type];
              if (!Renderer) return null;
              return (
                <div key={block.id} className="block-item">
                  <div className={`block-item-header ${readOnly ? 'readonly' : ''}`}>
                    <span>
                      <HolderOutlined /> {BLOCK_LABELS[block.type]}
                    </span>
                    <span onMouseDown={(e) => e.stopPropagation()}>
                      <Popconfirm
                        title="刪除此區塊？"
                        onConfirm={() => removeBlock(block.id)}
                        okText="刪除"
                        cancelText="取消"
                      >
                        <Button
                          size="small"
                          type="text"
                          icon={<DeleteOutlined />}
                          danger
                        />
                      </Popconfirm>
                    </span>
                  </div>
                  <div className="block-item-body">
                    <Renderer
                      data={block.data}
                      readOnly={readOnly}
                      onChange={(newData) => updateBlockData(block.id, newData)}
                    />
                  </div>
                </div>
              );
            })}
          </GridLayout>
        )}
      </div>

      {blocks.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
          {readOnly ? '首頁尚未配置內容' : '尚無區塊，請從上方工具列新增'}
        </div>
      )}
    </div>
  );
}
