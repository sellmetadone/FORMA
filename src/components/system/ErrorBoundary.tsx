import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/core/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Unknown error' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('ErrorBoundary', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, maxWidth: 480, margin: '80px auto', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: 20, marginBottom: 12 }}>FORMA encountered an error</h1>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>{this.state.message}</p>
          <button type="button" onClick={() => this.setState({ hasError: false, message: '' })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
