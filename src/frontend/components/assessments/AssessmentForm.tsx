import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'src/shared/hooks/index';
import { API_BASE_URL } from 'src/shared/constants/index';
import { Assessment, Likelihood, Impact } from 'src/shared/types/index';
import { Input, Button, Select, TextArea } from 'src/frontend/components/common';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

interface AssessmentFormProps {
  riskId: string;
  assessment: Assessment | null;
  onSubmit: (assessment: Assessment) => void;
  onCancel: () => void;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  riskId,
  assessment,
  onSubmit,
  onCancel,
}) => {
  const [likelihoods, setLikelihoods] = useState<Likelihood[]>([]);
  const [impacts, setImpacts] = useState<Impact[]>([]);

  const { values, errors, handleChange, handleSubmit } = useForm<Assessment>({
    initialValues: assessment || {
      riskId,
      likelihoodId: '',
      impactId: '',
      assessmentDate: new Date().toISOString(),
      notes: '',
    },
    onSubmit: (formData) => {
      onSubmit(formData);
    },
    validate: (formData) => {
      const newErrors: Partial<Record<keyof Assessment, string>> = {};
      if (!formData.likelihoodId) newErrors.likelihoodId = 'Likelihood is required';
      if (!formData.impactId) newErrors.impactId = 'Impact is required';
      return newErrors;
    },
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [likelihoodResponse, impactResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/likelihoods`),
          fetch(`${API_BASE_URL}/impacts`),
        ]);
        const likelihoodData = await likelihoodResponse.json();
        const impactData = await impactResponse.json();
        setLikelihoods(likelihoodData);
        setImpacts(impactData);
      } catch (error) {
        console.error('Error fetching likelihood and impact options:', error);
        // TODO: Implement proper error handling and user feedback
      }
    };
    fetchOptions();
  }, []);

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormGroup>
        <Select
          name="likelihoodId"
          label="Likelihood"
          value={values.likelihoodId}
          onChange={handleChange}
          error={errors.likelihoodId}
        >
          <option value="">Select Likelihood</option>
          {likelihoods.map((likelihood) => (
            <option key={likelihood.id} value={likelihood.id}>
              {likelihood.level}
            </option>
          ))}
        </Select>
      </FormGroup>
      <FormGroup>
        <Select
          name="impactId"
          label="Impact"
          value={values.impactId}
          onChange={handleChange}
          error={errors.impactId}
        >
          <option value="">Select Impact</option>
          {impacts.map((impact) => (
            <option key={impact.id} value={impact.id}>
              {impact.level}
            </option>
          ))}
        </Select>
      </FormGroup>
      <FormGroup>
        <TextArea
          name="notes"
          label="Assessment Notes"
          value={values.notes}
          onChange={handleChange}
          error={errors.notes}
        />
      </FormGroup>
      <ButtonGroup>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Submit Assessment
        </Button>
      </ButtonGroup>
    </FormContainer>
  );
};