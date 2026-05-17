import dayjs from 'dayjs';
import {
  mockWorkItems,
  EMPLOYEE_SECTIONS,
  SUBSYSTEMS_BY_SECTION_ID,
  SITES,
  ALL_COLUMNS,
} from '../mock/workItems';

const COLUMNS_KEY_PREFIX = 'fac.workitem.columns.v2.';

const sectionById = new Map(EMPLOYEE_SECTIONS.map((s) => [s.id, s]));

function expand(item) {
  const sec = sectionById.get(item.employeeSectionId);
  return {
    ...item,
    section: sec?.sectionName || '',
    system: sec?.systemName || '',
  };
}

// Clean up legacy localStorage keys from earlier mock versions (records.v2 ~ v6).
// These bloated localStorage quota. Records are now in-memory only.
(function cleanupLegacyKeys() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith('fac.workitem.records.')) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
})();

// In-memory store. Resets on page refresh (acceptable for mock phase).
let inMemoryStore = null;

function loadStore() {
  if (inMemoryStore === null) {
    inMemoryStore = JSON.parse(JSON.stringify(mockWorkItems));
  }
  return inMemoryStore;
}

function saveStore(items) {
  inMemoryStore = items;
}

function delay(ms = 120) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getWorkItems({ year, month, site, employeeSectionId, subsystem } = {}) {
  await delay();
  let list = loadStore();
  if (year && month) {
    const monthStart = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').format('YYYY-MM-DD');
    const monthEnd = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');
    // Range overlap: item.startDate <= monthEnd AND item.endDate >= monthStart
    list = list.filter((w) => w.startDate <= monthEnd && w.endDate >= monthStart);
  }
  if (site) list = list.filter((w) => w.site === site);
  if (employeeSectionId) list = list.filter((w) => w.employeeSectionId === employeeSectionId);
  if (subsystem) list = list.filter((w) => w.subsystem === subsystem);
  return list.map(expand);
}

export async function createWorkItem(payload, currentUser) {
  await delay();
  const list = loadStore();
  const nextId = (list.reduce((m, w) => Math.max(m, w.id), 0) || 0) + 1;
  const now = new Date().toISOString();
  const author = {
    employeeId: currentUser?.employeeId ?? 0,
    name: currentUser?.name ?? '未知使用者',
    at: now,
  };
  const newItem = {
    id: nextId,
    site: payload.site,
    startDate: payload.startDate,
    endDate: payload.endDate || payload.startDate,
    description: payload.description,
    affected: payload.affected || '',
    reason: payload.reason || '',
    moveLoss: payload.moveLoss || '',
    employeeSectionId: Number(payload.employeeSectionId),
    subsystem: payload.subsystem || null,
    vendor: payload.vendor || '',
    createdBy: author,
    lastEditedBy: author,
  };
  list.push(newItem);
  saveStore(list);
  return expand(newItem);
}

export async function updateWorkItem(id, payload, currentUser) {
  await delay();
  const list = loadStore();
  const idx = list.findIndex((w) => w.id === id);
  if (idx < 0) throw new Error('Work item not found');
  const editor = {
    employeeId: currentUser?.employeeId ?? 0,
    name: currentUser?.name ?? '未知使用者',
    at: new Date().toISOString(),
  };
  list[idx] = {
    ...list[idx],
    site: payload.site,
    startDate: payload.startDate,
    endDate: payload.endDate || payload.startDate,
    description: payload.description,
    affected: payload.affected || '',
    reason: payload.reason || '',
    moveLoss: payload.moveLoss || '',
    employeeSectionId: Number(payload.employeeSectionId),
    subsystem: payload.subsystem || null,
    vendor: payload.vendor || '',
    lastEditedBy: editor,
  };
  saveStore(list);
  return expand(list[idx]);
}

export async function deleteWorkItem(id) {
  await delay();
  const list = loadStore();
  const next = list.filter((w) => w.id !== id);
  saveStore(next);
  return { id };
}

function columnKey(employeeSectionId) {
  return `${COLUMNS_KEY_PREFIX}${employeeSectionId ?? 'all'}`;
}

export function getDisplayColumns(employeeSectionId) {
  if (!employeeSectionId) return ['description'];
  try {
    const raw = localStorage.getItem(columnKey(employeeSectionId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (!parsed.includes('description')) {
          parsed.unshift('description');
        }
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return ['description'];
}

export function saveDisplayColumns(employeeSectionId, columns) {
  if (!employeeSectionId) return;
  const ensured = columns.includes('description') ? columns : ['description', ...columns];
  localStorage.setItem(columnKey(employeeSectionId), JSON.stringify(ensured));
}

export function getEmployeeSections() {
  return EMPLOYEE_SECTIONS;
}

export function getSectionById(id) {
  return sectionById.get(Number(id)) || null;
}

export function getSubsystemsBySectionId(employeeSectionId) {
  return SUBSYSTEMS_BY_SECTION_ID[employeeSectionId] || null;
}

export function getSites() {
  return SITES;
}

export function getAllColumns() {
  return ALL_COLUMNS;
}

/** Build Ant Design grouped Select options: [{ label: section, options: [{ label: system, value: sectionId }] }] */
export function getGroupedSystemOptions() {
  const groups = new Map();
  EMPLOYEE_SECTIONS.forEach((s) => {
    if (!groups.has(s.sectionName)) {
      groups.set(s.sectionName, []);
    }
    groups.get(s.sectionName).push({ label: s.systemName, value: s.id });
  });
  return Array.from(groups.entries()).map(([sectionName, options]) => ({
    label: sectionName,
    options,
  }));
}
