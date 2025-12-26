import { Helmet } from 'react-helmet-async';

interface SEOProps {
    /** Page title */
    title?: string;
    /** Page description (max 160 chars recommended) */
    description?: string;
    /** Canonical URL */
    canonical?: string;
    /** Open Graph image URL */
    image?: string;
    /** Page type: website, article, product */
    type?: 'website' | 'article' | 'product';
    /** Article publish date (ISO format) */
    publishedTime?: string;
    /** Article author */
    author?: string;
    /** Product price (for product type) */
    price?: string;
    /** Product currency */
    currency?: string;
    /** Disable indexing */
    noindex?: boolean;
    /** JSON-LD structured data */
    structuredData?: object;
}

const SITE_NAME = 'LifeAid';
const SITE_URL = 'https://lifeaidstore.com';
const DEFAULT_DESCRIPTION = 'LifeAid menyediakan alat bantu angkat pasien elektrik (patient lifter) berkualitas tinggi untuk perawatan di rumah dan rumah sakit.';
const DEFAULT_IMAGE = `${SITE_URL}/Hero.webp`;

/**
 * SEO Component - Comprehensive meta tag management
 * 
 * Features:
 * - Dynamic title and description
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 * - Canonical URLs
 * - JSON-LD structured data
 * 
 * @example
 * <SEO
 *   title="Electric Patient Lifter"
 *   description="Professional patient lifting equipment"
 *   type="product"
 *   price="15000000"
 *   currency="IDR"
 * />
 */
const SEO: React.FC<SEOProps> = ({
    title,
    description = DEFAULT_DESCRIPTION,
    canonical,
    image = DEFAULT_IMAGE,
    type = 'website',
    publishedTime,
    author,
    price,
    currency = 'IDR',
    noindex = false,
    structuredData,
}) => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : SITE_URL);

    // Generate Product structured data
    const getProductStructuredData = () => ({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: title,
        description,
        image,
        brand: {
            '@type': 'Brand',
            name: SITE_NAME,
        },
        offers: price ? {
            '@type': 'Offer',
            price,
            priceCurrency: currency,
            availability: 'https://schema.org/InStock',
        } : undefined,
    });

    // Generate Organization structured data
    const organizationData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/Logo-trans.webp`,
        description: DEFAULT_DESCRIPTION,
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+62-812-1975-1605',
            contactType: 'customer service',
            availableLanguage: ['Indonesian', 'English'],
        },
        sameAs: [
            'https://www.instagram.com/lifeaid.id',
            'https://www.facebook.com/lifeaid.id',
            'https://tokopedia.com/lifeaid',
            'https://shopee.co.id/lifeaid',
        ],
    };

    // Determine which structured data to use
    const jsonLd = structuredData || (type === 'product' && price ? getProductStructuredData() : organizationData);

    return (
        <Helmet>
            {/* Basic Meta */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="id_ID" />
            <meta property="og:locale:alternate" content="en_US" />

            {/* Article-specific */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {type === 'article' && author && (
                <meta property="article:author" content={author} />
            )}

            {/* Product-specific */}
            {type === 'product' && price && (
                <>
                    <meta property="product:price:amount" content={price} />
                    <meta property="product:price:currency" content={currency} />
                </>
            )}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(jsonLd)}
            </script>
        </Helmet>
    );
};

export default SEO;
