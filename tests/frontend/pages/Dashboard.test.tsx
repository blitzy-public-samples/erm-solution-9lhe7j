import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from 'src/frontend/pages/Dashboard';
import { useAuth } from 'src/shared/hooks/index';
import { RiskOverviewWidget } from 'src/frontend/components/dashboard/RiskOverviewWidget';
import { RecentActivityWidget } from 'src/frontend/components/dashboard/RecentActivityWidget';
import { TopRisksWidget } from 'src/frontend/components/dashboard/TopRisksWidget';
import { UpcomingTasksWidget } from 'src/frontend/components/dashboard/UpcomingTasksWidget';

jest.mock('src/shared/hooks/index');
jest.mock('src/frontend/components/dashboard/RiskOverviewWidget');
jest.mock('src/frontend/components/dashboard/RecentActivityWidget');
jest.mock('src/frontend/components/dashboard/TopRisksWidget');
jest.mock('src/frontend/components/dashboard/UpcomingTasksWidget');

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'RiskManager'
};

describe('Dashboard component', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it('renders welcome message with user\'s name', () => {
    render(<Dashboard />);
    expect(screen.getByText(`Welcome, ${mockUser.name}`)).toBeInTheDocument();
  });

  it('renders all dashboard widgets', () => {
    render(<Dashboard />);
    expect(RiskOverviewWidget).toHaveBeenCalled();
    expect(RecentActivityWidget).toHaveBeenCalled();
    expect(TopRisksWidget).toHaveBeenCalled();
    expect(UpcomingTasksWidget).toHaveBeenCalled();
  });

  it('displays loading state while fetching data', async () => {
    (RiskOverviewWidget as jest.Mock).mockImplementation(() => <div>Loading Risk Overview...</div>);
    (RecentActivityWidget as jest.Mock).mockImplementation(() => <div>Loading Recent Activity...</div>);
    (TopRisksWidget as jest.Mock).mockImplementation(() => <div>Loading Top Risks...</div>);
    (UpcomingTasksWidget as jest.Mock).mockImplementation(() => <div>Loading Upcoming Tasks...</div>);

    render(<Dashboard />);

    expect(screen.getByText('Loading Risk Overview...')).toBeInTheDocument();
    expect(screen.getByText('Loading Recent Activity...')).toBeInTheDocument();
    expect(screen.getByText('Loading Top Risks...')).toBeInTheDocument();
    expect(screen.getByText('Loading Upcoming Tasks...')).toBeInTheDocument();
  });

  it('handles error states in widgets', () => {
    (RiskOverviewWidget as jest.Mock).mockImplementation(() => <div>Error loading Risk Overview</div>);
    (TopRisksWidget as jest.Mock).mockImplementation(() => <div>Error loading Top Risks</div>);

    render(<Dashboard />);

    expect(screen.getByText('Error loading Risk Overview')).toBeInTheDocument();
    expect(screen.getByText('Error loading Top Risks')).toBeInTheDocument();
  });

  it('updates when new data is fetched', async () => {
    const { rerender } = render(<Dashboard />);

    (RiskOverviewWidget as jest.Mock).mockImplementation(() => <div>Updated Risk Overview</div>);
    (RecentActivityWidget as jest.Mock).mockImplementation(() => <div>Updated Recent Activity</div>);

    rerender(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Updated Risk Overview')).toBeInTheDocument();
      expect(screen.getByText('Updated Recent Activity')).toBeInTheDocument();
    });
  });

  it('applies correct layout on different screen sizes', () => {
    const { container } = render(<Dashboard />);

    // Test for desktop layout
    expect(container.firstChild).toHaveStyle('display: grid');
    expect(container.firstChild).toHaveStyle('grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))');

    // Simulate mobile screen size
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    window.dispatchEvent(new Event('resize'));

    // Test for mobile layout
    expect(container.firstChild).toHaveStyle('display: flex');
    expect(container.firstChild).toHaveStyle('flex-direction: column');
  });
});