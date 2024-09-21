import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useFetch } from 'src/shared/hooks/index';
import { API_BASE_URL, RISK_STATUS_LABELS } from 'src/shared/constants/index';
import { formatDate } from 'src/shared/utils/index';
import { Risk, Assessment, MitigationAction, Comment } from 'src/shared/types/index';
import { Button } from 'src/frontend/components/common/Button';
import { Modal } from 'src/frontend/components/common/Modal';
import { RiskForm } from 'src/frontend/components/risks/RiskForm';
import { AssessmentForm } from 'src/frontend/components/assessments/AssessmentForm';
import { MitigationActionForm } from 'src/frontend/components/risks/MitigationActionForm';
import { CommentForm } from 'src/frontend/components/risks/CommentForm';

const Container = styled.div`
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #333333;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: #333333;
  margin-bottom: 1rem;
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

export const RiskDetails: React.FC = () => {
  const { riskId } = useParams<{ riskId: string }>();
  const [modalType, setModalType] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const { data: risk, error, isLoading, refetch } = useFetch<Risk>(`${API_BASE_URL}/risks/${riskId}`);

  const handleEditRisk = () => {
    setModalType('editRisk');
  };

  const handleAddAssessment = () => {
    setModalType('addAssessment');
  };

  const handleAddMitigationAction = () => {
    setModalType('addMitigationAction');
  };

  const handleAddComment = () => {
    setModalType('addComment');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedItemId(null);
  };

  const handleSubmit = async () => {
    await refetch();
    handleCloseModal();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!risk) {
    return <div>Risk not found</div>;
  }

  return (
    <Container>
      <Header>
        <Title>{risk.title}</Title>
        <Button onClick={handleEditRisk}>Edit Risk</Button>
      </Header>

      <Section>
        <SectionTitle>Risk Details</SectionTitle>
        <p>Description: {risk.description}</p>
        <p>Status: {RISK_STATUS_LABELS[risk.status]}</p>
        <p>Created At: {formatDate(risk.createdAt)}</p>
        <p>Updated At: {formatDate(risk.updatedAt)}</p>
      </Section>

      <Section>
        <SectionTitle>Assessments</SectionTitle>
        <Button onClick={handleAddAssessment}>Add Assessment</Button>
        <List>
          {risk.assessments?.map((assessment: Assessment) => (
            <ListItem key={assessment.id}>
              {formatDate(assessment.assessmentDate)} - Likelihood: {assessment.likelihood}, Impact: {assessment.impact}
            </ListItem>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>Mitigation Actions</SectionTitle>
        <Button onClick={handleAddMitigationAction}>Add Mitigation Action</Button>
        <List>
          {risk.mitigationActions?.map((action: MitigationAction) => (
            <ListItem key={action.id}>
              {action.description} - Due: {formatDate(action.dueDate)}, Status: {action.status}
            </ListItem>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>Comments</SectionTitle>
        <Button onClick={handleAddComment}>Add Comment</Button>
        <List>
          {risk.comments?.map((comment: Comment) => (
            <ListItem key={comment.id}>
              {comment.content} - By: {comment.userId}, On: {formatDate(comment.createdAt)}
            </ListItem>
          ))}
        </List>
      </Section>

      <Modal isOpen={!!modalType} onClose={handleCloseModal}>
        {modalType === 'editRisk' && <RiskForm risk={risk} onSubmit={handleSubmit} onCancel={handleCloseModal} />}
        {modalType === 'addAssessment' && <AssessmentForm riskId={risk.id} onSubmit={handleSubmit} onCancel={handleCloseModal} />}
        {modalType === 'addMitigationAction' && <MitigationActionForm riskId={risk.id} onSubmit={handleSubmit} onCancel={handleCloseModal} />}
        {modalType === 'addComment' && <CommentForm riskId={risk.id} onSubmit={handleSubmit} onCancel={handleCloseModal} />}
      </Modal>
    </Container>
  );
};