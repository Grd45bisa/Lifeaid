import React, { useState, useEffect } from 'react';
import './styles/Hero.css';

// Language type
type Language = 'id' | 'en';

// Translations
const translations = {
  id: {
    title: 'Solusi Mobilitas Terkemuka untuk Orang Tercinta Anda',
    description: 'Alat bantu mobilitas berteknologi tinggi untuk lansia dan pemulihan stroke. Memberikan keamanan, kenyamanan, dan martabat dalam setiap gerakan dengan dukungan ahli 24/7.',
    shopAll: 'Belanja semua',
    freeConsultation: 'Konsultasi Gratis',
    stats: {
      support: 'Layanan Dukungan Terpercaya',
      experience: 'Tahun Pengalaman',
      cities: 'Jangkauan Kota',
      satisfaction: 'Kepuasan Pelanggan'
    }
  },
  en: {
    title: 'Leading Mobility Solutions for Your Loved Ones',
    description: 'High-tech mobility aids for elderly and stroke recovery. Providing safety, comfort, and dignity in every movement with 24/7 expert support.',
    shopAll: 'Shop All',
    freeConsultation: 'Free Consultation',
    stats: {
      support: 'Trusted Support Service',
      experience: 'Years of Experience',
      cities: 'City Coverage',
      satisfaction: 'Customer Satisfaction'
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

const Hero: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());

  // Listen for language changes
  useEffect(() => {
    const checkLanguage = () => {
      const lang = detectLanguage();
      if (lang !== currentLang) {
        setCurrentLang(lang);
      }
    };

    // Check on mount and when localStorage changes
    checkLanguage();
    window.addEventListener('storage', checkLanguage);

    return () => {
      window.removeEventListener('storage', checkLanguage);
    };
  }, [currentLang]);

  const t = translations[currentLang];

  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const offsetTop = (element as HTMLElement).offsetTop - 80; // Adjust for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="hero" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            {t.title}
          </h1>
          <p className="hero-description">
            {t.description}
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => scrollToSection('#product')}>{t.shopAll}</button>
            <button className="btn-secondary" onClick={() => scrollToSection('#contact')}>{t.freeConsultation}</button>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/Hero.webp"
            alt={currentLang === 'id'
              ? 'Electric Patient Lift - Lifeaid'
              : 'Electric Patient Lift - Lifeaid'}
            className="hero-image-main"
            loading="eager"
          />
        </div>
      </div>

      <div className="hero-stats">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">{t.stats.support}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5</span>
            <span className="stat-label">{t.stats.experience}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50</span>
            <span className="stat-label">{t.stats.cities}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">{t.stats.satisfaction}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;