import React from 'react';
import './styles/SkipLink.css';

interface SkipLinkProps {
    /** Target element ID to skip to */
    targetId: string;
    /** Link text */
    children?: React.ReactNode;
}

/**
 * Skip Link Component
 * 
 * Allows keyboard users to skip navigation and jump directly to main content.
 * This is a WCAG 2.1 Level A requirement.
 * 
 * Implementation:
 * 1. Add this component at the very start of your App
 * 2. Add id="main-content" to your main content container
 * 
 * @example
 * // In App.tsx
 * function App() {
 *   return (
 *     <>
 *       <SkipLink targetId="main-content" />
 *       <Navbar />
 *       <main id="main-content">
 *         ...
 *       </main>
 *     </>
 *   );
 * }
 */
const SkipLink: React.FC<SkipLinkProps> = ({
    targetId,
    children = 'Skip to main content',
}) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            target.focus();
            target.scrollIntoView();
        }
    };

    return (
        <a
            href={`#${targetId}`}
            className="skip-link"
            onClick={handleClick}
        >
            {children}
        </a>
    );
};

export default SkipLink;
