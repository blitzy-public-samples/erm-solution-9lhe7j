import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useFetch } from 'src/shared/hooks/index';
import { API_BASE_URL } from 'src/shared/constants/index';
import { formatDateTime } from 'src/shared/utils/index';
import { Activity } from 'src/shared/types/index';

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
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

const ActivityList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
`;

const ActivityListItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
  &:last-child { border-bottom: none; }
`;

const ActivityDescription = styled.span`
  font-size: 0.9rem;
  color: #333333;
`;

const ActivityTimestamp = styled.span`
  font-size: 0.8rem;
  color: #666666;
  margin-left: 0.5rem;
`;

export const RecentActivityWidget: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { data, error, isLoading } = useFetch<Activity[]>(`${API_BASE_URL}/activities/recent`);

  useEffect(() => {
    if (data) {
      const processedActivities = data.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp,
        userId: activity.userId,
        userName: activity.userName
      }));
      setActivities(processedActivities);
    }
  }, [data]);

  if (isLoading) {
    return <WidgetContainer>Loading recent activities...</WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer>Error loading recent activities: {error.message}</WidgetContainer>;
  }

  return (
    <WidgetContainer>
      <WidgetTitle>Recent Activity</WidgetTitle>
      <ActivityList>
        {activities.map(activity => (
          <ActivityListItem key={activity.id}>
            <ActivityDescription>{activity.description}</ActivityDescription>
            <ActivityTimestamp>{formatDateTime(activity.timestamp)}</ActivityTimestamp>
          </ActivityListItem>
        ))}
      </ActivityList>
    </WidgetContainer>
  );
};