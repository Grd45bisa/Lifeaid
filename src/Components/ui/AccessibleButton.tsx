import React, { forwardRef } from 'react';
import './styles/AccessibleButton.css';

export interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button content */
    children: React.ReactNode;
    /** Visual variant */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Loading state - disables button and shows spinner */
    isLoading?: boolean;
    /** Icon to display before text */
    leftIcon?: React.ReactNode;
    /** Icon to display after text */
    rightIcon?: React.ReactNode;
    /** For icon-only buttons - provides accessible label */
    'aria-label'?: string;
}

/**
 * Accessible Button Component
 * 
 * Features:
 * - Proper focus styles (visible focus ring)
 * - Loading state with aria-busy
 * - Icon support with proper spacing
 * - Keyboard accessible (Enter/Space)
 * - Disabled state properly conveyed
 * 
 * @example
 * <AccessibleButton variant="primary" onClick={handleClick}>
 *   Click Me
 * </AccessibleButton>
 * 
 * @example
 * // Icon-only button (requires aria-label)
 * <AccessibleButton aria-label="Close dialog" variant="ghost">
 *   <CloseIcon />
 * </AccessibleButton>
 */
const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            className = '',
            type = 'button',
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || isLoading;

        return (
            <button
                ref={ref}
                type={type}
                disabled={isDisabled}
                aria-disabled={isDisabled}
                aria-busy={isLoading}
                className={`
                    accessible-btn
                    accessible-btn--${variant}
                    accessible-btn--${size}
                    ${isLoading ? 'accessible-btn--loading' : ''}
                    ${className}
                `.trim()}
                {...props}
            >
                {isLoading && (
                    <span className="accessible-btn__spinner" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" className="animate-spin">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                            <path
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                        </svg>
                    </span>
                )}
                {leftIcon && !isLoading && (
                    <span className="accessible-btn__icon accessible-btn__icon--left" aria-hidden="true">
                        {leftIcon}
                    </span>
                )}
                <span className={isLoading ? 'accessible-btn__text--hidden' : ''}>
                    {children}
                </span>
                {rightIcon && (
                    <span className="accessible-btn__icon accessible-btn__icon--right" aria-hidden="true">
                        {rightIcon}
                    </span>
                )}
            </button>
        );
    }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
