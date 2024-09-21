import React from 'react';
import styled from 'styled-components';
import { useAuth } from 'src/shared/hooks/index';
import RiskOverviewWidget from 'src/frontend/components/dashboard/RiskOverviewWidget';
import RecentActivityWidget from 'src/frontend/components/dashboard/RecentActivityWidget';
import TopRisksWidget from 'src/frontend/components/dashboard/TopRisksWidget';
import UpcomingTasksWidget from 'src/frontend/components/dashboard/UpcomingTasksWidget';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
`;

const WelcomeMessage = styled.h1`
  grid-column: 1 / -1;
  font-size: 1.5rem;
  color: #333333;
  margin-bottom: 1rem;
`;

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardContainer>
      <WelcomeMessage>Welcome, {user?.name || 'User'}!</WelcomeMessage>
      <RiskOverviewWidget />
      <RecentActivityWidget />
      <TopRisksWidget />
      <UpcomingTasksWidget />
    </DashboardContainer>
  );
};