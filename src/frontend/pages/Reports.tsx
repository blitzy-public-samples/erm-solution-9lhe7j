import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from 'src/shared/hooks/index';
import { ReportList } from 'src/frontend/components/reports/ReportList';
import { ReportBuilder } from 'src/frontend/components/reports/ReportBuilder';
import { Button } from 'src/frontend/components/common/Button';
import { Modal } from 'src/frontend/components/common/Modal';
import { Report, ReportConfig } from 'src/shared/types/index';

const PageContainer = styled.div`
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

export const Reports: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { user } = useAuth();

  const handleCreateReport = () => {
    setSelectedReport(null);
    setIsCreateModalOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setIsCreateModalOpen(true);
  };

  const handleReportSubmit = async (reportConfig: ReportConfig) => {
    try {
      if (selectedReport) {
        // Update existing report
        // Implement API call to update report
        console.log('Updating report:', reportConfig);
      } else {
        // Create new report
        // Implement API call to create report
        console.log('Creating new report:', reportConfig);
      }
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      // Implement error handling
    }
  };

  const handleReportDelete = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        // Implement API call to delete report
        console.log('Deleting report:', reportId);
      } catch (error) {
        console.error('Error deleting report:', error);
        // Implement error handling
      }
    }
  };

  const handleGenerateReport = async (reportId: string) => {
    try {
      // Implement API call to generate report
      console.log('Generating report:', reportId);
    } catch (error) {
      console.error('Error generating report:', error);
      // Implement error handling
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>Reports</Title>
        {user && user.role === 'Admin' && (
          <Button onClick={handleCreateReport}>Create Report</Button>
        )}
      </Header>
      <ReportList
        onEditReport={handleEditReport}
        onDeleteReport={handleReportDelete}
        onGenerateReport={handleGenerateReport}
      />
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={selectedReport ? 'Edit Report' : 'Create Report'}
      >
        <ReportBuilder
          initialConfig={selectedReport}
          onSubmit={handleReportSubmit}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </PageContainer>
  );
};