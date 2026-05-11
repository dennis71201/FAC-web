import DOMPurify from 'dompurify';
import apiClient from '../../services/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function generateBlockId() {
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function sanitizeHtml(html) {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'span', 'strong', 'em', 'u', 's', 'a',
      'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote',
      'code', 'pre',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}

export function resolveAssetUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/api/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0,
  });
  return response.data?.data;
}

export const BLOCK_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  LINK: 'link',
};

export function createDefaultBlock(type) {
  const id = generateBlockId();
  switch (type) {
    case BLOCK_TYPES.TEXT:
      return { id, type, data: { html: '<p>新文字區塊</p>' } };
    case BLOCK_TYPES.IMAGE:
      return { id, type, data: { url: '', alt: '', caption: '' } };
    case BLOCK_TYPES.VIDEO:
      return { id, type, data: { url: '' } };
    case BLOCK_TYPES.LINK:
      return { id, type, data: { url: '', label: '新連結', description: '' } };
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
}

export function createDefaultLayoutItem(id, type) {
  const sizeByType = {
    [BLOCK_TYPES.TEXT]: { w: 6, h: 4 },
    [BLOCK_TYPES.IMAGE]: { w: 4, h: 6 },
    [BLOCK_TYPES.VIDEO]: { w: 6, h: 6 },
    [BLOCK_TYPES.LINK]: { w: 3, h: 2 },
  };
  const { w, h } = sizeByType[type] || { w: 4, h: 3 };
  return { i: id, x: 0, y: Infinity, w, h };
}
