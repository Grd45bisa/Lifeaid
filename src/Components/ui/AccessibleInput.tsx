import React, { forwardRef, useId } from 'react';
import './styles/AccessibleInput.css';

export interface AccessibleInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Label text (required for accessibility) */
    label: string;
    /** Error message to display */
    error?: string;
    /** Helper text below input */
    helperText?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Hide label visually but keep for screen readers */
    hideLabel?: boolean;
    /** Left addon (icon or text) */
    leftAddon?: React.ReactNode;
    /** Right addon (icon or text) */
    rightAddon?: React.ReactNode;
}

/**
 * Accessible Input Component
 * 
 * Features:
 * - Auto-generated IDs for label association
 * - Error state with aria-invalid and aria-describedby
 * - Helper text support
 * - Visible focus styles
 * - Required indicator
 * 
 * @example
 * <AccessibleInput
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   required
 * />
 * 
 * @example
 * <AccessibleInput
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 * />
 */
const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
    (
        {
            label,
            error,
            helperText,
            size = 'md',
            hideLabel = false,
            leftAddon,
            rightAddon,
            required,
            disabled,
            className = '',
            id: propId,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const id = propId || generatedId;
        const errorId = `${id}-error`;
        const helperId = `${id}-helper`;
        const hasError = Boolean(error);

        // Build aria-describedby
        const describedBy = [
            hasError && errorId,
            helperText && !hasError && helperId,
        ]
            .filter(Boolean)
            .join(' ') || undefined;

        return (
            <div className={`accessible-input-wrapper ${className}`}>
                <label
                    htmlFor={id}
                    className={`accessible-input__label ${hideLabel ? 'sr-only' : ''}`}
                >
                    {label}
                    {required && (
                        <span className="accessible-input__required" aria-hidden="true">
                            *
                        </span>
                    )}
                </label>

                <div className={`accessible-input__container accessible-input--${size}`}>
                    {leftAddon && (
                        <span className="accessible-input__addon accessible-input__addon--left">
                            {leftAddon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={id}
                        required={required}
                        disabled={disabled}
                        aria-invalid={hasError}
                        aria-describedby={describedBy}
                        aria-required={required}
                        className={`
                            accessible-input
                            ${hasError ? 'accessible-input--error' : ''}
                            ${leftAddon ? 'accessible-input--has-left' : ''}
                            ${rightAddon ? 'accessible-input--has-right' : ''}
                        `.trim()}
                        {...props}
                    />

                    {rightAddon && (
                        <span className="accessible-input__addon accessible-input__addon--right">
                            {rightAddon}
                        </span>
                    )}
                </div>

                {hasError && (
                    <p id={errorId} className="accessible-input__error" role="alert">
                        {error}
                    </p>
                )}

                {helperText && !hasError && (
                    <p id={helperId} className="accessible-input__helper">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

AccessibleInput.displayName = 'AccessibleInput';

export default AccessibleInput;
