import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUsingDatabaseProducts, type PublicProduct } from '../utils/supabaseClient';
import { fetchAccessoriesWithCache, getCachedProducts } from '../utils/productCache';
import './styles/Accessories.css';

// Language type
type Language = 'id' | 'en';

// Item type for display
interface AccessoryItem {
  id: number;
  slug: string;
  img: string;
  title: string;
  price: string;
}

// Translations
const translations = {
  id: {
    title: 'Koleksi Aksesori Lift Pasien Elektrik',
    viewDetails: 'Lihat Detail',
    loading: 'Memuat produk...',
    products: {
      product1: 'Standard Patient Lift Sling',
      product2: 'Premium Electric Lift Sling',
      product3: 'Electric Patient Lift Battery',
      product4: 'Walking Sling for Electric Lift'
    }
  },
  en: {
    title: 'Electric Patient Lift Accessories Collection',
    viewDetails: 'View Details',
    loading: 'Loading products...',
    products: {
      product1: 'Standard Patient Lift Sling',
      product2: 'Premium Electric Lift Sling',
      product3: 'Electric Patient Lift Battery',
      product4: 'Walking Sling for Electric Lift'
    }
  }
};

// Default static items (fallback when database is disabled or fails)
const getDefaultItems = (lang: Language): AccessoryItem[] => {
  const t = translations[lang];
  return [
    {
      id: 1,
      slug: 'standard-patient-lift-sling',
      img: '/Product1.webp',
      title: t.products.product1,
      price: 'Rp 2.200.000,00',
    },
    {
      id: 2,
      slug: 'premium-electric-lift-sling',
      img: '/Product2.webp',
      title: t.products.product2,
      price: 'Rp 3.000.000,00',
    },
    {
      id: 3,
      slug: 'electric-patient-lift-battery',
      img: '/Product3.webp',
      title: t.products.product3,
      price: 'Rp 3.500.000,00',
    },
    {
      id: 4,
      slug: 'walking-sling-for-electric-lift',
      img: '/Product4.webp',
      title: t.products.product4,
      price: 'Rp 2.200.000,00',
    },
  ];
};

// Detect language
const detectLanguage = (): Language => {
  if (typeof window === 'undefined') return 'id';

  const savedLang = localStorage.getItem('preferred-language') as Language;
  if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
    return savedLang;
  }

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('id')) {
    return 'id';
  }

  return 'en';
};

// Format number to Rupiah
const formatToRupiah = (num: number): string => {
  if (!num || num === 0) return 'Rp 0';
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Map database product to AccessoryItem format
const mapDatabaseProduct = (product: PublicProduct, lang: Language): AccessoryItem => {
  // Use formatted price if it already starts with "Rp", otherwise format from numeric
  const displayPrice = product.price && product.price.startsWith('Rp')
    ? product.price
    : formatToRupiah(product.price_numeric);

  return {
    id: product.id,
    slug: product.slug,
    img: product.image_base64 || '/Product1.webp',
    title: lang === 'id' ? product.title_id : product.title_en,
    price: displayPrice,
  };
};

const Accessories: React.FC = () => {
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());
  const [items, setItems] = useState<AccessoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for language changes
  useEffect(() => {
    const checkLanguage = () => {
      const lang = detectLanguage();
      if (lang !== currentLang) {
        setCurrentLang(lang);
      }
    };

    checkLanguage();
    window.addEventListener('storage', checkLanguage);

    return () => {
      window.removeEventListener('storage', checkLanguage);
    };
  }, [currentLang]);

  // Load products with cache support
  useEffect(() => {
    const loadProducts = async () => {
      // Fetch Featured Product ID first
      let excludedId: number | undefined;
      try {
        const { fetchFeaturedProduct } = await import('../utils/supabaseClient');
        const featuredContent = await fetchFeaturedProduct();
        excludedId = featuredContent?.linked_product_id;
        console.log('[Accessories] Excluding Product ID:', excludedId);
      } catch (err) {
        console.warn('Failed to load featured product settings', err);
      }

      // Check cache first
      const cachedProducts = getCachedProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        console.log('[Accessories] Using cached data');
        const accessories = cachedProducts.filter(p => {
          // Filter by category AND exclude linked featured product
          if (excludedId && p.id === excludedId) return false;

          const categoryId = p.category_id.toLowerCase();
          const categoryEn = p.category_en.toLowerCase();
          return categoryId.includes('aksesori') ||
            categoryEn.includes('accessories') ||
            categoryId.includes('baterai') ||
            categoryEn.includes('battery');
        });

        // If filtering results in empty, show all (except excluded)
        let productsToShow = accessories.length > 0 ? accessories : cachedProducts;
        if (excludedId) {
          productsToShow = productsToShow.filter(p => p.id !== excludedId);
        }

        setItems(productsToShow.map(p => mapDatabaseProduct(p, currentLang)));
        setIsLoading(false);
        return;
      }

      // Not cached - show loading and fetch
      setIsLoading(true);
      try {
        const useDatabase = await isUsingDatabaseProducts();
        if (useDatabase) {
          const { products: dbProducts } = await fetchAccessoriesWithCache();

          if (dbProducts.length > 0) {
            const accessories = dbProducts.filter(p => {
              if (excludedId && p.id === excludedId) return false;

              const categoryId = p.category_id.toLowerCase();
              const categoryEn = p.category_en.toLowerCase();
              return categoryId.includes('aksesori') ||
                categoryEn.includes('accessories') ||
                categoryId.includes('baterai') ||
                categoryEn.includes('battery');
            });

            let productsToShow = accessories.length > 0 ? accessories : dbProducts;
            if (excludedId) {
              productsToShow = productsToShow.filter(p => p.id !== excludedId);
            }

            setItems(productsToShow.map(p => mapDatabaseProduct(p, currentLang)));
          } else {
            setItems(getDefaultItems(currentLang));
          }
        } else {
          setItems(getDefaultItems(currentLang));
        }
      } catch {
        console.error('[Accessories] Error loading accessories');
        setItems(getDefaultItems(currentLang));
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [currentLang]);

  const t = translations[currentLang];

  return (
    <section className="accessories-section" id="accessories">
      <div className="accessories-header">
        <h2 className="accessories-title">{t.title}</h2>
      </div>

      {isLoading ? (
        <div className="accessories-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="accessories-card skeleton-card">
              <div className="img-wrapper skeleton-wrapper">
                <div className="skeleton-image" />
              </div>
              <div className="skeleton-content">
                <div className="skeleton-title" />
                <div className="skeleton-price" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="accessories-grid">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="accessories-card"
              role="button"
              tabIndex={0}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(`/product/${item.slug}`);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate(`/product/${item.slug}`);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="img-wrapper">
                <img
                  src={item.img}
                  alt={item.title}
                  className="accessories-image"
                  loading="lazy"
                  width={250}
                  height={250}
                />
              </div>
              <h3 className="accessories-name">{item.title}</h3>
              <p className="accessories-price">{item.price}</p>
              <button className="accessories-btn">{t.viewDetails}</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Accessories;