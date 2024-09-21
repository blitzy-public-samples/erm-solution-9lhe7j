import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RiskList } from 'src/frontend/components/risks/RiskList';
import { usePagination, useDebounce } from 'src/shared/hooks/index';
import { Risk } from 'src/shared/types/index';

// Mock the hooks
jest.mock('src/shared/hooks/index', () => ({
  usePagination: jest.fn(),
  useDebounce: jest.fn((value) => value),
}));

const mockRisks: Risk[] = [
  {
    id: 1,
    title: "Risk 1",
    description: "Description 1",
    status: "IDENTIFIED",
    createdAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 2,
    title: "Risk 2",
    description: "Description 2",
    status: "ASSESSED",
    createdAt: "2023-01-02T00:00:00Z"
  }
];

describe('RiskList component', () => {
  beforeEach(() => {
    (usePagination as jest.Mock).mockReturnValue({
      data: mockRisks,
      page: 1,
      totalPages: 1,
      isLoading: false,
      error: null,
      setPage: jest.fn(),
    });
  });

  it('renders risk list correctly', () => {
    render(<RiskList />);
    
    mockRisks.forEach((risk) => {
      expect(screen.getByText(risk.title)).toBeInTheDocument();
      expect(screen.getByText(risk.status)).toBeInTheDocument();
      expect(screen.getByText(new Date(risk.createdAt).toLocaleDateString())).toBeInTheDocument();
    });
  });

  it('handles pagination correctly', async () => {
    const setPageMock = jest.fn();
    (usePagination as jest.Mock).mockReturnValue({
      data: mockRisks.slice(0, 1),
      page: 1,
      totalPages: 2,
      isLoading: false,
      error: null,
      setPage: setPageMock,
    });

    render(<RiskList />);

    expect(screen.getByText('Risk 1')).toBeInTheDocument();
    expect(screen.queryByText('Risk 2')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Next'));

    expect(setPageMock).toHaveBeenCalledWith(2);
  });

  it('filters risks based on search input', async () => {
    render(<RiskList />);

    const searchInput = screen.getByPlaceholderText('Search risks...');
    fireEvent.change(searchInput, { target: { value: 'Risk 1' } });

    await waitFor(() => {
      expect(screen.getByText('Risk 1')).toBeInTheDocument();
      expect(screen.queryByText('Risk 2')).not.toBeInTheDocument();
    });
  });

  it('sorts risks when clicking on sortable column headers', () => {
    render(<RiskList />);

    const titleHeader = screen.getByText('Title');
    fireEvent.click(titleHeader);

    // Assert that the risks are sorted by title in ascending order
    const riskTitles = screen.getAllByTestId('risk-title').map(el => el.textContent);
    expect(riskTitles).toEqual(['Risk 1', 'Risk 2']);

    fireEvent.click(titleHeader);

    // Assert that the risks are sorted by title in descending order
    const reversedRiskTitles = screen.getAllByTestId('risk-title').map(el => el.textContent);
    expect(reversedRiskTitles).toEqual(['Risk 2', 'Risk 1']);
  });

  it('opens risk details when clicking on a risk', () => {
    const onRiskClickMock = jest.fn();
    render(<RiskList onRiskClick={onRiskClickMock} />);

    fireEvent.click(screen.getByText('Risk 1'));

    expect(onRiskClickMock).toHaveBeenCalledWith(mockRisks[0]);
  });

  it('handles error state correctly', () => {
    (usePagination as jest.Mock).mockReturnValue({
      data: [],
      page: 1,
      totalPages: 0,
      isLoading: false,
      error: 'Failed to fetch risks',
      setPage: jest.fn(),
    });

    render(<RiskList />);

    expect(screen.getByText('Failed to fetch risks')).toBeInTheDocument();
  });
});