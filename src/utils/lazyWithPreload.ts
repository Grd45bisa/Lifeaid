import { lazy, type ComponentType } from 'react';

type LazyComponent<T extends ComponentType<unknown>> = ReturnType<typeof lazy<T>> & {
    preload: () => Promise<{ default: T }>;
};

/**
 * lazyWithPreload - Enhanced React.lazy with preload capability
 * 
 * Returns a lazy component that can be preloaded before being rendered.
 * Useful for preloading components on hover or when likely to be needed.
 * 
 * @example
 * // Define lazy component with preload
 * const AdminPanel = lazyWithPreload(() => import('./AdminPanel'));
 * 
 * // Use in routes
 * <Route path="/admin" element={<AdminPanel />} />
 * 
 * // Preload on link hover
 * <Link 
 *   to="/admin" 
 *   onMouseEnter={() => AdminPanel.preload()}
 * >
 *   Admin
 * </Link>
 * 
 * @param importFn - Dynamic import function
 * @returns Lazy component with preload method
 */
export function lazyWithPreload<T extends ComponentType<unknown>>(
    importFn: () => Promise<{ default: T }>
): LazyComponent<T> {
    const lazyComponent = lazy(importFn) as LazyComponent<T>;
    lazyComponent.preload = importFn;
    return lazyComponent;
}

/**
 * preloadComponent - Preload a dynamic import
 * 
 * @example
 * // Preload when user hovers over a button
 * onMouseEnter={() => preloadComponent(() => import('./HeavyComponent'))}
 */
export function preloadComponent(
    importFn: () => Promise<unknown>
): void {
    // Fire and forget - we just want to cache the module
    importFn().catch(() => {
        // Silently ignore preload failures
    });
}

/**
 * conditionalImport - Import component based on condition
 * 
 * @example
 * // Load admin panel only for admin users
 * const AdminPanel = await conditionalImport(
 *   () => import('./AdminPanel'),
 *   isAdmin,
 *   () => import('./AccessDenied')
 * );
 * 
 * @param primaryImport - Primary component to import
 * @param condition - Condition to check
 * @param fallbackImport - Fallback component if condition is false
 */
export async function conditionalImport<T>(
    primaryImport: () => Promise<{ default: T }>,
    condition: boolean,
    fallbackImport?: () => Promise<{ default: T }>
): Promise<{ default: T }> {
    if (condition) {
        return primaryImport();
    }
    if (fallbackImport) {
        return fallbackImport();
    }
    throw new Error('Condition not met and no fallback provided');
}

/**
 * prefetchComponents - Prefetch multiple components
 * 
 * @example
 * // Prefetch likely components after initial render
 * useEffect(() => {
 *   prefetchComponents([
 *     () => import('./ProductPage'),
 *     () => import('./CartPage'),
 *   ]);
 * }, []);
 */
export function prefetchComponents(
    importFns: Array<() => Promise<unknown>>
): void {
    // Use requestIdleCallback for non-blocking prefetch
    const prefetch = () => {
        importFns.forEach((fn) => {
            fn().catch(() => {
                // Silently ignore prefetch failures
            });
        });
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(prefetch, { timeout: 2000 });
    } else {
        // Fallback for Safari
        setTimeout(prefetch, 1000);
    }
}

/**
 * createLazyRoute - Create array of lazy route config
 * 
 * @example
 * const routes = createLazyRoute([
 *   { path: '/', component: () => import('./Home') },
 *   { path: '/about', component: () => import('./About') },
 * ]);
 */
export function createLazyRoute<T extends ComponentType<unknown>>(
    routes: Array<{
        path: string;
        component: () => Promise<{ default: T }>;
    }>
): Array<{
    path: string;
    Component: LazyComponent<T>;
}> {
    return routes.map(({ path, component }) => ({
        path,
        Component: lazyWithPreload(component),
    }));
}

// ============================================
// React Router Integration Helpers
// ============================================

/**
 * PreloadLink - Link component that preloads on hover
 * 
 * Usage with React Router:
 * @example
 * import { Link } from 'react-router-dom';
 * 
 * const AdminPanel = lazyWithPreload(() => import('./AdminPanel'));
 * 
 * function NavLink() {
 *   return (
 *     <Link 
 *       to="/admin"
 *       onMouseEnter={() => AdminPanel.preload()}
 *       onFocus={() => AdminPanel.preload()}
 *     >
 *       Admin Panel
 *     </Link>
 *   );
 * }
 */

// Export type for external usage
export type { LazyComponent };
