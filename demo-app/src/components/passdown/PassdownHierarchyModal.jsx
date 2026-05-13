import { Button, Checkbox, Col, Input, Modal, Row, Space, Tag, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { passdownSections } from '../../mock/passdown';

const { Text } = Typography;
const getSystemKey = (section, system) => `${section}:::${system}`;
const getSubsystemKey = (section, system, subsystem) => `${section}:::${system}:::${subsystem}`;

/**
 * 課別/系統/子系統 層級篩選 Modal（勾選框版本）
 *
 * 設計：
 * - Modal 內展示三個層級的勾選框列表（支援多選）
 * - 每次勾選/取消會立即更新 hierarchyFilterDraftList（顯示為 Tag）
 * - 「確認」按鈕：將 hierarchyFilterDraftList 應用到主頁面篩選
 * - 「取消」按鈕：放棄 Modal 內的所有修改
 *
 * hierarchyFilterDraftList 管理：
 * - 在父組件中管理（Passdown.jsx）
 * - Modal 內透過 removeHierarchyFilterDraft 移除
 */
export default function PassdownHierarchyModal({
  hierarchyModalOpen,
  hierarchyFilterDraftList,
  removeHierarchyFilterDraft,
  clearHierarchyFilterDraftList,
  hierarchySectionKeyword,
  setHierarchySectionKeyword,
  hierarchySystemKeyword,
  setHierarchySystemKeyword,
  hierarchySubsystemKeyword,
  setHierarchySubsystemKeyword,
  sectionOptions,
  applyHierarchySelection,
  cancelHierarchySelection,
  // 新增回調函式：用於勾選框變化時直接操作 hierarchyFilterDraftList
  onCheckSection,
  onCheckSystem,
  onCheckSubsystem,
}) {
  // 構建已選擇的 Tag 文字
  const hierarchyTagTexts = useMemo(
    () =>
      hierarchyFilterDraftList.map((item) => [item.section, item.system, item.subsystem].filter(Boolean).join('/')),
    [hierarchyFilterDraftList],
  );

  // 計算已勾選的課別/系統/子系統
  const checkedSections = useMemo(() => {
    const set = new Set(hierarchyFilterDraftList.map((item) => item.section).filter(Boolean));
    return set;
  }, [hierarchyFilterDraftList]);

  const checkedSystems = useMemo(() => {
    const set = new Set(
      hierarchyFilterDraftList
        .filter((item) => item.section && item.system)
        .map((item) => getSystemKey(item.section, item.system)),
    );
    return set;
  }, [hierarchyFilterDraftList]);

  const checkedSubsystems = useMemo(() => {
    const set = new Set(
      hierarchyFilterDraftList
        .filter((item) => item.section && item.system && item.subsystem)
        .map((item) => getSubsystemKey(item.section, item.system, item.subsystem)),
    );
    return set;
  }, [hierarchyFilterDraftList]);

  /**
   * 計算已勾選的課別集合
   * 包括：直接勾選的課別 + 已勾選系統的父課別
   */
  const effectiveSelectedSections = useMemo(() => {
    const set = new Set();
    hierarchyFilterDraftList.forEach((item) => {
      if (item.section) set.add(item.section);
    });
    return set;
  }, [hierarchyFilterDraftList]);

  /**
   * 計算已勾選的系統集合
   * 包括：直接勾選的系統 + 已勾選子系統的父系統
   */
  const effectiveSelectedSystems = useMemo(() => {
    const set = new Set();
    hierarchyFilterDraftList.forEach((item) => {
      if (item.section && item.system) {
        set.add(getSystemKey(item.section, item.system));
      }
    });
    return set;
  }, [hierarchyFilterDraftList]);

  /**
   * 系統清單分組資料（按課別分組）
   */
  const groupedSystemOptions = useMemo(() => {
    const grouped = new Map();

    passdownSections.forEach((item) => {
      if (effectiveSelectedSections.size > 0 && !effectiveSelectedSections.has(item.section)) {
        return;
      }

      if (!grouped.has(item.section)) {
        grouped.set(item.section, new Set());
      }

      grouped.get(item.section).add(item.system);
    });

    return [...grouped.entries()]
      .sort(([sectionA], [sectionB]) => sectionA.localeCompare(sectionB))
      .map(([section, systems]) => ({
        section,
        systems: [...systems].sort((a, b) => a.localeCompare(b)),
      }));
  }, [effectiveSelectedSections]);

  /**
   * 搜尋後的系統分組（應用關鍵字過濾）
   * 會過濾掉無符合項目的分組
   */
  const filteredSystemGroups = useMemo(() => {
    const keyword = hierarchySystemKeyword.toLowerCase();
    return groupedSystemOptions
      .map((group) => ({
        ...group,
        systems: group.systems.filter((sys) => sys.toLowerCase().includes(keyword)),
      }))
      .filter((group) => group.systems.length > 0);
  }, [groupedSystemOptions, hierarchySystemKeyword]);

  /**
   * 子系統清單分組資料（按課別/系統分組）
   */
  const groupedSubsystemOptions = useMemo(() => {
    const grouped = new Map();

    passdownSections.forEach((item) => {
      const systemKey = getSystemKey(item.section, item.system);
      const matchSelectedSystems =
        effectiveSelectedSystems.size > 0 ? effectiveSelectedSystems.has(systemKey) : true;
      const matchSelectedSections =
        effectiveSelectedSystems.size === 0 && effectiveSelectedSections.size > 0
          ? effectiveSelectedSections.has(item.section)
          : true;

      if (!matchSelectedSystems || !matchSelectedSections) {
        return;
      }

      if (!grouped.has(systemKey)) {
        grouped.set(systemKey, {
          key: systemKey,
          section: item.section,
          system: item.system,
          subsystems: new Set(),
        });
      }

      grouped.get(systemKey).subsystems.add(item.subsystem);
    });

    return [...grouped.values()]
      .sort((a, b) => {
        const sectionCompare = a.section.localeCompare(b.section);
        return sectionCompare !== 0 ? sectionCompare : a.system.localeCompare(b.system);
      })
      .map((group) => ({
        ...group,
        subsystems: [...group.subsystems].sort((a, b) => a.localeCompare(b)),
      }));
  }, [effectiveSelectedSections, effectiveSelectedSystems]);

  const hasDuplicateSubsystemGroupNames = useMemo(() => {
    const counts = groupedSubsystemOptions.reduce((acc, group) => {
      acc[group.system] = (acc[group.system] || 0) + 1;
      return acc;
    }, {});

    return Object.values(counts).some((count) => count > 1);
  }, [groupedSubsystemOptions]);

  /**
   * 搜尋後的子系統分組（應用關鍵字過濾）
   * 會過濾掉無符合項目的分組
   */
  const filteredSubsystemGroups = useMemo(() => {
    const keyword = hierarchySubsystemKeyword.toLowerCase();
    return groupedSubsystemOptions
      .map((group) => ({
        ...group,
        subsystems: group.subsystems.filter((sub) => sub.toLowerCase().includes(keyword)),
      }))
      .filter((group) => group.subsystems.length > 0);
  }, [groupedSubsystemOptions, hierarchySubsystemKeyword]);

  return (
    <Modal
      title="選擇 課別 / 系統 / 子系統"
      open={hierarchyModalOpen}
      onCancel={cancelHierarchySelection}
      width={1000}
      maskClosable={false}
      footer={(
        <div className="passdown-hierarchy-footer">
          <div>
            {hierarchyFilterDraftList.length > 0 && (
              <Button danger icon={<DeleteOutlined />} onClick={clearHierarchyFilterDraftList}>
                清空所有條件
              </Button>
            )}
          </div>
          <Space>
            <Button onClick={cancelHierarchySelection}>取消</Button>
            <Button type="primary" onClick={applyHierarchySelection}>
              確認
            </Button>
          </Space>
        </div>
      )}
    >
      {/* 已選擇條件展示區 */}
      <div className="passdown-hierarchy-tagbar">
        <div className="passdown-hierarchy-tagbar-label">已選擇:</div>
        <div className="passdown-hierarchy-tagbar-items">
          {hierarchyTagTexts.length > 0 ? (
            hierarchyTagTexts.map((tagText, index) => (
              <Tag key={`${tagText}-${index}`} closable onClose={() => removeHierarchyFilterDraft(index)}>
                {tagText}
              </Tag>
            ))
          ) : (
            <Text type="secondary">尚未選擇任何條件</Text>
          )}
        </div>
      </div>

      {/* 三層級勾選列表 */}
      <Row gutter={12} className="passdown-hierarchy-columns">
        {/* 課別列表 */}
        <Col xs={24} md={8}>
          <Text strong>課別</Text>
          <Input
            placeholder="搜尋課別..."
            value={hierarchySectionKeyword}
            onChange={(event) => setHierarchySectionKeyword(event.target.value)}
            style={{ margin: '8px 0' }}
            allowClear
          />
          <div
            className="passdown-hierarchy-list"
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              padding: '8px',
              maxHeight: '350px',
              overflowY: 'auto',
            }}
          >
            {sectionOptions
              .filter((item) => item.toLowerCase().includes(hierarchySectionKeyword.toLowerCase()))
              .map((item) => (
                <div key={item} style={{ marginBottom: '6px' }}>
                  <Checkbox checked={checkedSections.has(item)} onChange={(e) => onCheckSection(item, e.target.checked)}>
                    {item}
                  </Checkbox>
                </div>
              ))}
          </div>
        </Col>

        {/* 系統列表 */}
        <Col xs={24} md={8}>
          <Text strong>系統</Text>
          <Input
            placeholder="搜尋系統..."
            value={hierarchySystemKeyword}
            onChange={(event) => setHierarchySystemKeyword(event.target.value)}
            style={{ margin: '8px 0' }}
            allowClear
          />
          <div
            className="passdown-hierarchy-list"
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              padding: '8px',
              maxHeight: '350px',
              overflowY: 'auto',
            }}
          >
            {filteredSystemGroups.length > 0 ? (
              filteredSystemGroups.map((group) => (
                <div key={group.section}>
                  {/* 分組標題（僅當有多個分組或已勾選課別時顯示） */}
                  {groupedSystemOptions.length > 1 && (
                    <div className="passdown-hierarchy-group-title">{group.section}</div>
                  )}
                  {/* 分組內的系統項目 */}
                  {group.systems.map((item) => (
                    <div key={item} style={{ marginBottom: '6px', marginLeft: '4px' }}>
                      <Checkbox
                        checked={checkedSystems.has(getSystemKey(group.section, item))}
                        onChange={(e) => onCheckSystem(group.section, item, e.target.checked)}
                      >
                        {item}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                無符合結果
              </Text>
            )}
          </div>
        </Col>

        {/* 子系統列表 */}
        <Col xs={24} md={8}>
          <Text strong>子系統</Text>
          <Input
            placeholder="搜尋子系統..."
            value={hierarchySubsystemKeyword}
            onChange={(event) => setHierarchySubsystemKeyword(event.target.value)}
            style={{ margin: '8px 0' }}
            allowClear
          />
          <div
            className="passdown-hierarchy-list"
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              padding: '8px',
              maxHeight: '350px',
              overflowY: 'auto',
            }}
          >
            {filteredSubsystemGroups.length > 0 ? (
              filteredSubsystemGroups.map((group) => (
                <div key={group.key}>
                  {/* 分組標題（僅當有多個分組或已勾選系統時顯示） */}
                  {groupedSubsystemOptions.length > 1 && (
                    <div className="passdown-hierarchy-group-title">
                      {hasDuplicateSubsystemGroupNames ? `${group.section} / ${group.system}` : group.system}
                    </div>
                  )}
                  {/* 分組內的子系統項目 */}
                  {group.subsystems.map((item) => (
                    <div key={item} style={{ marginBottom: '6px', marginLeft: '4px' }}>
                      <Checkbox
                        checked={checkedSubsystems.has(getSubsystemKey(group.section, group.system, item))}
                        onChange={(e) => onCheckSubsystem(group.section, group.system, item, e.target.checked)}
                      >
                        {item}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                無符合結果
              </Text>
            )}
          </div>
        </Col>
      </Row>

    </Modal>
  );
}
