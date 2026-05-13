import { Card, Progress, Statistic, Typography } from 'antd';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const { Text } = Typography;

export default function PassdownSummaryLayer({
  exceptionPieData,
  exceptionTotal,
  passdownStatuses,
  statusCountsFromAll,
  applyChartDrilldown,
}) {
  const abnormalTotal = passdownStatuses
    .filter((item) => item.value !== '正常')
    .reduce((sum, item) => sum + (statusCountsFromAll[item.value] || 0), 0);

  return (
    <Card className="passdown-layer" title="全部門近3天異常統計資料">
      <div className="passdown-summary-grid">
        <Card className="passdown-l1-card passdown-ring-card">
          <div className="passdown-ring-wrap">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={exceptionPieData} dataKey="value" innerRadius={42} outerRadius={60} paddingAngle={3}>
                  {exceptionPieData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} onClick={() => applyChartDrilldown(entry.key)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="passdown-ring-center">
              <div className="count">{exceptionTotal}</div>
              <div className="label">異常總數</div>
            </div>
          </div>
        </Card>

      {passdownStatuses
        .filter((item) => item.value !== '正常')
        .map((status) => {
          const count = statusCountsFromAll[status.value] || 0;
          const total = Math.max(abnormalTotal, 1);
          const percent = Math.round((count / total) * 100);

          return (
            <Card className="passdown-l1-card" key={status.value}>
              <Text type="secondary">{status.label}</Text>
              <Statistic value={count} valueStyle={{ color: status.color }} />
              <Progress percent={percent} showInfo={false} strokeColor={status.color} trailColor="#e8ebed" />
              <Text type="secondary">({percent}%)</Text>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}
