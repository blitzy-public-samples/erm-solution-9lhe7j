import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { store } from 'src/frontend/store/index';
import { theme } from 'src/frontend/styles/theme';
import { GlobalStyles } from 'src/frontend/styles/GlobalStyles';
import { AuthProvider, NotificationProvider } from 'src/shared/contexts/index';
import { Header } from 'src/frontend/components/layout/Header';
import { Footer } from 'src/frontend/components/layout/Footer';
import { Sidebar } from 'src/frontend/components/layout/Sidebar';
import { Dashboard } from 'src/frontend/pages/Dashboard';
import { RiskRegister } from 'src/frontend/pages/RiskRegister';
import { Assessments } from 'src/frontend/pages/Assessments';
import { Reports } from 'src/frontend/pages/Reports';
import { Settings } from 'src/frontend/pages/Settings';
import { Login } from 'src/frontend/pages/Login';
import { PrivateRoute } from 'src/frontend/components/common/PrivateRoute';
import { ROUTES } from 'src/shared/constants/index';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  display: flex;
  flex: 1;
`;

const PageContent = styled.div`
  flex: 1;
  padding: 1rem;
`;

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <AppContainer>
                <Header />
                <MainContent>
                  <Sidebar />
                  <PageContent>
                    <Routes>
                      <Route path={ROUTES.LOGIN} element={<Login />} />
                      <Route
                        path={ROUTES.DASHBOARD}
                        element={
                          <PrivateRoute>
                            <Dashboard />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path={ROUTES.RISK_REGISTER}
                        element={
                          <PrivateRoute>
                            <RiskRegister />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path={ROUTES.ASSESSMENTS}
                        element={
                          <PrivateRoute>
                            <Assessments />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path={ROUTES.REPORTS}
                        element={
                          <PrivateRoute>
                            <Reports />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path={ROUTES.SETTINGS}
                        element={
                          <PrivateRoute>
                            <Settings />
                          </PrivateRoute>
                        }
                      />
                      {/* Add a 404 Not Found route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </PageContent>
                </MainContent>
                <Footer />
              </AppContainer>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
};

// Implement a simple NotFound component
const NotFound: React.FC = () => (
  <div>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);