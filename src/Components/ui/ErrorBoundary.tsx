import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
    /** Child components */
    children: ReactNode;
    /** Custom fallback UI */
    fallback?: ReactNode;
    /** Callback when error occurs */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** Reset error on location change (for React Router) */
    resetOnLocationChange?: boolean;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors in child component tree and displays fallback UI.
 * Essential for handling lazy loading failures gracefully.
 * 
 * @example
 * // Basic usage
 * <ErrorBoundary>
 *   <Suspense fallback={<LoadingFallback />}>
 *     <LazyComponent />
 *   </Suspense>
 * </ErrorBoundary>
 * 
 * @example
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorPage />}>
 *   <App />
 * </ErrorBoundary>
 * 
 * @example
 * // With error callback
 * <ErrorBoundary onError={(error) => logToService(error)}>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });

        // Call optional error callback
        this.props.onError?.(error, errorInfo);

        // Log to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error);
            console.error('Component stack:', errorInfo.componentStack);
        }
    }

    handleRetry = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        const { hasError, error } = this.state;
        const { children, fallback } = this.props;

        if (hasError) {
            // Custom fallback provided
            if (fallback) {
                return fallback;
            }

            // Default error UI
            return (
                <div className="error-boundary">
                    <style>{`
            .error-boundary {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 40px;
              text-align: center;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .error-boundary-icon {
              font-size: 64px;
              margin-bottom: 24px;
            }
            .error-boundary-title {
              font-size: 24px;
              font-weight: 600;
              color: #333;
              margin: 0 0 12px 0;
            }
            .error-boundary-message {
              font-size: 16px;
              color: #666;
              margin: 0 0 24px 0;
              max-width: 400px;
            }
            .error-boundary-buttons {
              display: flex;
              gap: 12px;
            }
            .error-boundary-btn {
              padding: 12px 24px;
              font-size: 14px;
              font-weight: 500;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
              border: none;
            }
            .error-boundary-btn-primary {
              background-color: #224570;
              color: white;
            }
            .error-boundary-btn-primary:hover {
              background-color: #1a3557;
            }
            .error-boundary-btn-secondary {
              background-color: #f0f0f0;
              color: #333;
            }
            .error-boundary-btn-secondary:hover {
              background-color: #e0e0e0;
            }
            .error-boundary-details {
              margin-top: 24px;
              padding: 16px;
              background-color: #fff5f5;
              border: 1px solid #feb2b2;
              border-radius: 8px;
              max-width: 500px;
              text-align: left;
            }
            .error-boundary-details summary {
              cursor: pointer;
              font-weight: 500;
              color: #c53030;
            }
            .error-boundary-details pre {
              margin: 12px 0 0 0;
              padding: 12px;
              background-color: #2d2d2d;
              color: #f8f8f2;
              border-radius: 4px;
              font-size: 12px;
              overflow-x: auto;
            }
            @media (prefers-color-scheme: dark) {
              .error-boundary-title { color: #eee; }
              .error-boundary-message { color: #aaa; }
              .error-boundary-btn-secondary {
                background-color: #333;
                color: #eee;
              }
              .error-boundary-btn-secondary:hover {
                background-color: #444;
              }
            }
          `}</style>

                    <div className="error-boundary-icon" role="img" aria-label="Error">
                        ⚠️
                    </div>

                    <h2 className="error-boundary-title">
                        Terjadi Kesalahan
                    </h2>

                    <p className="error-boundary-message">
                        Maaf, terjadi kesalahan saat memuat halaman ini.
                        Silakan coba lagi atau muat ulang halaman.
                    </p>

                    <div className="error-boundary-buttons">
                        <button
                            className="error-boundary-btn error-boundary-btn-primary"
                            onClick={this.handleRetry}
                        >
                            Coba Lagi
                        </button>
                        <button
                            className="error-boundary-btn error-boundary-btn-secondary"
                            onClick={this.handleReload}
                        >
                            Muat Ulang
                        </button>
                    </div>

                    {import.meta.env.DEV && error && (
                        <details className="error-boundary-details">
                            <summary>Detail Error (Development Only)</summary>
                            <pre>{error.message}</pre>
                            <pre>{error.stack}</pre>
                        </details>
                    )}
                </div>
            );
        }

        return children;
    }
}

export default ErrorBoundary;

// ============================================
// Suspense wrapper with ErrorBoundary
// ============================================
import { Suspense } from 'react';
import LoadingFallback from './LoadingFallback';

interface SafeSuspenseProps {
    children: ReactNode;
    fallback?: ReactNode;
    errorFallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * SafeSuspense - Suspense with built-in ErrorBoundary
 * 
 * @example
 * <SafeSuspense>
 *   <LazyComponent />
 * </SafeSuspense>
 */
export const SafeSuspense: React.FC<SafeSuspenseProps> = ({
    children,
    fallback = <LoadingFallback variant="spinner" />,
    errorFallback,
    onError,
}) => (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
        <Suspense fallback={fallback}>
            {children}
        </Suspense>
    </ErrorBoundary>
);
