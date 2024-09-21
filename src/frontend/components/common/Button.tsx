import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const StyledButton = styled.button<ButtonProps>`
  padding: ${({ size }) => {
    switch (size) {
      case 'small':
        return '0.5rem 1rem';
      case 'large':
        return '1rem 2rem';
      default:
        return '0.75rem 1.5rem';
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'small':
        return '0.875rem';
      case 'large':
        return '1.125rem';
      default:
        return '1rem';
    }
  }};
  background-color: ${({ variant }) => {
    switch (variant) {
      case 'secondary':
        return '#6c757d';
      case 'danger':
        return '#dc3545';
      case 'success':
        return '#28a745';
      default:
        return '#007bff';
    }
  }};
  color: #ffffff;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  border-radius: 4px;
  border: none;
  transition: background-color 0.3s ease;

  &:hover:not(:disabled) {
    background-color: ${({ variant }) => {
      switch (variant) {
        case 'secondary':
          return '#5a6268';
        case 'danger':
          return '#c82333';
        case 'success':
          return '#218838';
        default:
          return '#0056b3';
      }
    }};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      aria-disabled={disabled}
    >
      {children}
    </StyledButton>
  );
};