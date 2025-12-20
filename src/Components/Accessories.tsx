import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Accessories.css';

// Language type
type Language = 'id' | 'en';

// Translations
const translations = {
  id: {
    title: 'Koleksi Aksesori Lift Pasien Elektrik',
    viewDetails: 'Lihat Detail',
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
    products: {
      product1: 'Standard Patient Lift Sling',
      product2: 'Premium Electric Lift Sling',
      product3: 'Electric Patient Lift Battery',
      product4: 'Walking Sling for Electric Lift'
    }
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

const Accessories: React.FC = () => {
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());

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

  const t = translations[currentLang];

  const items = [
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

  return (
    <section className="accessories-section" id="accessories">
      <div className="accessories-header">
        <h2 className="accessories-title">{t.title}</h2>
      </div>

      <div className="accessories-grid">
        {items.map((item, index) => (
          <div
            key={index}
            className="accessories-card"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              navigate(`/product/${item.slug}`);
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="img-wrapper">
              <img
                src={item.img}
                alt={item.title}
                className="accessories-image"
                loading="lazy"
              />
            </div>
            <h3 className="accessories-name">{item.title}</h3>
            <p className="accessories-price">{item.price}</p>
            <button className="accessories-btn">{t.viewDetails}</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Accessories;