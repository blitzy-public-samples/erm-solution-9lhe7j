import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Button } from 'src/frontend/components/common/Button';

describe('Button component', () => {
  it('renders button with correct text', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    const button = getByRole('button');
    expect(button).toHaveTextContent('Click me');
  });

  it('applies correct styles based on variant prop', () => {
    const { getByRole, rerender } = render(<Button variant="primary">Primary</Button>);
    let button = getByRole('button');
    expect(button).toHaveClass('primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    button = getByRole('button');
    expect(button).toHaveClass('secondary');

    rerender(<Button variant="danger">Danger</Button>);
    button = getByRole('button');
    expect(button).toHaveClass('danger');

    rerender(<Button variant="success">Success</Button>);
    button = getByRole('button');
    expect(button).toHaveClass('success');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when disabled prop is true', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    const button = getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies full width style when fullWidth prop is true', () => {
    const { getByRole } = render(<Button fullWidth>Full Width</Button>);
    const button = getByRole('button');
    expect(button).toHaveClass('fullWidth');
  });
});