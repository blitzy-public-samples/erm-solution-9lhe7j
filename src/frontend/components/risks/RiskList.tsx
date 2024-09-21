import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePagination, useDebounce } from 'src/shared/hooks/index';
import { API_BASE_URL, RISK_STATUS_LABELS } from 'src/shared/constants/index';
import { Risk, PaginatedResponse } from 'src/shared/types/index';
import { Link } from 'react-router-dom';
import { Table } from 'src/frontend/components/common/Table';
import { Input } from 'src/frontend/components/common/Input';
import { Button } from 'src/frontend/components/common/Button';

const ListContainer = styled.div`
  padding: 1rem;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

interface FilterState {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const RiskList: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  const fetchRisks = async (page: number, pageSize: number): Promise<PaginatedResponse<Risk>> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      search: debouncedSearch,
      status: filters.status,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });

    const response = await fetch(`${API_BASE_URL}/risks?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch risks');
    }
    return response.json();
  };

  const { data, loading, error, page, setPage, pageSize, setPageSize } = usePagination<Risk>(fetchRisks);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title',
      sortable: true,
      cell: (risk: Risk) => <Link to={`/risks/${risk.id}`}>{risk.title}</Link>,
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (risk: Risk) => RISK_STATUS_LABELS[risk.status],
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      sortable: true,
      cell: (risk: Risk) => new Date(risk.createdAt).toLocaleDateString(),
    },
  ];

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.status, filters.sortBy, filters.sortOrder]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <ListContainer>
      <FilterContainer>
        <Input
          type="text"
          placeholder="Search risks..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          {Object.entries(RISK_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FilterContainer>

      <Table
        columns={columns}
        data={data}
        loading={loading}
        sortable
        onSort={(sortBy, sortOrder) => {
          handleFilterChange('sortBy', sortBy);
          handleFilterChange('sortOrder', sortOrder);
        }}
      />

      <PaginationContainer>
        <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </Button>
        <span>
          Page {page} of {Math.ceil((data?.totalCount || 0) / pageSize)}
        </span>
        <Button
          onClick={() => setPage(page + 1)}
          disabled={page === Math.ceil((data?.totalCount || 0) / pageSize)}
        >
          Next
        </Button>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          <option value="10">10 per page</option>
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
        </select>
      </PaginationContainer>
    </ListContainer>
  );
};