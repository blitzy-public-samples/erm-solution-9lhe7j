import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RiskRegister } from 'src/frontend/pages/RiskRegister';
import { useAuth } from 'src/shared/hooks/index';
import { RiskList } from 'src/frontend/components/risks/RiskList';
import { RiskForm } from 'src/frontend/components/risks/RiskForm';
import { Modal } from 'src/frontend/components/common/Modal';
import { Risk } from 'src/shared/types/index';

// Mock the dependencies
jest.mock('src/shared/hooks/index');
jest.mock('src/frontend/components/risks/RiskList');
jest.mock('src/frontend/components/risks/RiskForm');
jest.mock('src/frontend/components/common/Modal');

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

describe('RiskRegister component', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: { role: 'RiskManager' } });
    (RiskList as jest.Mock).mockImplementation(() => <div data-testid="risk-list" />);
    (RiskForm as jest.Mock).mockImplementation(() => <div data-testid="risk-form" />);
    (Modal as jest.Mock).mockImplementation(({ children }) => <div data-testid="modal">{children}</div>);
  });

  it('renders RiskList component', () => {
    render(<RiskRegister />);
    expect(screen.getByTestId('risk-list')).toBeInTheDocument();
  });

  it('opens Add Risk modal when Add Risk button is clicked', () => {
    render(<RiskRegister />);
    const addButton = screen.getByText('Add Risk');
    fireEvent.click(addButton);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('risk-form')).toBeInTheDocument();
  });

  it('handles risk creation correctly', async () => {
    const mockCreateRisk = jest.fn();
    (RiskForm as jest.Mock).mockImplementation(({ onSubmit }) => (
      <form data-testid="risk-form" onSubmit={() => onSubmit(mockRisks[0])}>
        <button type="submit">Submit</button>
      </form>
    ));

    render(<RiskRegister />);
    const addButton = screen.getByText('Add Risk');
    fireEvent.click(addButton);

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateRisk).toHaveBeenCalledWith(mockRisks[0]);
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('handles risk deletion correctly', async () => {
    const mockDeleteRisk = jest.fn();
    (RiskList as jest.Mock).mockImplementation(({ onDeleteRisk }) => (
      <div data-testid="risk-list">
        <button onClick={() => onDeleteRisk(1)}>Delete Risk</button>
      </div>
    ));

    render(<RiskRegister />);
    const deleteButton = screen.getByText('Delete Risk');
    fireEvent.click(deleteButton);

    // Assuming there's a confirmation dialog
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteRisk).toHaveBeenCalledWith(1);
    });
  });

  it('handles risk editing correctly', async () => {
    const mockUpdateRisk = jest.fn();
    (RiskList as jest.Mock).mockImplementation(({ onEditRisk }) => (
      <div data-testid="risk-list">
        <button onClick={() => onEditRisk(mockRisks[0])}>Edit Risk</button>
      </div>
    ));
    (RiskForm as jest.Mock).mockImplementation(({ onSubmit, initialData }) => (
      <form data-testid="risk-form" onSubmit={() => onSubmit({ ...initialData, title: 'Updated Risk' })}>
        <button type="submit">Update</button>
      </form>
    ));

    render(<RiskRegister />);
    const editButton = screen.getByText('Edit Risk');
    fireEvent.click(editButton);

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateRisk).toHaveBeenCalledWith({ ...mockRisks[0], title: 'Updated Risk' });
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('displays error message when risk operations fail', async () => {
    const mockError = new Error('Operation failed');
    const mockCreateRisk = jest.fn().mockRejectedValue(mockError);
    (RiskForm as jest.Mock).mockImplementation(({ onSubmit }) => (
      <form data-testid="risk-form" onSubmit={() => onSubmit(mockRisks[0])}>
        <button type="submit">Submit</button>
      </form>
    ));

    render(<RiskRegister />);
    const addButton = screen.getByText('Add Risk');
    fireEvent.click(addButton);

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Operation failed')).toBeInTheDocument();
    });
  });

  it('applies correct permissions based on user role', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { role: 'ReadOnly' } });
    render(<RiskRegister />);
    expect(screen.queryByText('Add Risk')).not.toBeInTheDocument();

    (useAuth as jest.Mock).mockReturnValue({ user: { role: 'RiskManager' } });
    render(<RiskRegister />);
    expect(screen.getByText('Add Risk')).toBeInTheDocument();
  });
});