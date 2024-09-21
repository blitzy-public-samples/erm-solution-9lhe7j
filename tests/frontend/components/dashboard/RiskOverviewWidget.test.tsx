import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { RiskOverviewWidget } from 'src/frontend/components/dashboard/RiskOverviewWidget';
import { useFetch } from 'src/shared/hooks/index';

// Mock the useFetch hook
jest.mock('src/shared/hooks/index', () => ({
  useFetch: jest.fn(),
}));

const mockRiskOverviewData = {
  totalRisks: 100,
  risksByLevel: {
    LOW: 20,
    MEDIUM: 50,
    HIGH: 25,
    CRITICAL: 5,
  },
};

describe('RiskOverviewWidget component', () => {
  beforeEach(() => {
    (useFetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    (useFetch as jest.Mock).mockReturnValue({ data: null, loading: true, error: null });
    render(<RiskOverviewWidget />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders risk overview data correctly', async () => {
    (useFetch as jest.Mock).mockReturnValue({ data: mockRiskOverviewData, loading: false, error: null });
    render(<RiskOverviewWidget />);

    await waitFor(() => {
      expect(screen.getByText(/Total Risks: 100/i)).toBeInTheDocument();
      expect(screen.getByText(/Low: 20/i)).toBeInTheDocument();
      expect(screen.getByText(/Medium: 50/i)).toBeInTheDocument();
      expect(screen.getByText(/High: 25/i)).toBeInTheDocument();
      expect(screen.getByText(/Critical: 5/i)).toBeInTheDocument();
    });
  });

  it('renders chart with correct data', async () => {
    (useFetch as jest.Mock).mockReturnValue({ data: mockRiskOverviewData, loading: false, error: null });
    render(<RiskOverviewWidget />);

    await waitFor(() => {
      const chartElement = screen.getByTestId('risk-overview-chart');
      expect(chartElement).toBeInTheDocument();
      // Add more specific chart assertions here, depending on the charting library used
    });
  });

  it('handles error state correctly', () => {
    (useFetch as jest.Mock).mockReturnValue({ data: null, loading: false, error: 'Failed to fetch data' });
    render(<RiskOverviewWidget />);
    expect(screen.getByText(/Error: Failed to fetch data/i)).toBeInTheDocument();
  });

  it('updates when new data is fetched', async () => {
    const initialData = { ...mockRiskOverviewData, totalRisks: 100 };
    const updatedData = { ...mockRiskOverviewData, totalRisks: 150 };

    const mockUseFetch = useFetch as jest.Mock;
    mockUseFetch.mockReturnValue({ data: initialData, loading: false, error: null });

    const { rerender } = render(<RiskOverviewWidget />);

    await waitFor(() => {
      expect(screen.getByText(/Total Risks: 100/i)).toBeInTheDocument();
    });

    mockUseFetch.mockReturnValue({ data: updatedData, loading: false, error: null });
    rerender(<RiskOverviewWidget />);

    await waitFor(() => {
      expect(screen.getByText(/Total Risks: 150/i)).toBeInTheDocument();
    });
  });
});