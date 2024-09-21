import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth, useFetch } from 'src/shared/hooks/index';
import { API_BASE_URL } from 'src/shared/constants/index';
import { Button, Input, Select, Modal } from 'src/frontend/components/common/index';
import { User, Organization } from 'src/shared/types/index';

const PageContainer = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #333333;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: #333333;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [personalSettings, setPersonalSettings] = useState<Partial<User>>({});
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [organizationSettings, setOrganizationSettings] = useState<Partial<Organization>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: orgData, error: orgError } = useFetch<Organization>(
    user?.role === 'Admin' ? `${API_BASE_URL}/organizations/${user.organizationId}` : null
  );

  useEffect(() => {
    if (user) {
      setPersonalSettings({ name: user.name, email: user.email });
    }
    if (orgData) {
      setOrganizationSettings(orgData);
    }
  }, [user, orgData]);

  const handlePersonalSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUser(personalSettings);
      setSuccessMessage('Personal settings updated successfully');
    } catch (err) {
      setError('Failed to update personal settings');
    }
    setIsLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await fetch(`${API_BASE_URL}/users/${user?.id}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: passwordData.currentPassword, 
          newPassword: passwordData.newPassword 
        }),
      });
      setSuccessMessage('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Failed to change password');
    }
    setIsLoading(false);
  };

  const handleOrganizationSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'Admin') return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${user.organizationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(organizationSettings),
      });
      if (!response.ok) throw new Error('Failed to update organization settings');
      setSuccessMessage('Organization settings updated successfully');
    } catch (err) {
      setError('Failed to update organization settings');
    }
    setIsLoading(false);
  };

  return (
    <PageContainer>
      <Header>
        <Title>Settings</Title>
      </Header>

      <Section>
        <SectionTitle>Personal Settings</SectionTitle>
        <form onSubmit={handlePersonalSettingsUpdate}>
          <FormGroup>
            <Input
              label="Name"
              value={personalSettings.name || ''}
              onChange={(e) => setPersonalSettings({ ...personalSettings, name: e.target.value })}
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="Email"
              type="email"
              value={personalSettings.email || ''}
              onChange={(e) => setPersonalSettings({ ...personalSettings, email: e.target.value })}
            />
          </FormGroup>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Personal Settings'}
          </Button>
        </form>
      </Section>

      <Section>
        <SectionTitle>Account Security</SectionTitle>
        <form onSubmit={handlePasswordChange}>
          <FormGroup>
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
          </FormGroup>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </form>
      </Section>

      {user?.role === 'Admin' && (
        <Section>
          <SectionTitle>Organization Settings</SectionTitle>
          <form onSubmit={handleOrganizationSettingsUpdate}>
            <FormGroup>
              <Input
                label="Organization Name"
                value={organizationSettings.name || ''}
                onChange={(e) => setOrganizationSettings({ ...organizationSettings, name: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Input
                label="Industry"
                value={organizationSettings.industry || ''}
                onChange={(e) => setOrganizationSettings({ ...organizationSettings, industry: e.target.value })}
              />
            </FormGroup>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Organization Settings'}
            </Button>
          </form>
        </Section>
      )}

      {error && <Modal isOpen={!!error} onClose={() => setError(null)}>{error}</Modal>}
      {successMessage && (
        <Modal isOpen={!!successMessage} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Modal>
      )}
    </PageContainer>
  );
};