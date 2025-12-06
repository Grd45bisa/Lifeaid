import React, { useState, useEffect } from 'react';
import './styles/WhyChooseUs.css';

// Language type
type Language = 'id' | 'en';

// Translations
const translations = {
  id: {
    badge: 'MENGAPA MEMILIH KAMI',
    title: 'Kenapa Harus Pilih LifeAid?',
    subtitle: 'Kami tidak hanya menjual produk, tapi memberikan solusi lengkap untuk kebutuhan perawatan di rumah dengan komitmen penuh terhadap kualitas dan kepuasan pelanggan.',
    reasons: [
      {
        title: 'Teknologi Terkemuka',
        description: 'Dilengkapi motor MOTEK 24V yang senyap, remote pintar, dan beberapa lapisan pengaman. Dirancang untuk pengoperasian yang mudah dan aman.'
      },
      {
        title: 'Pengiriman Bebas Repot',
        description: 'Kami akan mengurus pengirimannya untuk Anda! Nikmati pengiriman gratis dengan asuransi penuh ke seluruh Indonesia. Cukup pesan dan kami akan mengurus sisanya.'
      },
      {
        title: 'Konsultasi Ahli 24/7',
        description: 'Tim fisioterapis dan terapis okupasi kami siap memberikan konsultasi pribadi untuk memilih produk yang tepat untuk kondisi spesifik pasien.'
      },
      {
        title: 'Garansi dan Layanan Purnajual',
        description: 'Termasuk garansi komprehensif 3 bulan. Suku cadang selalu tersedia, dan tim layanan pelanggan kami siap membantu Anda kapan pun dibutuhkan.'
      }
    ]
  },
  en: {
    badge: 'WHY CHOOSE US',
    title: 'Why Choose LifeAid?',
    subtitle: 'We don\'t just sell products, but provide complete solutions for home care needs with full commitment to quality and customer satisfaction.',
    reasons: [
      {
        title: 'Advanced Technology',
        description: 'Equipped with quiet MOTEK 24V motor, smart remote, and multiple safety layers designed for easy and safe operation.'
      },
      {
        title: 'Hassle-Free Shipping',
        description: 'We handle shipping for you! Enjoy free shipping with full insurance across Indonesia. Just order and we\'ll take care of the rest.'
      },
      {
        title: '24/7 Expert Consultation',
        description: 'Our physiotherapists and occupational therapists provide personalized consultation to choose the right product for your specific condition.'
      },
      {
        title: 'Warranty & After-Sales Service',
        description: 'Includes comprehensive 3-month warranty. Spare parts always available, and our customer service team is ready to help anytime.'
      }
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

const WhyChooseUs: React.FC = () => {
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

  // Icons for reasons
  const reasonIcons = [
    // Icon1
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>,
    // Icon2
    <svg fill="currentColor" viewBox="0 0 24 24" id="delivery-truck-left" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" className="icon line-color" transform="matrix(-1, 0, 0, 1, 0, 0)">
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                      <g id="SVGRepo_iconCarrier">
                        <path id="primary" d="M14.83,17H11V6a1,1,0,0,1,1-1h7" style={{fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2}}></path>
                        <path id="primary-2" data-name="primary" d="M21,13v3a1,1,0,0,1-1,1h-.87" style={{fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2}}></path>
                        <path id="primary-3" data-name="primary" d="M4.89,17H4a1,1,0,0,1-1-1V11.78a1,1,0,0,1,.76-1L5,10.5l.79-2.77a1,1,0,0,1,1-.73H11V17H9.13" style={{fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2}}></path>
                        <path id="secondary" d="M15,17a2,2,0,1,0,2-2A2,2,0,0,0,15,17ZM5,17a2,2,0,1,0,2-2A2,2,0,0,0,5,17ZM15,9h6" style={{fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2}}></path>
                      </g>
                    </svg>,
    // Icon3
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
  <path d="M1 159.469c1.33-4.27 2.933-8.002 3.945-11.887 4.722-18.113 13.018-34.141 25.81-48.022 10.45-11.34 22.786-19.64 37.344-23.917 11.422-3.357 23.393-4.653 35.237-.85 11.632 3.734 16.666 13.15 18.452 23.899 2.508 15.102 3.37 30.47 5.27 45.684 1.748 14.014 4.098 27.953 5.883 41.963 1.777 13.954-9.248 28.1-24.245 31.661-3.901.926-7.81 1.874-11.606 3.142-.735.246-1.61 2.265-1.319 3.066 6.656 18.36 12.835 36.928 20.395 54.914 11.12 26.46 25.46 51.278 41.901 74.8 8.179 11.701 17.086 22.893 25.409 33.977 7.192-5.39 13.3-11.216 20.47-15.053 10.971-5.87 22.138-3.62 31.627 4.315a5317 5317 0 0 1 59.463 50.462c7.59 6.539 14.71 13.481 16.503 24.247 1.16 6.971-.08 13.205-3.556 19.1-13.077 22.182-32.88 34-57.982 38.093-27.245 4.441-52.424-1.55-76.054-14.743-15.655-8.74-29.172-20.26-40.529-34.302-6.698-8.282-14.511-15.691-20.894-24.19-13.492-17.97-27.175-35.883-39.266-54.788-10.713-16.75-20.188-34.426-28.721-52.4-8.779-18.49-16.514-37.569-23.306-56.882-6.586-18.73-11.473-38.062-16.924-57.182-1.234-4.328-1.717-8.871-2.926-13.446C1 187.312 1 173.625 1 159.47m512 73.061a367 367 0 0 1-2.002 10.638c-2.046 10.108-3.509 20.38-6.286 30.284-5.58 19.9-14.352 38.51-25.813 55.685-11.155 16.717-24.692 31.37-39.937 44.58-14.56 12.614-30.55 22.838-48.008 30.669-11.063 4.962-22.656 8.746-34.776 13.35-10.383-22.895-32.389-33.46-51.461-49.966 43.251-1.654 79.324-17.018 108.606-46.754 29.52-29.978 45.65-66.807 44.04-108.526-2.794-72.369-39.547-123.772-108.41-145.67-67.922-21.598-125.329.913-170.807 56.099-.4-3.637-1.08-7.02-1.095-10.405-.093-19.44-3.363-38.042-14.683-55.84 10.575-7.59 20.735-15.684 31.669-22.546 18.166-11.402 37.817-19.648 58.784-24.506 13.33-3.088 26.697-5.913 40.512-5.65 7.832.15 15.67-.027 23.504.039 14.075.117 27.723 3.045 41.254 6.561 15.76 4.097 30.993 9.804 44.942 18.157 11.873 7.111 23.412 14.933 34.372 23.383 15.998 12.335 29.172 27.535 40.41 44.289 13.058 19.469 23.067 40.491 28.866 63.222 2.752 10.79 3.736 22.031 5.92 33.222.399 13.175.399 26.196.399 39.685"></path>
  <path d="M205.015 262.165c4.449-12.743 12.172-22.886 21.351-31.977 8.12-8.042 16.626-15.696 24.665-23.815 5.922-5.98 11.587-12.225 13.304-21.028 1.036-5.313-1.599-12.497-6.112-14.206-5.616-2.128-13.381-1.978-16.907 3.892-2.551 4.249-5.448 8.623-9.192 11.737-4.713 3.92-14.176 2.85-18.696-.834-4.539-3.7-8.279-12.326-4.734-20.203 6.08-13.51 16.622-21.13 30.91-23.674 10.051-1.79 20.13-2.006 30.13.911 14.84 4.33 27.623 18.55 28.392 35 .855 18.297-7.09 32.43-18.845 45.343-8.116 8.914-15.782 18.237-22.195 25.689 5.564 0 14.81.325 24.021-.098 8.146-.373 17.273 6.71 17.157 16.325-.108 8.917-8.798 16.016-17.101 15.884-21.147-.334-42.323-.667-63.448.1-12.475.452-17.99-7.105-12.7-19.046m180.074-119.568c1.483 3.184 3.716 6.046 3.75 8.935.284 23.96.161 47.924.161 72.314 5.836-.116 10.804 1.966 13.816 6.723 1.663 2.627 2.718 6.21 2.576 9.293-.325 7.07-4.587 14.654-15.893 14.36-.497 5.35-.389 10.844-1.637 16.01-1.792 7.415-9.948 12.014-17.498 10.756-7.501-1.249-13.352-8.109-13.363-15.676-.006-3.626-.001-7.252-.001-11.312-14.612 0-28.88.003-43.148-.001-7.467-.003-10.17-3.398-11-10.649-1.415-12.35 2.964-22.158 10.015-31.997 15.198-21.206 29.462-43.08 44.194-64.623 2.605-3.81 5.97-6.412 11.147-5.784 5.51.669 11.072.913 16.88 1.651M357 199.25v-2.86l-18.567 27.335H357z"></path>
</svg>,
    // Icon4
    <svg className="icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <path d="M256 42.67 64 128v128c0 106.03 46.08 198.72 192 213.33 145.92-14.61 192-107.3 192-213.33V128z" stroke="currentColor" strokeWidth="42.67" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
    <path d="m170.67 266.67 64 64 106.66-128" stroke="currentColor" strokeWidth="42.67" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
</svg>
  ];

  return (
    <section className="why-choose-us" id="why-choose-us">
      <div className="why-choose-us-container">
        <div className="why-choose-us-header">
          <p className="why-choose-us-badge">{t.badge}</p>
          <h2 className="why-choose-us-title">{t.title}</h2>
          <p className="why-choose-us-subtitle">{t.subtitle}</p>
        </div>

        <div className="why-choose-us-grid">
          {t.reasons.map((reason, index) => (
            <div key={index} className="why-choose-us-card">
              <div className="why-choose-us-icon">
                {reasonIcons[index]}
              </div>
              <h3 className="why-choose-us-card-title">{reason.title}</h3>
              <p className="why-choose-us-card-description">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;