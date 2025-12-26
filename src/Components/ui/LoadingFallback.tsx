import React from 'react';
import './styles/LoadingFallback.css';

type LoadingVariant = 'spinner' | 'skeleton' | 'minimal' | 'fullscreen' | 'dots';

interface LoadingFallbackProps {
    /** Loading variant style */
    variant?: LoadingVariant;
    /** Loading message */
    message?: string;
    /** Custom class name */
    className?: string;
    /** Size: small, medium, large */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * LoadingFallback Component
 * 
 * A versatile loading component for Suspense fallbacks.
 * 
 * @example
 * // Full page loading
 * <Suspense fallback={<LoadingFallback variant="fullscreen" message="Loading..." />}>
 * 
 * @example
 * // Inline loading
 * <Suspense fallback={<LoadingFallback variant="minimal" size="sm" />}>
 * 
 * @example
 * // Skeleton loading
 * <Suspense fallback={<LoadingFallback variant="skeleton" />}>
 */
const LoadingFallback: React.FC<LoadingFallbackProps> = ({
    variant = 'spinner',
    message,
    className = '',
    size = 'md',
}) => {
    const sizeClass = `loading-${size}`;

    // Spinner variant (default)
    if (variant === 'spinner') {
        return (
            <div className={`loading-fallback loading-spinner ${sizeClass} ${className}`}>
                <div className="spinner" aria-hidden="true" />
                {message && <p className="loading-message">{message}</p>}
            </div>
        );
    }

    // Dots variant (animated dots)
    if (variant === 'dots') {
        return (
            <div className={`loading-fallback loading-dots ${sizeClass} ${className}`}>
                <div className="dots" aria-hidden="true">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                </div>
                {message && <p className="loading-message">{message}</p>}
            </div>
        );
    }

    // Minimal variant (inline)
    if (variant === 'minimal') {
        return (
            <span className={`loading-minimal ${sizeClass} ${className}`} aria-label="Loading">
                <span className="spinner-minimal" aria-hidden="true" />
            </span>
        );
    }

    // Skeleton variant
    if (variant === 'skeleton') {
        return (
            <div className={`loading-skeleton ${className}`} aria-label="Loading content">
                <div className="skeleton-header" />
                <div className="skeleton-content">
                    <div className="skeleton-line skeleton-line-full" />
                    <div className="skeleton-line skeleton-line-80" />
                    <div className="skeleton-line skeleton-line-60" />
                </div>
                <div className="skeleton-grid">
                    <div className="skeleton-card" />
                    <div className="skeleton-card" />
                    <div className="skeleton-card" />
                </div>
            </div>
        );
    }

    // Fullscreen variant
    if (variant === 'fullscreen') {
        return (
            <div className={`loading-fullscreen ${className}`} role="alert" aria-busy="true">
                <div className="loading-fullscreen-content">
                    <div className="spinner spinner-lg" aria-hidden="true" />
                    <p className="loading-message">{message || 'Memuat...'}</p>
                </div>
            </div>
        );
    }

    return null;
};

export default LoadingFallback;

// ============================================
// Page-specific loading components
// ============================================

/** Full page loader for route transitions */
export const PageLoader: React.FC<{ message?: string }> = ({ message }) => (
    <LoadingFallback variant="fullscreen" message={message || 'Memuat halaman...'} />
);

/** Card/section loader */
export const SectionLoader: React.FC = () => (
    <LoadingFallback variant="skeleton" />
);

/** Button/inline loader */
export const InlineLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => (
    <LoadingFallback variant="minimal" size={size} />
);
