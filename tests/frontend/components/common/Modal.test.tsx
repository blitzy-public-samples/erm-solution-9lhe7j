import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Modal } from 'src/frontend/components/common/Modal';

describe('Modal component', () => {
  it('renders modal when isOpen is true', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="Test Modal" />);
    const modalElement = screen.getByRole('dialog');
    expect(modalElement).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={() => {}} title="Test Modal" />);
    const modalElement = screen.queryByRole('dialog');
    expect(modalElement).not.toBeInTheDocument();
  });

  it('renders modal with correct title', () => {
    const title = 'Test Modal Title';
    render(<Modal isOpen={true} onClose={() => {}} title={title} />);
    const titleElement = screen.getByText(title);
    expect(titleElement).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();
    render(<Modal isOpen={true} onClose={onCloseMock} title="Test Modal" />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('renders children content correctly', () => {
    const childContent = 'Test Child Content';
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>{childContent}</div>
      </Modal>
    );
    const childElement = screen.getByText(childContent);
    expect(childElement).toBeInTheDocument();
  });

  it('applies custom size when size prop is provided', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="Test Modal" size="large" />);
    const modalContent = screen.getByRole('dialog');
    expect(modalContent).toHaveClass('modal-large');
  });

  it('closes modal when clicking on overlay if closeOnOverlayClick is true', () => {
    const onCloseMock = jest.fn();
    render(
      <Modal isOpen={true} onClose={onCloseMock} title="Test Modal" closeOnOverlayClick={true} />
    );
    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('does not close modal when clicking on overlay if closeOnOverlayClick is false', () => {
    const onCloseMock = jest.fn();
    render(
      <Modal isOpen={true} onClose={onCloseMock} title="Test Modal" closeOnOverlayClick={false} />
    );
    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    expect(onCloseMock).not.toHaveBeenCalled();
  });
});