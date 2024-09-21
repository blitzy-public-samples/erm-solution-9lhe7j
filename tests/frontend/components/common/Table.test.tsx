import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Table } from 'src/frontend/components/common/Table';

const mockData = [
  { id: 1, name: "John Doe", age: 30 },
  { id: 2, name: "Jane Smith", age: 25 },
  { id: 3, name: "Bob Johnson", age: 35 }
];

const mockColumns = [
  { key: "id", header: "ID" },
  { key: "name", header: "Name" },
  { key: "age", header: "Age" }
];

describe('Table component', () => {
  it('renders table with correct headers', () => {
    render(<Table columns={mockColumns} data={[]} />);
    mockColumns.forEach(column => {
      expect(screen.getByText(column.header)).toBeInTheDocument();
    });
  });

  it('renders table rows with correct data', () => {
    render(<Table columns={mockColumns} data={mockData} />);
    expect(screen.getAllByRole('row')).toHaveLength(mockData.length + 1); // +1 for header row
    mockData.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.age.toString())).toBeInTheDocument();
    });
  });

  it('handles sorting when clicking on sortable column headers', () => {
    const sortableColumns = mockColumns.map(col => ({ ...col, sortable: true }));
    render(<Table columns={sortableColumns} data={mockData} />);
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Jane Smith');
    expect(rows[3]).toHaveTextContent('John Doe');
    
    fireEvent.click(nameHeader);
    expect(rows[1]).toHaveTextContent('John Doe');
    expect(rows[3]).toHaveTextContent('Jane Smith');
  });

  it('applies custom row styles when provided', () => {
    const customRowStyle = (item: any) => item.age > 30 ? { backgroundColor: 'lightblue' } : {};
    render(<Table columns={mockColumns} data={mockData} customRowStyle={customRowStyle} />);
    
    const rows = screen.getAllByRole('row');
    expect(rows[3]).toHaveStyle('background-color: lightblue');
    expect(rows[2]).not.toHaveStyle('background-color: lightblue');
  });

  it('handles row selection when selectable prop is true', () => {
    render(<Table columns={mockColumns} data={mockData} selectable={true} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // First row checkbox
    expect(checkboxes[1]).toBeChecked();
    
    fireEvent.click(checkboxes[0]); // Header checkbox
    checkboxes.slice(1).forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });
  });

  it('renders custom cell renderers correctly', () => {
    const customColumns = [
      ...mockColumns,
      { 
        key: 'custom', 
        header: 'Custom', 
        render: (item: any) => <span data-testid="custom-cell">{`Custom ${item.name}`}</span>
      }
    ];
    render(<Table columns={customColumns} data={mockData} />);
    
    expect(screen.getByTestId('custom-cell')).toHaveTextContent('Custom John Doe');
  });

  it('handles pagination correctly', () => {
    const paginatedData = [...mockData, ...mockData, ...mockData]; // 9 items total
    render(<Table columns={mockColumns} data={paginatedData} pageSize={3} />);
    
    expect(screen.getAllByRole('row')).toHaveLength(4); // 3 data rows + 1 header row
    
    const nextPageButton = screen.getByText('Next');
    fireEvent.click(nextPageButton);
    
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('John Doe');
    expect(rows[3]).toHaveTextContent('Bob Johnson');
  });
});