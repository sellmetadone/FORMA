import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { ErrorBoundary } from '@/components/system/ErrorBoundary';
import { applyStoredA11y } from './core/a11y';
import './styles/global.css';
import './styles/tokens.css';

applyStoredA11y();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
