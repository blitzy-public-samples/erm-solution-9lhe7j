import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'src/shared/hooks/index';
import { API_BASE_URL, RISK_STATUS_LABELS } from 'src/shared/constants/index';
import { Risk, RiskCategory } from 'src/shared/types/index';
import { Input, Button, Select, TextArea } from 'src/frontend/components/common';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
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

interface RiskFormProps {
  risk: Risk | null;
  onSubmit: (risk: Risk) => void;
  onCancel: () => void;
}

export const RiskForm: React.FC<RiskFormProps> = ({ risk, onSubmit, onCancel }) => {
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const { values, errors, handleChange, handleSubmit } = useForm<Risk>(
    risk || {
      title: '',
      description: '',
      categoryId: '',
      status: 'IDENTIFIED',
      mitigationPlan: '',
    },
    validateForm
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/risk-categories`);
      if (!response.ok) throw new Error('Failed to fetch risk categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching risk categories:', error);
      // TODO: Implement proper error handling
    }
  };

  const validateForm = (formValues: Partial<Risk>) => {
    const newErrors: Partial<Record<keyof Risk, string>> = {};
    if (!formValues.title) newErrors.title = 'Title is required';
    if (!formValues.description) newErrors.description = 'Description is required';
    if (!formValues.categoryId) newErrors.categoryId = 'Category is required';
    if (!formValues.status) newErrors.status = 'Status is required';
    return newErrors;
  };

  const handleFormSubmit = (formValues: Risk) => {
    onSubmit(formValues);
  };

  return (
    <FormContainer onSubmit={handleSubmit(handleFormSubmit)}>
      <FormGroup>
        <Input
          label="Title"
          name="title"
          value={values.title}
          onChange={handleChange}
          error={errors.title}
        />
      </FormGroup>
      <FormGroup>
        <TextArea
          label="Description"
          name="description"
          value={values.description}
          onChange={handleChange}
          error={errors.description}
        />
      </FormGroup>
      <FormGroup>
        <Select
          label="Category"
          name="categoryId"
          value={values.categoryId}
          onChange={handleChange}
          error={errors.categoryId}
          options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
        />
      </FormGroup>
      <FormGroup>
        <Select
          label="Status"
          name="status"
          value={values.status}
          onChange={handleChange}
          error={errors.status}
          options={Object.entries(RISK_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </FormGroup>
      <FormGroup>
        <TextArea
          label="Mitigation Plan"
          name="mitigationPlan"
          value={values.mitigationPlan}
          onChange={handleChange}
          error={errors.mitigationPlan}
        />
      </FormGroup>
      <ButtonGroup>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {risk ? 'Update Risk' : 'Create Risk'}
        </Button>
      </ButtonGroup>
    </FormContainer>
  );
};