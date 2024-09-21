import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import App from 'src/frontend/App';
import { store } from 'src/frontend/store/index';
import { theme } from 'src/frontend/styles/theme';
import { GlobalStyles } from 'src/frontend/styles/GlobalStyles';

const render = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error("Root element with id 'root' not found");
  }

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <App />
        </ThemeProvider>
      </Provider>
    </React.StrictMode>,
    rootElement
  );
};

render();

// Hot Module Replacement (HMR) for development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', render);
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      },
      (err) => {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}