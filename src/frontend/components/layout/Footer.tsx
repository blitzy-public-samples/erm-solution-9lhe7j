import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ROUTES } from 'src/shared/constants/index';

const FooterContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const Copyright = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const FooterNav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const FooterLink = styled(Link)`
  color: #6c757d;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s ease;
  &:hover {
    color: #495057;
  }
`;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <Copyright>
        &copy; {currentYear} ERM Experts Inc. All rights reserved.
      </Copyright>
      <FooterNav>
        <FooterLink to={ROUTES.ABOUT}>About Us</FooterLink>
        <FooterLink to={ROUTES.TERMS}>Terms of Service</FooterLink>
        <FooterLink to={ROUTES.PRIVACY}>Privacy Policy</FooterLink>
        {/* Add social media links here if required */}
      </FooterNav>
    </FooterContainer>
  );
};

export default Footer;