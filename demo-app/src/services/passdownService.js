/**
 * Passdown Service
 * Mock-backed API service for Passdown feature
 * Designed for future backend integration with API contracts
 */

import {
  passdownData,
  abnormalLogsData,
  passdownSections,
  sites,
  passdownTypes,
  passdownStatuses,
  getInitialPassdownStatus,
  getAbnormalLogsForPassdown,
  getSectionOptions,
  getSystemOptionsBySection,
  getSubSystemOptionsBySystemAndSection,
} from '../mock/passdown';

// Simulated delay for async operations
const API_DELAY = 300;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toAttachmentMeta = (attachment) => {
  if (!attachment) {
    return null;
  }

  if (typeof attachment === 'string') {
    const fileName = attachment.trim();
    if (!fileName) {
      return null;
    }

    return {
      fileId: `legacy-${fileName}`,
      fileName,
      mimeType: 'application/octet-stream',
      fileSize: 0,
      uploadedAt: null,
      uploadedBy: null,
      storageKey: fileName,
      downloadUrl: '',
    };
  }

  const fileName = (attachment.fileName || attachment.name || '').toString().trim();
  if (!fileName) {
    return null;
  }

  return {
    fileId: (attachment.fileId || `legacy-${fileName}`).toString(),
    fileName,
    mimeType: (attachment.mimeType || attachment.type || 'application/octet-stream').toString(),
    fileSize: Number.isFinite(Number(attachment.fileSize || attachment.size)) ? Number(attachment.fileSize || attachment.size) : 0,
    uploadedAt: attachment.uploadedAt || null,
    uploadedBy: Number.isFinite(Number(attachment.uploadedBy)) ? Number(attachment.uploadedBy) : null,
    storageKey: (attachment.storageKey || fileName).toString(),
    downloadUrl: (attachment.downloadUrl || '').toString(),
  };
};

const normalizeAttachmentList = (attachments) => {
  if (!Array.isArray(attachments)) {
    return null;
  }

  const normalized = attachments
    .map((item) => toAttachmentMeta(item))
    .filter(Boolean);

  return normalized.length > 0 ? normalized : null;
};

/**
 * Get all passdown records with optional filtering
 * @param {Object} filters - Filter criteria {siteId, status, keyword, dateFrom, dateTo, section, system, subsystem}
 * @param {Object} pagination - Pagination {page, pageSize}
 * @returns {Promise<{data: Array, total: Number, page: Number, pageSize: Number}>}
 */
export const getPassdownRecords = async (filters = {}, pagination = { page: 1, pageSize: 20 }) => {
  await delay(API_DELAY);

  let result = [...passdownData];

  // Apply filters
  if (filters.siteId) {
    result = result.filter((r) => r.siteId === filters.siteId);
  }

  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    result = result.filter((r) => statuses.includes(r.passdownStatus));
  }

  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    result = result.filter(
      (r) =>
        r.passdownDescription.toLowerCase().includes(kw) ||
        r.passdownSectionName.toLowerCase().includes(kw) ||
        r.passdownSystemName.toLowerCase().includes(kw),
    );
  }

  if (filters.dateFrom || filters.dateTo) {
    result = result.filter((r) => {
      const recordTime = new Date(r.passdownTime);
      if (filters.dateFrom && recordTime < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && recordTime > new Date(filters.dateTo)) return false;
      return true;
    });
  }

  if (filters.section) {
    result = result.filter((r) => r.passdownSectionName === filters.section);
  }

  if (filters.system) {
    result = result.filter((r) => r.passdownSystemName === filters.system);
  }

  if (filters.subsystem) {
    result = result.filter((r) => r.passdownSubSystemName === filters.subsystem);
  }

  const total = result.length;
  const start = (pagination.page - 1) * pagination.pageSize;
  const paginatedResult = result.slice(start, start + pagination.pageSize);

  return {
    data: paginatedResult,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
};

/**
 * Get single passdown record by ID
 * @param {Number} passdownId
 * @returns {Promise<Object|null>}
 */
export const getPassdownRecord = async (passdownId) => {
  await delay(API_DELAY);
  return passdownData.find((r) => r.id === passdownId) || null;
};

/**
 * Create new passdown record
 * @param {Object} payload - {passdownTime, passdownType, siteId, passdownSectionId, passdownSectionName, passdownSystemName, passdownSubSystemName, passdownDescription, createEmployeeId, receiveEmployeeId, passdownAttachments}
 * @returns {Promise<Object>}
 */
export const createPassdownRecord = async (payload) => {
  await delay(API_DELAY);

  const newRecord = {
    id: Math.max(...passdownData.map((r) => r.id), 0) + 1,
    ...payload,
    passdownAttachments: normalizeAttachmentList(payload.passdownAttachments),
    passdownStatus: getInitialPassdownStatus(payload.passdownType),
  };

  passdownData.unshift(newRecord);

  return newRecord;
};

