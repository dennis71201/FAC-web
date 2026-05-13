import { useState } from 'react';
import { Card, Checkbox, Col, Row, Space } from 'antd';
import { Area, AreaChart, Bar, BarChart, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis, Sector } from 'recharts';

export default function PassdownAnalyticsLayer({ exceptionPieData, chartStatusCounts, trendData, applyChartDrilldown }) {
  const [visibleTrends, setVisibleTrends] = useState({ major: true, general: true });
  const RADIAN = Math.PI / 180;

  // Pie label: show count value with label line pointing from slice
  const renderPieLabel = ({ cx, cy, midAngle, outerRadius, value }) => {
    if (!value) {
      return null;
    }
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="500"
        pointerEvents="none"
      >
        {value}件
      </text>
    );
  };

  const renderBarLabel = ({ x, y, width, value, payload }) => {
    if (!value) {
      return null;
    }

    return (
      <text
        x={x + width / 2}
        y={y - 8}
        textAnchor="middle"
        fill="#374151"
        fontSize={11}
        pointerEvents="none"
      >
        {`${payload?.name ?? ''} ${value}`}
      </text>
    );
  };

  return (
    <Card className="passdown-layer" title="動態統計圖表區 (Filtered Analytics)">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card size="small" title="異常件狀態佔比">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <Pie 
                  data={exceptionPieData} 
                  dataKey="value" 
                  innerRadius={46} 
                  outerRadius={68}
                >
                  {exceptionPieData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} onClick={() => applyChartDrilldown(entry.key)} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '8px', fontSize: '12px' }}>
              {exceptionPieData.map((item) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: item.color, borderRadius: '50%' }}></div>
                  <span>{item.name}：{item.value}件</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" title="全狀態件數對比">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartStatusCounts} margin={{ top: 28, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="value" content={renderBarLabel} />
                  {chartStatusCounts.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} onClick={() => applyChartDrilldown(entry.key)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" title="重大異常/一般異常時間趨勢">
            <Space size="middle" style={{ marginBottom: 8 }}>
              <Checkbox
                checked={visibleTrends.major}
                onChange={(event) => setVisibleTrends((prev) => ({ ...prev, major: event.target.checked }))}
              >
                重大異常
              </Checkbox>
              <Checkbox
                checked={visibleTrends.general}
                onChange={(event) => setVisibleTrends((prev) => ({ ...prev, general: event.target.checked }))}
              >
                一般異常
              </Checkbox>
            </Space>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis />
                <ChartTooltip />
                {visibleTrends.major && <Area type="monotone" dataKey="major" stroke="#E57373" fill="#E5737333" />}
                {visibleTrends.general && <Area type="monotone" dataKey="general" stroke="#FFB74D" fill="#FFB74D33" />}
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}
