import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Doughnut } from 'react-chartjs-2';
import { useFetch } from 'src/shared/hooks/index';
import { API_BASE_URL, RISK_LEVELS } from 'src/shared/constants/index';
import { Risk } from 'src/shared/types/index';

const WidgetContainer = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 1rem;
`;

const WidgetTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333333;
`;

const ChartContainer = styled.div`
  height: 200px;
  margin-bottom: 1rem;
`;

const SummaryText = styled.p`
  font-size: 0.9rem;
  color: #666666;
`;

interface RiskOverviewData {
  totalRisks: number;
  risksByLevel: { [key: string]: number };
}

export const RiskOverviewWidget: React.FC = () => {
  const { data, error, isLoading } = useFetch<RiskOverviewData>(`${API_BASE_URL}/risks/overview`);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (data) {
      const labels = Object.keys(data.risksByLevel);
      const values = Object.values(data.risksByLevel);
      const backgroundColors = labels.map(label => RISK_LEVELS[label].color);

      setChartData({
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: backgroundColors,
            borderWidth: 0,
          },
        ],
      });
    }
  }, [data]);

  if (isLoading) {
    return <WidgetContainer>Loading...</WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer>Error: {error.message}</WidgetContainer>;
  }

  if (!data) {
    return null;
  }

  return (
    <WidgetContainer>
      <WidgetTitle>Risk Overview</WidgetTitle>
      <ChartContainer>
        {chartData && (
          <Doughnut
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                },
              },
            }}
          />
        )}
      </ChartContainer>
      <SummaryText>
        Total Risks: {data.totalRisks}
        <br />
        Distribution: {Object.entries(data.risksByLevel)
          .map(([level, count]) => `${level}: ${count}`)
          .join(', ')}
      </SummaryText>
    </WidgetContainer>
  );
};