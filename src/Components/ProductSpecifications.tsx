import React, { useState, useEffect } from 'react';
import './styles/ProductSpecifications.css';

// Language type
type Language = 'id' | 'en';

// Translations
const translations = {
  id: {
    badge: 'SPESIFIKASI',
    title: 'Spesifikasi Teknis Produk',
    subtitle: 'Detail lengkap spesifikasi Electric Patient Lifter HY101-01A untuk membantu Anda memahami kemampuan dan fitur produk',
    specs: [
      {
        label: 'Model nomor',
        value: 'HY101-01A'
      },
      {
        label: 'Bingkai',
        value: 'Baja berlapis bubuk'
      },
      {
        label: 'Fitur',
        value: 'Fasilitas Penggunaan Rumah / Rehabilitasi'
      },
      {
        label: 'Kapasitas Beban',
        value: '180 kg'
      },
      {
        label: 'Berat Bersih',
        value: '45 kg'
      },
      {
        label: 'Motor',
        value: 'MOTEK 24V 8000N'
      },
      {
        label: 'Kapasitas baterai',
        value: '60-80 Kali'
      },
      {
        label: 'Dimensi',
        value: '120 x 62 x 122,5 cm'
      },
      {
        label: 'Tingkat Kebisingan',
        value: '65dB (A)'
      },
      {
        label: 'Jarak Lantai',
        value: '13 cm'
      },
      {
        label: 'Mengangkat Tinggi',
        value: '84,8 cm (Terendah), 174,8 cm (Tertinggi)'
      },
      {
        label: 'Lebar Dasar',
        value: '62-87,6 cm'
      },
      {
        label: 'Gendongan Angkat Hoyer',
        value: 'Tidak Perlu Pembelian Tambahan'
      },
    ],
  },
  en: {
    badge: 'SPECIFICATIONS',
    title: 'Product Technical Specifications',
    subtitle: 'Complete specification details of Electric Patient Lifter HY101-01A to help you understand product capabilities and features',
    specs: [
      {
        label: 'Model Number',
        value: 'HY101-01A'
      },
      {
        label: 'Frame',
        value: 'Powder-coated Steel'
      },
      {
        label: 'Features',
        value: 'Home Care / Rehabilitation Facility'
      },
      {
        label: 'Load Capacity',
        value: '180 kg'
      },
      {
        label: 'Net Weight',
        value: '45 kg'
      },
      {
        label: 'Motor',
        value: 'MOTEK 24V 8000N'
      },
      {
        label: 'Battery Capacity',
        value: '60-80 Cycles'
      },
      {
        label: 'Dimensions',
        value: '120 x 62 x 122.5 cm'
      },
      {
        label: 'Noise Level',
        value: '65dB (A)'
      },
      {
        label: 'Ground Clearance',
        value: '13 cm'
      },
      {
        label: 'Lifting Height',
        value: '84.8 cm (Lowest), 174.8 cm (Highest)'
      },
      {
        label: 'Base Width',
        value: '62-87.6 cm'
      },
      {
        label: 'Hoyer Lift Sling',
        value: 'No Additional Purchase Required'
      }
    ],
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

// Icon component based on spec type
const getSpecIcon = (index: number) => {
  const iconProps = {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  // Model Number - Document icon
  if (index === 0) {
    return (
      <svg {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    );
  }

  // Frame - Grid icon
  if (index === 1) {
    return (
      <svg {...iconProps}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    );
  }

  // Features - Home icon
  if (index === 2) {
    return (
      <svg {...iconProps}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }

  // Load Capacity - Trending up icon
  if (index === 3) {
    return (
      <svg {...iconProps}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
  }

  // Net Weight - Package icon
  if (index === 4) {
    return (
      <svg {...iconProps}>
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
        <line x1="16" y1="8" x2="2" y2="22" />
        <line x1="17.5" y1="15" x2="9" y2="15" />
      </svg>
    );
  }

  // Motor - Settings/Gear icon
  if (index === 5) {
    return (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6" />
        <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" />
        <path d="M1 12h6m6 0h6" />
        <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" />
      </svg>
    );
  }

  // Battery Capacity - Battery icon
  if (index === 6) {
    return (
      <svg {...iconProps}>
        <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
        <line x1="23" y1="13" x2="23" y2="11" />
        <line x1="4" y1="10" x2="4" y2="14" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <line x1="12" y1="10" x2="12" y2="14" />
      </svg>
    );
  }

  // Dimensions - Box icon
  if (index === 7) {
    return (
      <svg {...iconProps}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  }

  // Noise Level - Volume icon
  if (index === 8) {
    return (
      <svg {...iconProps}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    );
  }

  // Ground Clearance - Bar chart icon
  if (index === 9) {
    return (
      <svg {...iconProps}>
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
      </svg>
    );
  }

  // Lifting Height - Arrow up icon
  if (index === 10) {
    return (
      <svg {...iconProps}>
        <polyline points="18 15 12 9 6 15" />
        <line x1="12" y1="9" x2="12" y2="21" />
      </svg>
    );
  }

  // Base Width - Arrows horizontal icon
  if (index === 11) {
    return (
      <svg {...iconProps}>
        <polyline points="5 9 2 12 5 15" />
        <polyline points="19 9 22 12 19 15" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    );
  }

  // Hoyer Lift Sling - Check icon
  if (index === 12) {
    return (
      <svg {...iconProps}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }

  // Default icon
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
};

const ProductSpecifications: React.FC = () => {
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
    <section className="product-specifications" id="specifications">
      <div className="specs-header">
        <p className="specs-badge">{t.badge}</p>
        <h2 className="specs-title">{t.title}</h2>
        <p className="specs-subtitle">{t.subtitle}</p>
      </div>

      <div className="specs-container">
        <div className="specs-image">
          <img
            src="/Productdetail.webp"
            alt={currentLang === 'id'
              ? 'Spesifikasi Electric Patient Lifter'
              : 'Electric Patient Lifter Specifications'}
            className="specs-image-main"
            loading="lazy"
          />
        </div>

        <div className="specs-content">
          <div className="specs-grid">
            {t.specs.map((spec, index) => (
              <div key={index} className={`spec-item ${index === t.specs.length - 1 ? 'full-width' : ''}`}>
                <div className="spec-icon">
                  {getSpecIcon(index)}
                </div>
                <div className="spec-details">
                  <p className="spec-label">{spec.label}</p>
                  <p className="spec-value">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSpecifications;