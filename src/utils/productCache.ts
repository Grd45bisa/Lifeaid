/**
 * Product Cache Utility
 * Provides caching and prefetching mechanism for product data
 * to avoid showing loading state when data is already available
 */

import { isUsingDatabaseProducts, fetchPublicProducts, fetchProductBySlug, type PublicProduct } from './supabaseClient';
import { getProductBySlug as getStaticProduct, products as staticProducts, type Product as StaticProduct } from '../data/productData';

// Cache storage
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// In-memory cache
const productListCache: { [key: string]: CacheEntry<PublicProduct[]> } = {};
const productDetailCache: { [key: string]: CacheEntry<PublicProduct | StaticProduct | null> } = {};

// Prefetch status
let isPrefetching = false;
let prefetchPromise: Promise<void> | null = null;

/**
 * Check if cache entry is still valid
 */
const isCacheValid = <T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> => {
    if (!entry) return false;
    return (Date.now() - entry.timestamp) < CACHE_DURATION;
};

/**
 * Get cached accessories/products list
 * Returns null if not cached or expired
 */
export const getCachedProducts = (): PublicProduct[] | null => {
    const entry = productListCache['all'];
    if (isCacheValid(entry)) {
        console.log('[ProductCache] Using cached product list');
        return entry.data;
    }
    return null;
};

/**
 * Set products list cache
 */
export const setCachedProducts = (products: PublicProduct[]): void => {
    productListCache['all'] = {
        data: products,
        timestamp: Date.now()
    };
    console.log('[ProductCache] Cached product list:', products.length, 'items');
};

/**
 * Get cached product detail
 * Returns null if not cached or expired
 */
export const getCachedProductDetail = (slug: string): PublicProduct | StaticProduct | null => {
    const entry = productDetailCache[slug];
    if (isCacheValid(entry)) {
        console.log('[ProductCache] Using cached product detail for:', slug);
        return entry.data;
    }
    return null;
};

/**
 * Set product detail cache
 */
export const setCachedProductDetail = (slug: string, product: PublicProduct | StaticProduct | null): void => {
    productDetailCache[slug] = {
        data: product,
        timestamp: Date.now()
    };
    console.log('[ProductCache] Cached product detail for:', slug);
};

/**
 * Prefetch all products and cache them
 * This should be called on app init or when hovering over product links
 */
export const prefetchProducts = async (): Promise<void> => {
    // Avoid duplicate prefetch calls
    if (isPrefetching && prefetchPromise) {
        return prefetchPromise;
    }

    // Skip if already cached
    if (getCachedProducts()) {
        return Promise.resolve();
    }

    isPrefetching = true;
    console.log('[ProductCache] Starting prefetch...');

    prefetchPromise = (async () => {
        try {
            const useDatabase = await isUsingDatabaseProducts();

            if (useDatabase) {
                const dbProducts = await fetchPublicProducts();
                if (dbProducts.length > 0) {
                    setCachedProducts(dbProducts);
                    // Also cache individual products
                    dbProducts.forEach(product => {
                        setCachedProductDetail(product.slug, product);
                    });
                }
            } else {
                // Cache static products
                staticProducts.forEach((product: StaticProduct) => {
                    setCachedProductDetail(product.slug, product);
                });
            }
        } catch (error) {
            console.error('[ProductCache] Prefetch error:', error);
        } finally {
            isPrefetching = false;
            prefetchPromise = null;
        }
    })();

    return prefetchPromise;
};

/**
 * Fetch product detail with cache support
 * Returns cached data immediately if available, otherwise fetches fresh data
 */
export const fetchProductWithCache = async (slug: string): Promise<{
    product: PublicProduct | StaticProduct | null;
    fromCache: boolean;
}> => {
    // Check cache first
    const cached = getCachedProductDetail(slug);
    if (cached) {
        return { product: cached, fromCache: true };
    }

    // Fetch fresh data
    try {
        const useDatabase = await isUsingDatabaseProducts();

        if (useDatabase) {
            const dbProduct = await fetchProductBySlug(slug);
            if (dbProduct) {
                setCachedProductDetail(slug, dbProduct);
                return { product: dbProduct, fromCache: false };
            }
        }

        // Fallback to static data
        const staticProduct = getStaticProduct(slug);
        if (staticProduct) {
            setCachedProductDetail(slug, staticProduct);
            return { product: staticProduct, fromCache: false };
        }

        return { product: null, fromCache: false };
    } catch (error) {
        console.error('[ProductCache] Fetch error:', error);
        // Try static fallback on error
        const staticProduct = getStaticProduct(slug);
        return { product: staticProduct || null, fromCache: false };
    }
};

/**
 * Fetch accessories with cache support
 */
export const fetchAccessoriesWithCache = async (): Promise<{
    products: PublicProduct[];
    fromCache: boolean;
}> => {
    // Check cache first
    const cached = getCachedProducts();
    if (cached) {
        return { products: cached, fromCache: true };
    }

    // Fetch fresh data
    try {
        const useDatabase = await isUsingDatabaseProducts();

        if (useDatabase) {
            const dbProducts = await fetchPublicProducts();
            if (dbProducts.length > 0) {
                setCachedProducts(dbProducts);
                // Also cache individual products
                dbProducts.forEach(product => {
                    setCachedProductDetail(product.slug, product);
                });
                return { products: dbProducts, fromCache: false };
            }
        }

        return { products: [], fromCache: false };
    } catch (error) {
        console.error('[ProductCache] Fetch accessories error:', error);
        return { products: [], fromCache: false };
    }
};

/**
 * Clear all cache (useful when data is updated)
 */
export const clearProductCache = (): void => {
    Object.keys(productListCache).forEach(key => delete productListCache[key]);
    Object.keys(productDetailCache).forEach(key => delete productDetailCache[key]);
    console.log('[ProductCache] Cache cleared');
};

/**
 * Check if prefetch is in progress
 */
export const isPrefetchInProgress = (): boolean => isPrefetching;
