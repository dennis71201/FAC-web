import { describe, it, expect } from 'vitest';
import {
  generateBlockId,
  resolveAssetUrl,
  createDefaultBlock,
  createDefaultLayoutItem,
  BLOCK_TYPES,
} from './utils.js';

describe('generateBlockId', () => {
  it('回傳以 b_ 開頭的非空字串', () => {
    const id = generateBlockId();
    expect(id).toMatch(/^b_/);
    expect(id.length).toBeGreaterThan(2);
  });

  it('連續呼叫產生的 id 互不相同', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i += 1) {
      ids.add(generateBlockId());
    }
    expect(ids.size).toBe(100);
  });
});

describe('resolveAssetUrl', () => {
  it('空值回傳空字串', () => {
    expect(resolveAssetUrl('')).toBe('');
    expect(resolveAssetUrl(null)).toBe('');
    expect(resolveAssetUrl(undefined)).toBe('');
  });

  it('絕對 http URL 直接回傳', () => {
    expect(resolveAssetUrl('http://example.com/a.png')).toBe('http://example.com/a.png');
    expect(resolveAssetUrl('https://example.com/a.png')).toBe('https://example.com/a.png');
  });

  it('相對路徑加上 API base 前綴', () => {
    const url = resolveAssetUrl('/uploads/x.jpg');
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toMatch(/\/uploads\/x\.jpg$/);
  });

  it('沒有開頭斜線的相對路徑也會被處理', () => {
    const url = resolveAssetUrl('uploads/x.jpg');
    expect(url).toMatch(/\/uploads\/x\.jpg$/);
  });
});

describe('createDefaultBlock', () => {
  it('text 區塊有 html 欄位', () => {
    const block = createDefaultBlock(BLOCK_TYPES.TEXT);
    expect(block.type).toBe('text');
    expect(block.data).toHaveProperty('html');
    expect(typeof block.data.html).toBe('string');
    expect(block.id).toMatch(/^b_/);
  });

  it('image 區塊有 url、alt、caption 欄位', () => {
    const block = createDefaultBlock(BLOCK_TYPES.IMAGE);
    expect(block.type).toBe('image');
    expect(block.data).toMatchObject({ url: '', alt: '', caption: '' });
  });

  it('video 區塊有 url 欄位', () => {
    const block = createDefaultBlock(BLOCK_TYPES.VIDEO);
    expect(block.type).toBe('video');
    expect(block.data).toHaveProperty('url');
  });

  it('link 區塊有 url、label、description 欄位', () => {
    const block = createDefaultBlock(BLOCK_TYPES.LINK);
    expect(block.type).toBe('link');
    expect(block.data).toHaveProperty('url');
    expect(block.data).toHaveProperty('label');
    expect(block.data).toHaveProperty('description');
  });

  it('未知 type 拋例外', () => {
    expect(() => createDefaultBlock('unknown')).toThrow();
  });

  it('每次呼叫拿到不同 id', () => {
    const a = createDefaultBlock(BLOCK_TYPES.TEXT);
    const b = createDefaultBlock(BLOCK_TYPES.TEXT);
    expect(a.id).not.toBe(b.id);
  });
});

describe('createDefaultLayoutItem', () => {
  it('text 預設較寬 (w=6 h=4)', () => {
    const item = createDefaultLayoutItem('id1', BLOCK_TYPES.TEXT);
    expect(item).toMatchObject({ i: 'id1', x: 0, w: 6, h: 4 });
    expect(item.y).toBe(Infinity); // 自動排到底
  });

  it('image 預設 4x6', () => {
    const item = createDefaultLayoutItem('id2', BLOCK_TYPES.IMAGE);
    expect(item).toMatchObject({ i: 'id2', w: 4, h: 6 });
  });

  it('video 預設 6x6', () => {
    const item = createDefaultLayoutItem('id3', BLOCK_TYPES.VIDEO);
    expect(item).toMatchObject({ i: 'id3', w: 6, h: 6 });
  });

  it('link 預設較小 (w=3 h=2)', () => {
    const item = createDefaultLayoutItem('id4', BLOCK_TYPES.LINK);
    expect(item).toMatchObject({ i: 'id4', w: 3, h: 2 });
  });

  it('未知 type 給 fallback 尺寸', () => {
    const item = createDefaultLayoutItem('id5', 'unknown');
    expect(item.w).toBeGreaterThan(0);
    expect(item.h).toBeGreaterThan(0);
  });
});

describe('BLOCK_TYPES 常數', () => {
  it('包含 text/image/video/link 四種', () => {
    expect(BLOCK_TYPES).toMatchObject({
      TEXT: 'text',
      IMAGE: 'image',
      VIDEO: 'video',
      LINK: 'link',
    });
  });
});
