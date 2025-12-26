import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Product.css';
import Accessories from './Accessories';
import { isUsingDatabaseProducts, fetchFeaturedProduct, type FeaturedProductContent, defaultFeaturedProduct } from '../utils/supabaseClient';

// Language type
type Language = 'id' | 'en';

// Static translations for buy buttons
const buttonTranslations = {
  id: {
    buyNow: 'Beli sekarang',
    buyOnWebsite: 'Lihat Selengkapnya',
    tokopedia: 'Beli di Tokopedia',
    shopee: 'Beli di Shopee'
  },
  en: {
    buyNow: 'Buy now',
    buyOnWebsite: 'See More',
    tokopedia: 'Buy on Tokopedia',
    shopee: 'Buy on Shopee'
  }
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

const Product: React.FC = () => {
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());
  const [showDropdown, setShowDropdown] = useState(false);
  const [content, setContent] = useState<FeaturedProductContent>(defaultFeaturedProduct);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Load content from database if enabled
  useEffect(() => {
    const loadContent = async () => {
      try {
        const useDb = await isUsingDatabaseProducts();
        console.log('[Product] useDb:', useDb);
        if (useDb) {
          const dbContent = await fetchFeaturedProduct();
          console.log('[Product] dbContent:', dbContent);
          setContent(dbContent);
        } else {
          console.log('[Product] Using default content');
        }
      } catch (err) {
        console.error('Error loading featured product:', err);
      }
    };
    loadContent();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Handle button click
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  const handleBuyOnWebsite = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/product/electric-patient-lifter');
  };

  const t = buttonTranslations[currentLang];

  // Get content based on language
  const badge = currentLang === 'id' ? content.badge_id : content.badge_en;
  const title = currentLang === 'id' ? content.title_id : content.title_en;
  const subtitle = currentLang === 'id' ? content.subtitle_id : content.subtitle_en;
  const productTitle = currentLang === 'id' ? content.product_title_id : content.product_title_en;
  const productDesc = currentLang === 'id' ? content.product_desc_id : content.product_desc_en;
  const mainFunctionTitle = currentLang === 'id' ? content.main_function_title_id : content.main_function_title_en;
  const mainFunctionDesc = currentLang === 'id' ? content.main_function_desc_id : content.main_function_desc_en;
  const suitableForTitle = currentLang === 'id' ? content.suitable_for_title_id : content.suitable_for_title_en;
  const suitableForDesc = currentLang === 'id' ? content.suitable_for_desc_id : content.suitable_for_desc_en;
  const productImage = content.image_base64 || '/Product.webp';

  return (
    <>
      <section className="product" id="product">
        <div className="product-header">
          <p className="product-badge">{badge}</p>
          <h2 className="product-title">{title}</h2>
          <p className="product-subtitle">{subtitle}</p>
        </div>

        <div className="product-container">
          <div className="product-image">
            <img
              src={productImage}
              alt={currentLang === 'id'
                ? 'Electric Patient Lifter LifeAid'
                : 'Electric Patient Lifter LifeAid'}
              className="product-image-main"
              loading="lazy"
            />
          </div>

          <div className="product-content">
            <h3 className="product-content-title">{productTitle}</h3>

            <p className="product-text">
              <strong>
                {currentLang === 'id' ? 'Pengangkat Pasien Listrik' : 'Electric Patient Lifter'}
              </strong>{' '}
              {productDesc}
            </p>

            <div className="product-features">
              <div className="feature-item">
                <h4 className="feature-title">{mainFunctionTitle}</h4>
                <p className="feature-text">{mainFunctionDesc}</p>
              </div>

              <div className="feature-item">
                <h4 className="feature-title">{suitableForTitle}</h4>
                <p className="feature-text">{suitableForDesc}</p>
              </div>
            </div>

            <div className="dropdown-wrapper" ref={dropdownRef}>
              <button
                className="product-cta-button"
                onClick={handleButtonClick}
                onTouchEnd={handleButtonClick}
                aria-haspopup="true"
                aria-expanded={showDropdown}
              >
                {t.buyNow}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div className={`dropdown-menu ${showDropdown ? 'show' : ''}`}>
                <a
                  href="/product/electric-patient-lifter"
                  className="dropdown-option"
                  onClick={handleBuyOnWebsite}
                >
                  <div className="option-icon">
                    <svg height="20" viewBox="-1.5 0 19 19" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.252 4.59a.924.924 0 0 1 .921.92v3.602a1.05 1.05 0 0 1-.916 1.017l-8.511.883a.6.6 0 0 1-.145.019.577.577 0 1 0 0 1.154h8.488a.563.563 0 1 1 0 1.126h-.91a1.03 1.03 0 1 1-1.104 0H6.849a1.03 1.03 0 1 1-1.104 0H5.6a1.703 1.703 0 1 1 0-3.406.6.6 0 0 1 .128.014L3.111 3.911H1.39a.563.563 0 1 1 0-1.125h2.09a.56.56 0 0 1 .515.337l.64 1.466h9.617z" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="option-text">{t.buyOnWebsite}</span>
                </a>

                <a
                  href="https://tokopedia.com/lifeaid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dropdown-option"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="option-icon tokopedia-icon">
                    <svg height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="512" cy="512" r="512" style={{ fill: '#42b549' }} />
                      <path d="M620.4 326.4c-5.6-56.4-51.8-100.3-108-100.3-56.1 0-102.3 43.5-108.7 99.6l29.1 2.3c5.2-40.5 38.6-71.8 79.4-71.8s74.6 31.8 78.9 72.8zm94.3-6.5c-32 0-63.9-1.7-95.8 1.1l-29.1 2.6c-25.9 2.3-54.3 8.9-77.6 20.9-24.8-12.9-50.2-19.8-77.9-22l-29.1-2.3c-32-2.6-63.8-.4-95.8-.4h-17.5v418.3h294.4c80.4 0 146.1-67.7 146.1-150.5V319.9zM331.4 496.1c0-48.6 38.3-88.1 85.5-88.1s85.5 39.4 85.5 88.1c0 48.6-38.3 88.1-85.5 88.1-47.3 0-85.5-39.5-85.5-88.1M512 632.9c-12.7-13.9-25.4-27.7-38.1-41.5 8-14.2 23.1-21.3 38.1-21.2 15 0 30.1 7 38.1 21.2-12.7 13.8-25.4 27.6-38.1 41.5m95.1-48.7c-47.2 0-85.5-39.4-85.5-88.1 0-48.6 38.3-88.1 85.5-88.1s85.5 39.4 85.5 88.1c0 48.6-38.3 88.1-85.5 88.1M427.6 441.4c30.5 0 55.2 25.5 55.2 56.8 0 31.4-24.7 56.9-55.2 56.9s-55.2-25.5-55.2-56.9c0-10.5 2.8-20.3 7.6-28.7 3.9 10 13.5 17.1 24.7 17.1 14.7 0 26.6-12.2 26.6-27.4 0-6.8-2.4-13-6.4-17.8zm168.8 0c30.5 0 55.2 25.5 55.2 56.8 0 31.4-24.7 56.9-55.2 56.9s-55.2-25.5-55.2-56.9c0-10.5 2.7-20.3 7.5-28.7 4 10 13.5 17.1 24.7 17.1 14.7 0 26.6-12.2 26.6-27.4 0-6.8-2.4-13-6.4-17.8z" style={{ fill: '#fff' }} />
                    </svg>
                  </div>
                  <span className="option-text">{t.tokopedia}</span>
                </a>

                <a
                  href="https://shopee.co.id/lifeaid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dropdown-option"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="option-icon shopee-icon">
                    <svg height="20" viewBox="0 0 109.59 122.88" xmlns="http://www.w3.org/2000/svg">
                      <path d="M74.98 91.98C76.15 82.36 69.96 76.22 53.6 71c-7.92-2.7-11.66-6.24-11.57-11.12.33-5.4 5.36-9.34 12.04-9.47 4.63.09 9.77 1.22 14.76 4.56.59.37 1.01.32 1.35-.2.46-.74 1.61-2.53 2-3.17.26-.42.31-.96-.35-1.44-.95-.7-3.6-2.13-5.03-2.72-3.88-1.62-8.23-2.64-12.86-2.63-9.77.04-17.47 6.22-18.12 14.47-.42 5.95 2.53 10.79 8.86 14.47 1.34.78 8.6 3.67 11.49 4.57 9.08 2.83 13.8 7.9 12.69 13.81-1.01 5.36-6.65 8.83-14.43 8.93-6.17-.24-11.71-2.75-16.02-6.1-.11-.08-.65-.5-.72-.56-.53-.42-1.11-.39-1.47.15-.26.4-1.92 2.8-2.34 3.43-.39.55-.18.86.23 1.20 1.8 1.5 4.18 3.14 5.81 3.97 4.47 2.28 9.32 3.53 14.48 3.72 3.32.22 7.5-.49 10.63-1.81 5.6-2.39 9.22-7.14 9.95-13.08M54.79 7.18c-10.59 0-19.22 9.98-19.62 22.47h39.25c-.41-12.49-9.04-22.47-19.63-22.47m40.2 115.7h-.41l-80.82-.01c-5.5-.21-9.54-4.66-10.09-10.19l-.05-1-3.61-79.5C0 32.12 0 32.06 0 32a2.35 2.35 0 0 1 2.3-2.35h25.48C28.41 13.15 40.26 0 54.79 0S81.18 13.15 81.8 29.65h25.44c1.3 0 2.35 1.05 2.35 2.35v.12l-3.96 79.81-.04.68c-.47 5.6-5 10.12-10.6 10.27" style={{ fill: '#ee4d2d' }} />
                    </svg>
                  </div>
                  <span className="option-text">{t.shopee}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <Accessories />
      </section>
    </>
  );
};

export default Product;