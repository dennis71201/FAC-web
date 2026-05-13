/**
 * Hierarchy Service
 * 統一管理課別/系統/子系統的資料來源
 * 支援 mock 資料與後端 API 的切換（開閉原則）
 *
 * 後端集成規劃：
 * - 目前使用 passdownHierarchy JSON 結構（由 passdown.js 提供）
 * - 未來改為 API 呼叫：GET /api/hierarchy → 直接返回嵌套 JSON
 */

import { passdownHierarchy, passdownSections } from '../mock/passdown';

/**
 * 取得完整的層級結構
 * @returns {Object} 嵌套 JSON 格式：{ section: { system: [subsystems] } }
 */
export const getHierarchyStructure = () => {
  return passdownHierarchy;
};

/**
 * 取得所有課別清單（已排序）
 * @returns {string[]}
 */
export const getSectionOptions = () => {
  return Object.keys(passdownHierarchy).sort((a, b) => a.localeCompare(b));
};

/**
 * 根據課別取得系統清單
 * @param {string|null} section - 課別名稱，null 時返回所有系統
 * @returns {string[]}
 */
export const getSystemsBySection = (section) => {
  if (!section) {
    // 返回所有系統（去重）
    return [...new Set(passdownSections.map((item) => item.system))].sort((a, b) => a.localeCompare(b));
  }

  const systems = passdownHierarchy[section];
  if (!systems) {
    return [];
  }

  return Object.keys(systems).sort((a, b) => a.localeCompare(b));
};

/**
 * 根據課別和系統取得子系統清單
 * @param {string|null} section - 課別名稱
 * @param {string|null} system - 系統名稱
 * @returns {string[]}
 */
export const getSubsystemsBySystem = (section, system) => {
  if (!section && !system) {
    // 返回所有子系統（去重）
    return [...new Set(passdownSections.map((item) => item.subsystem))].sort((a, b) => a.localeCompare(b));
  }

  if (section && !system) {
    // 返回該課別下所有子系統（去重）
    return [
      ...new Set(
        passdownSections
          .filter((item) => item.section === section)
          .map((item) => item.subsystem),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }

  if (!section && system) {
    // 返回該系統下所有子系統（去重）
    return [
      ...new Set(
        passdownSections
          .filter((item) => item.system === system)
          .map((item) => item.subsystem),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }

  // section 和 system 都指定
  const subsystems = passdownHierarchy[section]?.[system];
  if (!subsystems) {
    return [];
  }

  return subsystems.sort((a, b) => a.localeCompare(b));
};

/**
 * 根據條件取得對應的 PassdownSection ID 清單
 * @param {string|null} section - 課別名稱
 * @param {string|null} system - 系統名稱
 * @param {string|null} subsystem - 子系統名稱
 * @returns {number[]}
 */
export const getSectionIdsByCondition = (section, system, subsystem) => {
  return passdownSections
    .filter((item) => {
      const matchSection = section ? item.section === section : true;
      const matchSystem = system ? item.system === system : true;
      const matchSubsystem = subsystem ? item.subsystem === subsystem : true;
      return matchSection && matchSystem && matchSubsystem;
    })
    .map((item) => item.id);
};
