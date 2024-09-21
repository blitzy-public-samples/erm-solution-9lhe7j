import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useFetch } from 'src/shared/hooks/index';
import { API_BASE_URL, RISK_LEVELS } from 'src/shared/constants/index';
import { Risk } from 'src/shared/types/index';

interface TopRisk {
  id: string;
  title: string;
  riskScore: number;
  riskLevel: string;
}

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

const RiskList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const RiskListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
  &:last-child { border-bottom: none; }
`;

const RiskTitle = styled(Link)`
  font-size: 0.9rem;
  color: #0066cc;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const RiskScore = styled.span<{ riskLevel: string }>`
  font-size: 0.8rem;
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  color: #ffffff;
  background-color: ${props => {
    switch (props.riskLevel) {
      case 'HIGH':
        return '#ff4d4d';
      case 'MEDIUM':
        return '#ffa64d';
      case 'LOW':
        return '#4dff4d';
      default:
        return '#808080';
    }
  }};
`;

export const TopRisksWidget: React.FC = () => {
  const [topRisks, setTopRisks] = useState<TopRisk[]>([]);
  const { data, error, isLoading } = useFetch<Risk[]>(`${API_BASE_URL}/risks/top`);

  useEffect(() => {
    if (data) {
      const processedRisks = data.map(risk => ({
        id: risk.id,
        title: risk.title,
        riskScore: risk.riskScore,
        riskLevel: getRiskLevel(risk.riskScore)
      }));
      setTopRisks(processedRisks);
    }
  }, [data]);

  const getRiskLevel = (score: number): string => {
    if (score >= RISK_LEVELS.HIGH) return 'HIGH';
    if (score >= RISK_LEVELS.MEDIUM) return 'MEDIUM';
    return 'LOW';
  };

  if (isLoading) return <WidgetContainer>Loading top risks...</WidgetContainer>;
  if (error) return <WidgetContainer>Error loading top risks: {error.message}</WidgetContainer>;

  return (
    <WidgetContainer>
      <WidgetTitle>Top Risks</WidgetTitle>
      <RiskList>
        {topRisks.map(risk => (
          <RiskListItem key={risk.id}>
            <RiskTitle to={`/risks/${risk.id}`}>{risk.title}</RiskTitle>
            <RiskScore riskLevel={risk.riskLevel}>{risk.riskScore}</RiskScore>
          </RiskListItem>
        ))}
      </RiskList>
    </WidgetContainer>
  );
};