import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from 'src/shared/hooks/index';
import RiskList from 'src/frontend/components/risks/RiskList';
import RiskForm from 'src/frontend/components/risks/RiskForm';
import Button from 'src/frontend/components/common/Button';
import Modal from 'src/frontend/components/common/Modal';
import { Risk } from 'src/shared/types/index';

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

const RiskRegister: React.FC = () => {
  const [isAddRiskModalOpen, setIsAddRiskModalOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const { user } = useAuth();

  const handleAddRisk = () => {
    setSelectedRisk(null);
    setIsAddRiskModalOpen(true);
  };

  const handleEditRisk = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsAddRiskModalOpen(true);
  };

  const handleRiskSubmit = async (risk: Risk) => {
    try {
      if (selectedRisk) {
        // Update existing risk
        // Implement API call to update risk
        console.log('Updating risk:', risk);
      } else {
        // Create new risk
        // Implement API call to create risk
        console.log('Creating new risk:', risk);
      }
      setIsAddRiskModalOpen(false);
      // Refresh risk list
    } catch (error) {
      console.error('Error submitting risk:', error);
      // Implement error handling
    }
  };

  const handleRiskDelete = async (riskId: number) => {
    if (window.confirm('Are you sure you want to delete this risk?')) {
      try {
        // Implement API call to delete risk
        console.log('Deleting risk:', riskId);
        // Refresh risk list
      } catch (error) {
        console.error('Error deleting risk:', error);
        // Implement error handling
      }
    }
  };

  const canAddRisk = user && ['Admin', 'RiskManager'].includes(user.role);

  return (
    <PageContainer>
      <Header>
        <Title>Risk Register</Title>
        {canAddRisk && (
          <Button onClick={handleAddRisk} variant="primary">
            Add Risk
          </Button>
        )}
      </Header>
      <RiskList onEditRisk={handleEditRisk} onDeleteRisk={handleRiskDelete} />
      <Modal
        isOpen={isAddRiskModalOpen}
        onClose={() => setIsAddRiskModalOpen(false)}
        title={selectedRisk ? 'Edit Risk' : 'Add New Risk'}
      >
        <RiskForm
          risk={selectedRisk}
          onSubmit={handleRiskSubmit}
          onCancel={() => setIsAddRiskModalOpen(false)}
        />
      </Modal>
    </PageContainer>
  );
};

export default RiskRegister;