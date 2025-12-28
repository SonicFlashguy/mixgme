import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary p-4 rounded-lg border-2 border-red-500 bg-red-100 text-red-700">
          <h2 className="font-bold text-lg mb-2">Something went wrong</h2>
          <details className="whitespace-pre-wrap">
            <summary>Error details</summary>
            <p>{this.state.error?.message}</p>
            <p className="mt-2 text-sm">Check the console for more information.</p>
          </details>
          <button 
            className="mt-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
