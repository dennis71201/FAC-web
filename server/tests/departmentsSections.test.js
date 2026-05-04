import { describe, it, expect, afterAll } from 'vitest';
import { api } from './helpers.js';
import { closePool } from '../src/config/db.js';

afterAll(async () => {
  await closePool();
});

describe('GET /api/departments-sections', () => {
  it('不需 token 即可呼叫', async () => {
    const res = await api().get('/api/departments-sections');
    expect(res.status).toBe(200);
  });

  it('回傳 9 筆部門課別對照', async () => {
    const res = await api().get('/api/departments-sections');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(9);
  });

  it('包含必要欄位 DepartmentAndSectionId / DepartmentName / SectionName', async () => {
    const res = await api().get('/api/departments-sections');
    const first = res.body.data[0];
    expect(first).toHaveProperty('DepartmentAndSectionId');
    expect(first).toHaveProperty('DepartmentName');
    expect(first).toHaveProperty('SectionName');
  });

  it('依 DepartmentAndSectionId 排序', async () => {
    const res = await api().get('/api/departments-sections');
    const ids = res.body.data.map((r) => r.DepartmentAndSectionId);
    const sorted = [...ids].sort((a, b) => a - b);
    expect(ids).toEqual(sorted);
  });

  it('包含已知對照（Building / EI、Process / WTS）', async () => {
    const res = await api().get('/api/departments-sections');
    const labels = res.body.data.map((r) => `${r.DepartmentName}/${r.SectionName}`);
    expect(labels).toContain('Building/EI');
    expect(labels).toContain('Process/WTS');
  });
});
