import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { setup } from '@flightsingle/prefetch';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize prefetch
setup({
  serviceWorkerPath: '/service-worker.js',
  debug: true
});
