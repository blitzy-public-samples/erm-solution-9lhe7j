import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RiskForm } from 'src/frontend/components/risks/RiskForm';
import { useForm } from 'src/shared/hooks/index';
import { Risk, RiskCategory } from 'src/shared/types/index';

// Mock the useForm hook
jest.mock('src/shared/hooks/index', () => ({
  useForm: jest.fn(),
}));

// Mock risk data
const mockRisk: Risk = {
  id: 1,
  title: "Test Risk",
  description: "This is a test risk",
  categoryId: 1,
  ownerId: 1,
  status: "IDENTIFIED",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z"
};

// Mock risk categories
const mockCategories: RiskCategory[] = [
  { id: 1, name: "Category 1" },
  { id: 2, name: "Category 2" }
];

describe('RiskForm component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock the useForm hook implementation
    (useForm as jest.Mock).mockReturnValue({
      values: {},
      errors: {},
      handleChange: jest.fn(),
      handleSubmit: jest.fn(),
      setFieldValue: jest.fn(),
    });
  });

  it('renders form fields correctly', () => {
    render(<RiskForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/owner/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  it('populates form fields with existing risk data when editing', () => {
    render(<RiskForm risk={mockRisk} onSubmit={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue(mockRisk.title);
    expect(screen.getByLabelText(/description/i)).toHaveValue(mockRisk.description);
    expect(screen.getByLabelText(/category/i)).toHaveValue(mockRisk.categoryId.toString());
    expect(screen.getByLabelText(/owner/i)).toHaveValue(mockRisk.ownerId.toString());
    expect(screen.getByLabelText(/status/i)).toHaveValue(mockRisk.status);
  });

  it('handles form submission correctly', async () => {
    const mockSubmit = jest.fn();
    const { handleSubmit } = useForm() as any;
    handleSubmit.mockImplementation((callback) => {
      return () => callback({ title: 'New Risk', description: 'New description' });
    });

    render(<RiskForm onSubmit={mockSubmit} onCancel={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({ title: 'New Risk', description: 'New description' });
    });
  });

  it('displays validation errors for invalid inputs', async () => {
    const { errors } = useForm() as any;
    errors.title = 'Title is required';

    render(<RiskForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('handles category selection correctly', () => {
    const { setFieldValue } = useForm() as any;

    render(<RiskForm onSubmit={jest.fn()} onCancel={jest.fn()} categories={mockCategories} />);

    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: '2' } });

    expect(setFieldValue).toHaveBeenCalledWith('categoryId', '2');
  });

  it('disables submit button when form is invalid', () => {
    const { errors } = useForm() as any;
    errors.title = 'Title is required';

    render(<RiskForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const mockCancel = jest.fn();

    render(<RiskForm onSubmit={jest.fn()} onCancel={mockCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockCancel).toHaveBeenCalled();
  });
});

// Human tasks:
// - Implement tests for any custom form behaviors or complex validations
// - Add tests for handling API errors during form submission
// - Implement tests for accessibility features of the form (e.g., keyboard navigation, ARIA attributes)
// - Add snapshot tests to capture and compare rendered output of the RiskForm
// - Consider adding tests for any dynamic form behaviors (e.g., conditional fields based on risk type)
// - Add tests for any file upload functionality if implemented in the risk form
// - Review and update tests whenever the RiskForm component is modified or new features are added