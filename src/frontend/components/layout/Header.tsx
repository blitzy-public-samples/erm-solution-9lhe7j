import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from 'src/shared/hooks/index';
import { Button } from 'src/frontend/components/common/Button';
import { ROUTES } from 'src/shared/constants/index';
import { User } from 'src/shared/types/index';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  color: #333;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #e9ecef;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <HeaderContainer>
      <Logo>ERM Experts</Logo>
      <Nav>
        <NavLink to={ROUTES.DASHBOARD}>Dashboard</NavLink>
        <NavLink to={ROUTES.RISK_REGISTER}>Risks</NavLink>
        <NavLink to={ROUTES.ASSESSMENTS}>Assessments</NavLink>
        <NavLink to={ROUTES.REPORTS}>Reports</NavLink>
      </Nav>
      <UserInfo>
        {isAuthenticated && user ? (
          <>
            <span>{user.name}</span>
            <Button onClick={logout} variant="secondary">Logout</Button>
          </>
        ) : (
          <Button as={Link} to={ROUTES.LOGIN}>Login</Button>
        )}
      </UserInfo>
    </HeaderContainer>
  );
};