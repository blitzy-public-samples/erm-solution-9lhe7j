import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { useAuth } from 'src/shared/hooks/index';
import { ROUTES } from 'src/shared/constants/index';
import { UserRole } from 'src/shared/types/index';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 250px;
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
`;

const SidebarHeader = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
`;

const NavList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0.5rem;
`;

const StyledNavLink = styled(NavLink)`
  color: #ecf0f1;
  text-decoration: none;
  display: block;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  &:hover { background-color: #34495e; }
  &.active { background-color: #3498db; }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #ecf0f1;
  font-size: 1.5rem;
  cursor: pointer;
`;

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>ERM Platform</SidebarHeader>
      <CloseButton onClick={onClose}>&times;</CloseButton>
      <NavList>
        <NavItem>
          <StyledNavLink to={ROUTES.DASHBOARD}>Dashboard</StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to={ROUTES.RISK_REGISTER}>Risk Register</StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to={ROUTES.ASSESSMENTS}>Assessments</StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to={ROUTES.REPORTS}>Reports</StyledNavLink>
        </NavItem>
        {user && user.role === UserRole.Admin && (
          <NavItem>
            <StyledNavLink to={ROUTES.SETTINGS}>Settings</StyledNavLink>
          </NavItem>
        )}
        {isAuthenticated && (
          <NavItem>
            <StyledNavLink to={ROUTES.LOGOUT}>Logout</StyledNavLink>
          </NavItem>
        )}
      </NavList>
    </SidebarContainer>
  );
};