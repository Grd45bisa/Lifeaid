import React, { useState, useEffect } from 'react';
import './styles/Productdetail.css';

// Language type
type Language = 'id' | 'en';

// Translations
const translations = {
  id: {
    title: 'Detail Produk Electric Patient Lifter HY101-01A',
    description: 'Alat Pengangkat Pasien Listrik dirancang khusus untuk memindahkan pasien dengan mobilitas terbatas secara aman dan nyaman. Dilengkapi dengan motor listrik yang kuat dan sistem kontrol yang mudah digunakan, alat ini sangat cocok untuk perawatan di rumah maupun fasilitas kesehatan.',
    keyBenefitsTitle: 'Manfaat Utama:',
    benefits: [
      'Mengurangi risiko cedera pada pengasuh dan pasien',
      'Memudahkan proses pemindahan pasien sehari-hari',
      'Meningkatkan kenyamanan dan martabat pasien',
      'Hemat tenaga dengan sistem elektrik otomatis',
      'Dapat digunakan untuk berbagai kebutuhan transfer'
    ]
  },
  en: {
    title: 'Electric Patient Lifter HY101-01A Product Details',
    description: 'Electric Patient Lifter is specially designed to move patients with limited mobility safely and comfortably. Equipped with a powerful electric motor and easy-to-use control system, this device is perfect for home care and healthcare facilities.',
    keyBenefitsTitle: 'Key Benefits:',
    benefits: [
      'Reduces risk of injury to caregivers and patients',
      'Facilitates daily patient transfer process',
      'Improves patient comfort and dignity',
      'Save energy with automatic electric system',
      'Can be used for various transfer needs'
    ]
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

const ProductDetail: React.FC = () => {
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

  return (
    <section className="product-detail" id="product-detail">
      <div className="product-detail-container">
        <div className="product-detail-image">
          <img
            src="/Productdetail.webp"
            alt={currentLang === 'id'
              ? 'Electric Patient Lifter HY101-01A Detail'
              : 'Electric Patient Lifter HY101-01A Detail'}
            className="product-detail-image-main"
            loading="lazy"
          />
        </div>

        <div className="product-detail-content">
          <h2 className="product-detail-title">{t.title}</h2>

          <p className="product-detail-description">
            <strong>
              {currentLang === 'id' ? 'Alat Pengangkat Pasien Listrik' : 'Electric Patient Lifter'}
            </strong>{' '}
            {t.description}
          </p>

          <div className="product-detail-features-box">
            <h3 className="features-box-title">{t.keyBenefitsTitle}</h3>
            <ul className="features-list">
              {t.benefits.map((benefit, index) => (
                <li key={index} className="feature-list-item">
                  <span className="feature-bullet">✓</span>
                  <span className="feature-text">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;