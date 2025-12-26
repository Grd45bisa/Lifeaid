import React, { useState, useRef, useEffect } from 'react';
import '../styles/OptimizedImage.css';

interface ImageSource {
    src: string;
    type: string;
}

interface OptimizedImageProps {
    // Required
    src: string;
    alt: string;

    // Optional sources for different formats (WebP, AVIF)
    sources?: ImageSource[];

    // Responsive images
    srcSet?: string;
    sizes?: string;

    // Dimensions (important for preventing layout shift)
    width?: number | string;
    height?: number | string;
    aspectRatio?: string; // e.g., "16/9", "4/3", "1/1"

    // Loading behavior
    priority?: boolean; // For above-the-fold images (LCP)
    loading?: 'lazy' | 'eager';
    fetchPriority?: 'high' | 'low' | 'auto';

    // Styling
    className?: string;
    style?: React.CSSProperties;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;

    // Blur placeholder
    placeholder?: string; // Base64 blur image or color
    blurDataURL?: string;

    // Callbacks
    onLoad?: () => void;
    onError?: () => void;
}

/**
 * OptimizedImage Component
 * 
 * A performance-optimized image component with:
 * - Lazy loading with Intersection Observer
 * - Blur placeholder effect
 * - Aspect ratio preservation (prevents CLS)
 * - WebP/AVIF format support with fallback
 * - Responsive srcSet support
 * - Priority loading for LCP images
 * 
 * @example
 * // Hero image (above the fold)
 * <OptimizedImage
 *   src="/Hero.webp"
 *   alt="Hero"
 *   priority
 *   width={1200}
 *   height={600}
 * />
 * 
 * @example
 * // Gallery image (lazy loaded)
 * <OptimizedImage
 *   src="/product.webp"
 *   alt="Product"
 *   aspectRatio="4/3"
 *   placeholder="#f0f0f0"
 * />
 * 
 * @example
 * // With multiple formats
 * <OptimizedImage
 *   src="/image.jpg"
 *   sources={[
 *     { src: '/image.avif', type: 'image/avif' },
 *     { src: '/image.webp', type: 'image/webp' },
 *   ]}
 *   alt="Optimized"
 * />
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    sources = [],
    srcSet,
    sizes,
    width,
    height,
    aspectRatio,
    priority = false,
    loading,
    fetchPriority,
    className = '',
    style = {},
    objectFit = 'cover',
    objectPosition = 'center',
    placeholder,
    blurDataURL,
    onLoad,
    onError,
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || isInView) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before entering viewport
                threshold: 0.01,
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [priority, isInView]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        onError?.();
    };

    // Determine loading attribute
    const loadingAttr = loading || (priority ? 'eager' : 'lazy');
    const fetchPriorityAttr = fetchPriority || (priority ? 'high' : 'auto');

    // Container styles
    const containerStyle: React.CSSProperties = {
        ...style,
        position: 'relative',
        overflow: 'hidden',
        ...(aspectRatio && { aspectRatio }),
        ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
        ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    };

    // Placeholder styles
    const placeholderStyle: React.CSSProperties = {
        backgroundColor: placeholder || '#f0f0f0',
        ...(blurDataURL && {
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
        }),
    };

    // Image styles
    const imgStyle: React.CSSProperties = {
        objectFit,
        objectPosition,
    };

    if (hasError) {
        return (
            <div
                ref={containerRef}
                className={`optimized-image-container optimized-image-error ${className}`}
                style={containerStyle}
                role="img"
                aria-label={alt}
            >
                <div className="optimized-image-error-content">
                    <span>⚠️</span>
                    <span>Image failed to load</span>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`optimized-image-container ${className}`}
            style={containerStyle}
        >
            {/* Placeholder */}
            {!isLoaded && (
                <div
                    className="optimized-image-placeholder"
                    style={placeholderStyle}
                    aria-hidden="true"
                />
            )}

            {/* Picture element for format fallbacks */}
            {isInView && (
                <picture>
                    {sources.map((source, index) => (
                        <source key={index} srcSet={source.src} type={source.type} />
                    ))}
                    <img
                        ref={imgRef}
                        src={src}
                        alt={alt}
                        srcSet={srcSet}
                        sizes={sizes}
                        width={typeof width === 'number' ? width : undefined}
                        height={typeof height === 'number' ? height : undefined}
                        loading={loadingAttr}
                        fetchPriority={fetchPriorityAttr}
                        decoding={priority ? 'sync' : 'async'}
                        onLoad={handleLoad}
                        onError={handleError}
                        className={`optimized-image ${isLoaded ? 'optimized-image-loaded' : ''}`}
                        style={imgStyle}
                    />
                </picture>
            )}
        </div>
    );
};

export default OptimizedImage;

// ============================================
// Helper: Generate srcSet for responsive images
// ============================================
export const generateSrcSet = (
    basePath: string,
    widths: number[] = [320, 640, 960, 1280, 1920],
    format: string = 'webp'
): string => {
    const ext = basePath.split('.').pop() || format;
    const name = basePath.replace(/\.[^/.]+$/, '');

    return widths
        .map((w) => `${name}-${w}w.${format || ext} ${w}w`)
        .join(', ');
};

// ============================================
// Helper: Generate blur data URL from color
// ============================================
export const generateBlurPlaceholder = (color: string = '#e0e0e0'): string => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect fill="${color}" width="8" height="8"/></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};
