'use client';

import { Component, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-6 text-center text-gray-500">
          <p className="text-lg font-medium">Une erreur est survenue</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 text-blue-600 underline text-sm"
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
