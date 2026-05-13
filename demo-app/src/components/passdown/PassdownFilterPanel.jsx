import { Button, Card, Col, DatePicker, Input, Row, Select, Space, Tag, Typography } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Text } = Typography;

export default function PassdownFilterPanel({
  dateRange,
  setDateRange,
  filterSiteId,
  setFilterSiteId,
  filterStatuses,
  setFilterStatuses,
  sites,
  passdownStatuses,
  openHierarchyModal,
  keyword,
  setKeyword,
  clearAllFilters,
  filterHierarchy,
  setFilterHierarchy,
  chartDrilldownStatus,
  setChartDrilldownStatus,
}) {
  const hierarchyTagTexts = filterHierarchy.map((item) => [item.section, item.system, item.subsystem].filter(Boolean).join('/'));

  return (
    <Card className="passdown-layer passdown-filter-panel" title={<Space><FilterOutlined /> 進階搜尋篩選器</Space>}>
      <Row gutter={[16, 14]}>
        <Col xs={24} md={8}>
          <Text className="passdown-label">日期時間區間</Text>
          <RangePicker showTime value={dateRange} onChange={setDateRange} style={{ width: '100%' }} />
        </Col>
        <Col xs={24} md={4}>
          <Text className="passdown-label">廠區</Text>
          <Select
            value={filterSiteId}
            onChange={setFilterSiteId}
            allowClear
            style={{ width: '100%' }}
            options={sites.map((site) => ({ label: site.name, value: site.id }))}
            placeholder="All Sites"
          />
        </Col>
        <Col xs={24} md={12}>
          <Text className="passdown-label">狀態</Text>
          <Select
            mode="multiple"
            value={filterStatuses}
            onChange={setFilterStatuses}
            style={{ width: '100%' }}
            options={passdownStatuses.map((status) => ({
              label: status.label,
              value: status.value,
            }))}
            placeholder="選擇狀態"
          />
        </Col>
        <Col xs={24} md={8}>
          <Text className="passdown-label">課別 / 系統 / 子系統</Text>
          <Button block onClick={() => openHierarchyModal('filter')}>
            選擇課別/系統/子系統
          </Button>
        </Col>
        <Col xs={24} md={12}>
          <Text className="passdown-label">關鍵字搜尋</Text>
          <Search
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜尋內容描述或人員"
            allowClear
          />
        </Col>
        <Col xs={24} md={4} className="passdown-filter-actions">
          <Button onClick={clearAllFilters}>重設</Button>
        </Col>
      </Row>

      <Space wrap className="passdown-active-filters">
        {hierarchyTagTexts.map((tagText, index) => (
          <Tag key={`${tagText}-${index}`} closable onClose={() => setFilterHierarchy((prev) => prev.filter((_, idx) => idx !== index))}>
            課別/系統/子系統: {tagText}
          </Tag>
        ))}
        {hierarchyTagTexts.length > 1 && (
          <Tag color="default" closable onClose={() => setFilterHierarchy([])}>
            清除全部層級條件
          </Tag>
        )}
        {chartDrilldownStatus && (
          <Tag color="processing" closable onClose={() => setChartDrilldownStatus(null)}>
            圖表鑽取: {chartDrilldownStatus}
          </Tag>
        )}
      </Space>
    </Card>
  );
}
