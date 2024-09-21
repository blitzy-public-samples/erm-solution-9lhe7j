import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { usePagination } from 'src/shared/hooks/index';
import { API_BASE_URL } from 'src/shared/constants/index';
import { Report, PaginatedResponse } from 'src/shared/types/index';
import Table from 'src/frontend/components/common/Table';
import Button from 'src/frontend/components/common/Button';
import Modal from 'src/frontend/components/common/Modal';
import ReportForm from 'src/frontend/components/reports/ReportForm';

const ListContainer = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #333333;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const ReportList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async (page: number, pageSize: number) => {
    const response = await fetch(`${API_BASE_URL}/reports?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return await response.json() as PaginatedResponse<Report>;
  };

  const { data, loading, error, page, setPage, totalPages } = usePagination<Report>(fetchReports, 10);

  const handleCreateReport = () => {
    setSelectedReport(null);
    setIsModalOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleDeleteReport = async (reportId: number) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Failed to delete report');
        }
        // Refetch reports after deletion
        setPage(1);
      } catch (error) {
        console.error('Error deleting report:', error);
        // TODO: Show error message to user
      }
    }
  };

  const handleGenerateReport = async (reportId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/generate`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      const result = await response.json();
      // TODO: Handle the generated report (e.g., download or display)
    } catch (error) {
      console.error('Error generating report:', error);
      // TODO: Show error message to user
    }
  };

  const columns = [
    { key: 'name', header: 'Report Name' },
    { key: 'createdAt', header: 'Created At' },
    { key: 'actions', header: 'Actions', render: (report: Report) => (
      <>
        <Button onClick={() => handleEditReport(report)}>Edit</Button>
        <Button onClick={() => handleGenerateReport(report.id)}>Generate</Button>
        <Button onClick={() => handleDeleteReport(report.id)}>Delete</Button>
      </>
    )}
  ];

  useEffect(() => {
    // Refetch data when necessary (e.g., after creating or editing a report)
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ListContainer>
      <Header>
        <Title>Reports</Title>
        <Button onClick={handleCreateReport}>Create Report</Button>
      </Header>
      <Table columns={columns} data={data} />
      <PaginationContainer>
        <Button onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
        <span>{page} of {totalPages}</span>
        <Button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</Button>
      </PaginationContainer>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ReportForm
          report={selectedReport}
          onSubmit={(reportData) => {
            // TODO: Handle report creation/update
            setIsModalOpen(false);
            setPage(1); // Refetch first page after creating/updating
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </ListContainer>
  );
};

export default ReportList;