/**
 * Update passdown record
 * @param {Number} passdownId
 * @param {Object} payload - Partial update payload
 * @returns {Promise<Object|null>}
 */
export const updatePassdownRecord = async (passdownId, payload) => {
  await delay(API_DELAY);

  const index = passdownData.findIndex((r) => r.id === passdownId);
  if (index === -1) return null;

  const updated = {
    ...passdownData[index],
    ...payload,
    passdownAttachments: normalizeAttachmentList(payload.passdownAttachments),
  };
  passdownData[index] = updated;

  return updated;
};

/**
 * Delete (soft-delete) passdown record
 * In this mock, we remove from array. In real backend, set IsAlive=0
 * @param {Number} passdownId
 * @returns {Promise<Boolean>}
 */
export const deletePassdownRecord = async (passdownId) => {
  await delay(API_DELAY);

  const index = passdownData.findIndex((r) => r.id === passdownId);
  if (index === -1) return false;

  passdownData.splice(index, 1);
  // Also remove associated abnormal logs
  const logIndices = abnormalLogsData
    .map((l, i) => (l.passdownId === passdownId ? i : -1))
    .filter((i) => i !== -1);

  for (let i = logIndices.length - 1; i >= 0; i--) {
    abnormalLogsData.splice(logIndices[i], 1);
  }

  return true;
};

/**
 * Get abnormal logs for a passdown record
 * @param {Number} passdownId
 * @returns {Promise<Array>}
 */
export const getAbnormalLogs = async (passdownId) => {
  await delay(API_DELAY);
  return getAbnormalLogsForPassdown(passdownId);
};

/**
 * Add abnormal log response
 * Handles status transition logic:
 * - First reply with isClosed=false -> passdown status becomes "處理中"
 * - Any reply with isClosed=true -> passdown status becomes "已結案"
 * @param {Number} passdownId
 * @param {Object} payload - {rcContent, caContent, paContent, planDate, dueDate, isClosed, responseEmployeeId, responseEmployeeName, responseAttachments}
 * @returns {Promise<Object>}
 */
export const addAbnormalLog = async (passdownId, payload) => {
  await delay(API_DELAY);

  const passdown = passdownData.find((r) => r.id === passdownId);
  if (!passdown) throw new Error('Passdown record not found');

  // Create new log entry
  const newLog = {
    id: Math.max(...abnormalLogsData.map((l) => l.id), 0) + 1,
    passdownId,
    rcContent: payload.rcContent,
    caContent: payload.caContent,
    paContent: payload.paContent,
    planDate: payload.planDate,
    dueDate: payload.dueDate,
    isClosed: payload.isClosed,
    responseEmployeeId: payload.responseEmployeeId,
    responseEmployeeName: payload.responseEmployeeName,
    responseAttachments: normalizeAttachmentList(payload.responseAttachments),
    responseTime: new Date().toISOString(),
  };

  abnormalLogsData.push(newLog);

  // Update passdown status based on isClosed flag
  if (payload.isClosed) {
    passdown.passdownStatus = '已結案';
  } else {
    // First reply without close -> mark as "處理中"
    if (passdown.passdownStatus !== '已結案') {
      passdown.passdownStatus = '處理中';
    }
  }

  return newLog;
};

/**
 * Get reference data for filters and selectors
 */
export const getReferenceData = async () => {
  await delay(100);

  return {
    sites,
    passdownTypes,
    passdownStatuses,
    sections: getSectionOptions(),
    passdownSections,
  };
};

/**
 * Get systems for a given section
 * @param {String} section
 * @returns {Promise<Array>}
 */
export const getSystemsBySection = async (section) => {
  await delay(50);
  return getSystemOptionsBySection(section);
};

/**
 * Get subsystems for a given section and system
 * @param {String} section
 * @param {String} system
 * @returns {Promise<Array>}
 */
export const getSubSystemsBySystemAndSection = async (section, system) => {
  await delay(50);
  return getSubSystemOptionsBySystemAndSection(section, system);
};

/**
 * Simulate upload attachment
 * In real scenario, upload to server and return file metadata
 * @param {File} file
 * @param {Object} options - {uploadedBy}
 * @returns {Promise<Object>} - attachment metadata
 */
export const uploadAttachment = async (file, { uploadedBy = null } = {}) => {
  await delay(800);

  const fileId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const uploadedAt = new Date().toISOString();

  return {
    fileId,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileSize: Number.isFinite(Number(file.size)) ? Number(file.size) : 0,
    uploadedAt,
    uploadedBy: Number.isFinite(Number(uploadedBy)) ? Number(uploadedBy) : null,
    storageKey: fileId,
    downloadUrl: '',
  };
};

// Export constants for use in components
export { getSectionOptions, getSystemOptionsBySection, getSubSystemOptionsBySystemAndSection };
