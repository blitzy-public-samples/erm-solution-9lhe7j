import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Input } from 'src/frontend/components/common/Input';

describe('Input component', () => {
  it('renders input with correct type', () => {
    const { getByRole } = render(<Input type="text" />);
    const inputElement = getByRole('textbox') as HTMLInputElement;
    expect(inputElement.type).toBe('text');
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    const { getByRole } = render(<Input type="text" onChange={handleChange} />);
    const inputElement = getByRole('textbox') as HTMLInputElement;
    
    fireEvent.change(inputElement, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
    expect(inputElement.value).toBe('new value');
  });

  it('displays placeholder text correctly', () => {
    const placeholder = 'Enter text here';
    const { getByPlaceholderText } = render(<Input type="text" placeholder={placeholder} />);
    const inputElement = getByPlaceholderText(placeholder);
    expect(inputElement).toBeInTheDocument();
  });

  it('applies error styles when error prop is provided', () => {
    const { getByRole } = render(<Input type="text" error="Error message" />);
    const inputElement = getByRole('textbox');
    expect(inputElement).toHaveClass('error'); // Assuming 'error' is the CSS class for error styles
  });

  it('disables the input when disabled prop is true', () => {
    const { getByRole } = render(<Input type="text" disabled />);
    const inputElement = getByRole('textbox') as HTMLInputElement;
    expect(inputElement.disabled).toBe(true);
  });

  it('applies full width style when fullWidth prop is true', () => {
    const { getByRole } = render(<Input type="text" fullWidth />);
    const inputElement = getByRole('textbox');
    expect(inputElement).toHaveClass('fullWidth'); // Assuming 'fullWidth' is the CSS class for full width
  });

  it('renders error message when error prop is provided', () => {
    const errorMessage = 'This field is required';
    const { getByText } = render(<Input type="text" error={errorMessage} />);
    const errorElement = getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
  });
});