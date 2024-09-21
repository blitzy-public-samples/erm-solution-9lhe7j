import React from 'react';
import styled from 'styled-components';

interface InputProps {
  type?: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const StyledInput = styled.input<{ size?: string; fullWidth?: boolean; error?: string }>`
  padding: ${({ size }) => {
    switch (size) {
      case 'small':
        return '6px 10px';
      case 'large':
        return '12px 16px';
      default:
        return '8px 12px';
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'small':
        return '14px';
      case 'large':
        return '18px';
      default:
        return '16px';
    }
  }};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  border: 1px solid ${({ error }) => (error ? '#ff0000' : '#ccc')};
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #0066cc;
  }

  &:disabled {
    background-color: #f0f0f0;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  color: #ff0000;
  font-size: 12px;
  margin-top: 4px;
  display: block;
`;

export const Input: React.FC<InputProps> = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  fullWidth = false,
  size = 'medium',
}) => {
  return (
    <div>
      <StyledInput
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        fullWidth={fullWidth}
        size={size}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
};