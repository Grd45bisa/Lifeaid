import React, { useEffect, useRef, useCallback } from 'react';
import './styles/AccessibleModal.css';

interface AccessibleModalProps {
    /** Whether modal is open */
    isOpen: boolean;
    /** Callback when modal should close */
    onClose: () => void;
    /** Modal title (required for accessibility) */
    title: string;
    /** Modal content */
    children: React.ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'full';
    /** Whether to close on overlay click */
    closeOnOverlay?: boolean;
    /** Whether to close on Escape key */
    closeOnEscape?: boolean;
    /** Description for screen readers */
    description?: string;
}

/**
 * Accessible Modal Component
 * 
 * Features:
 * - Focus trap (Tab/Shift+Tab cycles within modal)
 * - Focus restoration (returns focus to trigger on close)
 * - Escape key closes modal
 * - ARIA attributes for screen readers
 * - Prevents body scroll when open
 * 
 * @example
 * <AccessibleModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 * >
 *   <p>Are you sure?</p>
 *   <button onClick={() => setIsOpen(false)}>Close</button>
 * </AccessibleModal>
 */
const AccessibleModal: React.FC<AccessibleModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    closeOnOverlay = true,
    closeOnEscape = true,
    description,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const titleId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`;
    const descId = description ? `modal-desc-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined;

    // Store previous focus and trap focus
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            document.body.style.overflow = 'hidden';

            // Focus first focusable element
            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements && focusableElements.length > 0) {
                (focusableElements[0] as HTMLElement).focus();
            }
        } else {
            document.body.style.overflow = '';
            previousFocusRef.current?.focus();
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnEscape && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, closeOnEscape]);

    // Focus trap
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }, []);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlay && e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="accessible-modal-overlay"
            onClick={handleOverlayClick}
            role="presentation"
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descId}
                className={`accessible-modal accessible-modal--${size}`}
                onKeyDown={handleKeyDown}
            >
                <header className="accessible-modal__header">
                    <h2 id={titleId} className="accessible-modal__title">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="accessible-modal__close"
                        aria-label="Close modal"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {description && (
                    <p id={descId} className="sr-only">
                        {description}
                    </p>
                )}

                <div className="accessible-modal__content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AccessibleModal;
