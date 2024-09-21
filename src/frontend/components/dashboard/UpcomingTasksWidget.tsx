import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useFetch } from 'src/shared/hooks/index';
import { API_BASE_URL } from 'src/shared/constants/index';
import { formatDate } from 'src/shared/utils/index';
import { MitigationAction } from 'src/shared/types/index';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  riskId: string;
  type: string;
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

const TaskList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
`;

const TaskListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
  &:last-child { border-bottom: none; }
`;

const TaskTitle = styled(Link)`
  font-size: 0.9rem;
  color: #0066cc;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const TaskDueDate = styled.span`
  font-size: 0.8rem;
  color: #666666;
`;

const TaskType = styled.span`
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  background-color: #e0e0e0;
  color: #333333;
`;

export const UpcomingTasksWidget: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data, error: fetchError } = useFetch<Task[]>(`${API_BASE_URL}/tasks/upcoming`);

  useEffect(() => {
    if (data) {
      const sortedTasks = data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      setTasks(sortedTasks);
      setIsLoading(false);
    }
    if (fetchError) {
      setError('Failed to fetch upcoming tasks. Please try again later.');
      setIsLoading(false);
    }
  }, [data, fetchError]);

  if (isLoading) {
    return <WidgetContainer>Loading upcoming tasks...</WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer>{error}</WidgetContainer>;
  }

  return (
    <WidgetContainer>
      <WidgetTitle>Upcoming Tasks</WidgetTitle>
      <TaskList>
        {tasks.map((task) => (
          <TaskListItem key={task.id}>
            <TaskTitle to={`/risks/${task.riskId}`}>{task.title}</TaskTitle>
            <div>
              <TaskDueDate>{formatDate(task.dueDate)}</TaskDueDate>
              <TaskType>{task.type}</TaskType>
            </div>
          </TaskListItem>
        ))}
      </TaskList>
    </WidgetContainer>
  );
};