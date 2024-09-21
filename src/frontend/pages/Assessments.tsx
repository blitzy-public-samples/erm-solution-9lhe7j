import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from 'src/shared/hooks/index';
import AssessmentList from 'src/frontend/components/assessments/AssessmentList';
import AssessmentForm from 'src/frontend/components/assessments/AssessmentForm';
import Button from 'src/frontend/components/common/Button';
import Modal from 'src/frontend/components/common/Modal';
import { Assessment } from 'src/shared/types/index';

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

const Assessments: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const { user } = useAuth();

  const handleAddAssessment = () => {
    setSelectedAssessment(null);
    setIsAddModalOpen(true);
  };

  const handleEditAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsAddModalOpen(true);
  };

  const handleAssessmentSubmit = async (assessment: Assessment) => {
    try {
      if (selectedAssessment) {
        // Update existing assessment
        // Implement API call to update assessment
      } else {
        // Create new assessment
        // Implement API call to create assessment
      }
      setIsAddModalOpen(false);
      // Refresh assessment list
    } catch (error) {
      console.error('Error submitting assessment:', error);
      // Implement error handling
    }
  };

  const handleAssessmentDelete = async (assessmentId: number) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        // Implement API call to delete assessment
        // Refresh assessment list
      } catch (error) {
        console.error('Error deleting assessment:', error);
        // Implement error handling
      }
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>Risk Assessments</Title>
        {user && (user.role === 'Admin' || user.role === 'RiskManager') && (
          <Button onClick={handleAddAssessment}>Add Assessment</Button>
        )}
      </Header>
      <AssessmentList
        onEditAssessment={handleEditAssessment}
        onDeleteAssessment={handleAssessmentDelete}
      />
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <AssessmentForm
          assessment={selectedAssessment}
          onSubmit={handleAssessmentSubmit}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </PageContainer>
  );
};

export default Assessments;