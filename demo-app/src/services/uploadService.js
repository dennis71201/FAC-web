import * as passdownService from './passdownService';

export const UPLOAD_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const UPLOAD_ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const LEGACY_ATTACHMENT_TYPE = 'application/octet-stream';

const ensureString = (value) => (typeof value === 'string' ? value : '');

const toSafeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildLegacyAttachment = (fileName) => ({
  fileId: `legacy-${fileName}`,
  fileName,
  mimeType: LEGACY_ATTACHMENT_TYPE,
  fileSize: 0,
  uploadedAt: null,
  uploadedBy: null,
  storageKey: fileName,
  downloadUrl: '',
});

export const validateUploadFile = (file) => {
  if (!file) {
    return '檔案不存在';
  }

  if (!UPLOAD_ACCEPTED_MIME_TYPES.includes(file.type)) {
    return '僅支援 JPG、PNG、PDF 檔案';
  }

  if (file.size > UPLOAD_MAX_FILE_SIZE) {
    return '檔案大小不可超過 10MB';
  }

  return null;
};

export const normalizeAttachment = (attachment) => {
  if (!attachment) {
    return null;
  }

  if (typeof attachment === 'string') {
    const trimmed = attachment.trim();
    return trimmed ? buildLegacyAttachment(trimmed) : null;
  }

  const fileName = ensureString(attachment.fileName || attachment.name).trim();
  if (!fileName) {
    return null;
  }

  return {
    fileId: ensureString(attachment.fileId).trim() || `legacy-${fileName}`,
    fileName,
    mimeType: ensureString(attachment.mimeType).trim() || LEGACY_ATTACHMENT_TYPE,
    fileSize: toSafeNumber(attachment.fileSize || attachment.size, 0),
    uploadedAt: attachment.uploadedAt || null,
    uploadedBy: attachment.uploadedBy ?? null,
    storageKey: ensureString(attachment.storageKey).trim() || fileName,
    downloadUrl: ensureString(attachment.downloadUrl).trim(),
  };
};

export const normalizeAttachments = (attachments) => {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments
    .map(normalizeAttachment)
    .filter(Boolean);
};

export const toUploadFileList = (attachments = [], fileListPrefix = 'att') => {
  return normalizeAttachments(attachments).map((attachment, index) => ({
    uid: attachment.fileId || `${fileListPrefix}-${index}`,
    name: attachment.fileName,
    status: 'done',
    size: attachment.fileSize,
    type: attachment.mimeType,
    attachmentMeta: attachment,
  }));
};

export const uploadSingleFile = async (file, { uploadedBy } = {}) => {
  const errorMessage = validateUploadFile(file);
  if (errorMessage) {
    throw new Error(errorMessage);
  }

  return passdownService.uploadAttachment(file, { uploadedBy });
};

export const extractAttachmentPayload = (fileList = []) => {
  if (!Array.isArray(fileList)) {
    return [];
  }

  return fileList
    .map((fileItem) => {
      if (fileItem?.attachmentMeta) {
        return normalizeAttachment(fileItem.attachmentMeta);
      }

      if (fileItem?.response) {
        return normalizeAttachment(fileItem.response);
      }

      const fromNameOnly = ensureString(fileItem?.name || fileItem?.fileName).trim();
      if (!fromNameOnly) {
        return null;
      }

      return buildLegacyAttachment(fromNameOnly);
    })
    .filter(Boolean);
};
