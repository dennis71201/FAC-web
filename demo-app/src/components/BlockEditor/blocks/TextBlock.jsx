import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Space, Button, Tooltip } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { sanitizeHtml } from '../utils';

export default function TextBlock({ data, readOnly, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    ],
    content: data?.html || '',
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => {
      onChange?.({ html: ed.getHTML() });
    },
  }, [readOnly]);

  if (readOnly) {
    return (
      <div
        className="text-block-view"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(data?.html || '') }}
      />
    );
  }

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('輸入網址', previous);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="text-block-edit">
      <Space size={4} className="text-block-toolbar" wrap>
        <Tooltip title="粗體">
          <Button
            size="small"
            type={editor.isActive('bold') ? 'primary' : 'default'}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
        </Tooltip>
        <Tooltip title="斜體">
          <Button
            size="small"
            type={editor.isActive('italic') ? 'primary' : 'default'}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
        </Tooltip>
        <Tooltip title="底線">
          <Button
            size="small"
            type={editor.isActive('underline') ? 'primary' : 'default'}
            icon={<UnderlineOutlined />}
            onClick={() => editor.chain().focus().toggleUnderline?.().run()}
          />
        </Tooltip>
        <Tooltip title="刪除線">
          <Button
            size="small"
            type={editor.isActive('strike') ? 'primary' : 'default'}
            icon={<StrikethroughOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
        </Tooltip>
        <Tooltip title="標題 H2">
          <Button
            size="small"
            type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </Button>
        </Tooltip>
        <Tooltip title="標題 H3">
          <Button
            size="small"
            type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </Button>
        </Tooltip>
        <Tooltip title="項目符號">
          <Button
            size="small"
            type={editor.isActive('bulletList') ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
        </Tooltip>
        <Tooltip title="編號清單">
          <Button
            size="small"
            type={editor.isActive('orderedList') ? 'primary' : 'default'}
            icon={<OrderedListOutlined />}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
        </Tooltip>
        <Tooltip title="超連結">
          <Button
            size="small"
            type={editor.isActive('link') ? 'primary' : 'default'}
            icon={<LinkOutlined />}
            onClick={setLink}
          />
        </Tooltip>
      </Space>
      <EditorContent editor={editor} className="text-block-content" />
    </div>
  );
}
