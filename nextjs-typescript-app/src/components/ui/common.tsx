"use client";

import { ReactNode, Component, ErrorInfo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-2 border-green-400 border-t-transparent rounded-full animate-spin mb-4`}></div>
      <p className="text-green-200 text-sm">{message}</p>
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 text-center bg-red-600/10 border border-red-500/20 rounded-lg">
          <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-400 mb-2">Something went wrong</h3>
          <p className="text-red-300 text-sm mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'loading' | 'error';
  label: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-400';
      case 'offline':
        return 'text-red-400';
      case 'loading':
        return 'text-yellow-400';
      case 'error':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'online':
        return '●';
      case 'offline':
        return '●';
      case 'loading':
        return '○';
      case 'error':
        return '⚠';
      default:
        return '○';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`${getStatusColor()} ${status === 'loading' ? 'animate-pulse' : ''}`}>
        {getIcon()}
      </span>
      <span className="text-slate-300 text-sm">{label}</span>
    </div>
  );
};