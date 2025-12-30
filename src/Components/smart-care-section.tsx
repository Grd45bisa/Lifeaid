import React, { useState, useEffect } from 'react';
import './styles/SmartCare.css';
import {
  IconCapacity,
  IconMotor,
  IconBattery,
  IconWheels,
  IconAdjustable,
  IconEmergency,
  IconStructure,
  IconEasyOp
} from './icons/SmartCareIcons';

// Language type
type Language = 'id' | 'en';

// Translations
const translations = {
  id: {
    title: 'SmartCare™ Electric Patient Lifter',
    features: [
      {
        title: 'Motor Taiwan MOTECK',
        description: 'Teknologi motor berkualitas tinggi dari Taiwan'
      },
      {
        title: 'Kapasitas Beban Maksimal 180 Kg',
        description: 'Mampu mengangkat beban hingga 180 kilogram'
      },
      {
        title: 'Tabung Baja Berstruktur',
        description: 'Konstruksi kokoh dan tahan lama'
      },
      {
        title: 'Transfer 360°',
        description: 'Dapat memutar penuh untuk kemudahan pemindahan'
      },
      {
        title: 'Rem Roda Belakang',
        description: 'Keamanan terjamin saat digunakan'
      },
      {
        title: 'Handle Kontrol Headset',
        description: 'Mudah dioperasikan dengan satu tangan'
      },
      {
        title: 'Basis yang Dapat Disesuaikan',
        description: 'Fleksibel untuk berbagai ukuran ruangan'
      },
      {
        title: 'Angkat Lembut',
        description: 'Kenyamanan maksimal untuk pasien'
      }
    ],
  },
  en: {
    title: 'SmartCare™ Electric Patient Lifter',
    features: [
      {
        title: 'Taiwan MOTECK Motor',
        description: 'High-quality motor technology from Taiwan'
      },
      {
        title: 'Maximum Load Capacity: 180 Kg',
        description: 'Capable of lifting up to 180 kilograms'
      },
      {
        title: 'Structured Steel Tube',
        description: 'Robust and durable construction'
      },
      {
        title: '360° Transfer',
        description: 'Full rotation for easy patient transfer'
      },
      {
        title: 'Rear Wheel Brake',
        description: 'Safety assured during operation'
      },
      {
        title: 'Headset Control Handle',
        description: 'Easy to operate with one hand'
      },
      {
        title: 'Adjustable Base',
        description: 'Flexible for various room sizes'
      },
      {
        title: 'Lift Gently',
        description: 'Maximum comfort for patients'
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

const SmartCare: React.FC = () => {
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

  // Icons array mapped to imports
  const featureIcons = [
    <IconCapacity key="capacity" />,
    <IconMotor key="motor" />,
    <IconBattery key="battery" />,
    <IconWheels key="wheels" />,
    <IconAdjustable key="adjustable" />,
    <IconEmergency key="emergency" />,
    <IconStructure key="structure" />,
    <IconEasyOp key="easyop" />
  ];

  return (
    <section className="smartcare-section" id="smartcare">
      <div className="smartcare-container">
        <div className="smartcare-header">
          <h2 className="smartcare-title">{t.title}</h2>
        </div>

        <div className="smartcare-grid">
          {/* Features Grid */}
          <div className="features-grid">
            {t.features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {featureIcons[index]}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
              </div>
            ))}
          </div>

          {/* Image Section */}
          <div className="image-section">
            <div className="image-container">
              <img
                src="/spec2.webp"
                alt={currentLang === 'id'
                  ? 'SmartCare Electric Patient Lifter'
                  : 'SmartCare Electric Patient Lifter'}
                className="product-image"
                loading="lazy"
                width={600}
                height={800}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartCare;