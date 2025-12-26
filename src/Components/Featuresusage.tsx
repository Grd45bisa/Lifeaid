import React, { useState, useEffect } from 'react';
import './styles/Featuresusage.css';
import OptimizedImage from './ui/OptimizedImage';

// Language type
type Language = 'id' | 'en';

// Translations
const translations = {
  id: {
    // Guides Section
    guidesBadge: 'PANDUAN PENGGUNAAN',
    guidesTitle: 'Cara Penggunaan Alat Angkat Pasien',
    guidesSubtitle: 'Panduan lengkap langkah demi langkah untuk menggunakan alat angkat pasien dengan aman dan mudah',
    readMore: 'Baca Selengkapnya',
    readLess: 'Tutup',
    guides: [
      {
        title: 'Memindahkan Pasien dari atau ke Tempat Tidur dengan Aman',
        description: 'Panduan lengkap untuk memindahkan pasien dari tempat tidur ke kursi roda atau sebaliknya dengan aman menggunakan patient lifter.'
      },
      {
        title: 'Menggunakan Lift Hoyer untuk Memindahkan Toilet, Kursi, dan Kursi Roda',
        description: 'Teknik yang tepat untuk menggunakan lift Hoyer dalam memindahkan pasien ke berbagai lokasi seperti toilet, kursi, dan kursi roda.'
      },
      {
        title: 'Mengangkat Pasien dari Lantai Menggunakan Gendongan Duduk-Berdiri',
        description: 'Cara aman mengangkat pasien yang jatuh dari lantai menggunakan gendongan duduk-berdiri dengan lift pasien.'
      },
      {
        title: 'Jadilah Rata di Lantai Sling',
        description: 'Teknik penggunaan sling yang tepat untuk memastikan pasien dalam posisi yang aman dan nyaman selama proses pemindahan.'
      }
    ],

    // Features Section
    featuresBadge: 'FITUR & KEUNGGULAN',
    featuresTitle: 'Fitur Unggulan Electric Patient Lifter',
    featuresSubtitle: 'Teknologi dan fitur canggih yang memudahkan perawatan pasien sehari-hari',
    features: [
      {
        title: 'Menstabilkan Roda Belakang dengan Mekanisme Penguncian yang Mudah',
        description: 'Roda belakang dapat dikunci dengan aman untuk mencegah pergerakan...',
        fullDescription: 'Roda belakang dapat dikunci dengan aman untuk mencegah pergerakan selama pemindahan pasien. Mudah dioperasikan dengan kaki Anda untuk penguncian dan pembukaan kunci yang cepat.'
      },
      {
        title: 'Baterai Isi Ulang Tahan Lama dengan Opsi Pengisian Fleksibel',
        description: 'Baterai timbal-asam tertutup berkapasitas tinggi dapat diisi langsun...',
        fullDescription: 'Baterai timbal-asam tertutup berkapasitas tinggi dapat diisi langsung di lift atau dilepas untuk pengisian daya di dinding yang praktis. Dirancang untuk penggunaan jangka panjang dan kinerja yang andal dalam pemindahan pasien sehari-hari.'
      },
      {
        title: 'Kait Praktis untuk Penyimpanan Kabel Pengisian Daya',
        description: 'Jangan terganggu dengan lilitan kabel pengisian daya. Lifeaid telah...',
        fullDescription: 'Jangan terganggu dengan lilitan kabel pengisian daya, Lifeaid telah menyediakan pengait yang nyaman untuk produk ini, cukup masukkan pengait langsung ke sisi kanan rumah motor'
      },
      {
        title: 'Selempang Pasien Nilon Tahan Lama – Cocok untuk Sebagian Besar Transfer',
        description: 'Terbuat dari nilon yang kuat dan berkualitas tinggi, sling angkat pasien ini...',
        fullDescription: 'Terbuat dari nilon yang kuat dan berkualitas tinggi, sling angkat pasien ini menawarkan dukungan yang andal untuk kebutuhan angkat sehari-hari. Batang sling dengan lebar standar kompatibel dengan sebagian besar pengguna dan skenario angkat, memastikan kesesuaian yang aman dan nyaman.'
      },
      {
        title: 'Sling Bar Berputar 360° dengan Lengan Angkat yang Diperpanjang',
        description: 'Batang gendongan cradle yang kokoh dilengkapi kait pengaman yang aman dan...',
        fullDescription: 'Batang gendongan cradle yang kokoh dilengkapi kait pengaman yang aman dan rotasi 360 derajat yang halus untuk posisi yang fleksibel. Lengan pengangkatnya yang panjang memudahkan pemindahan pasien ke tengah tempat tidur dengan tekanan minimal.'
      },
      {
        title: 'Pegangan Tangan Ergonomis untuk Kenyamanan dan Kontrol yang Ditingkatkan',
        description: 'Dirancang dengan mempertimbangkan kenyamanan pengasuh...',
        fullDescription: 'Dirancang dengan mempertimbangkan kenyamanan pengasuh, pegangan tangan ergonomis memberikan pegangan yang aman dan stabil selama pemindahan pasien, mengurangi kelelahan tangan dan meningkatkan kemampuan manuver.'
      },
      {
        title: 'Kontrol Jarak Jauh Sederhana dengan Pengoperasian Pengangkatan yang Mudah',
        description: 'Remote yang mudah digunakan memungkinkan Anda menaikkan atau...',
        fullDescription: 'Remote yang mudah digunakan memungkinkan Anda menaikkan atau menurunkan lengan pengangkat hanya dengan sekali sentuh tombol atas/bawah. Dirancang untuk kemudahan penggunaan—bahkan pengguna lansia atau pengasuh dengan pelatihan minimal pun dapat mengoperasikannya dengan percaya diri.'
      },
      {
        title: 'Baterai Isi Ulang Berkapasitas Tinggi',
        description: 'Baterai dapat diisi dayanya saat berada di lift atau mudah dilepas untuk...',
        fullDescription: 'Baterai dapat diisi dayanya saat berada di lift atau mudah dilepas untuk pengisian daya di dinding eksternal. Baterai jenis asam timbal tertutup'
      }
    ]
  },
  en: {
    // Guides Section
    guidesBadge: 'USAGE GUIDE',
    guidesTitle: 'How to Use Patient Lifter',
    guidesSubtitle: 'Complete step-by-step guide to use patient lifter safely and easily',
    readMore: 'Read More',
    readLess: 'Close',
    guides: [
      {
        title: 'Safely Transfer Patient to or from Bed',
        description: 'Complete guide to safely transfer patients from bed to wheelchair or vice versa using a patient lifter.'
      },
      {
        title: 'Using Hoyer Lift to Transfer Toilet, Chair, and Wheelchair',
        description: 'Proper techniques for using Hoyer lift to transfer patients to various locations such as toilet, chair, and wheelchair.'
      },
      {
        title: 'Lifting Patient from Floor Using Sit-to-Stand Sling',
        description: 'Safe method to lift a fallen patient from the floor using sit-to-stand sling with patient lift.'
      },
      {
        title: 'Laying Flat on Floor Sling',
        description: 'Proper sling usage technique to ensure patient is in safe and comfortable position during transfer process.'
      }
    ],

    // Features Section
    featuresBadge: 'FEATURES & ADVANTAGES',
    featuresTitle: 'Featured Electric Patient Lifter Functions',
    featuresSubtitle: 'Advanced technology and features that facilitate daily patient care',
    features: [
      {
        title: 'Stabilizing Rear Wheels with Easy Locking Mechanism',
        description: 'Rear wheels can be securely locked to prevent movement...',
        fullDescription: 'Rear wheels can be securely locked to prevent movement during patient transfer. Easy to operate with your foot for quick locking and unlocking.'
      },
      {
        title: 'Long-lasting Rechargeable Battery with Flexible Charging Options',
        description: 'High-capacity sealed lead-acid battery can be charged direct...',
        fullDescription: 'High-capacity sealed lead-acid battery can be charged directly on the lift or removed for convenient wall charging. Designed for long-term use and reliable performance in daily patient transfers.'
      },
      {
        title: 'Practical Hook for Charging Cable Storage',
        description: 'Don\'t be bothered by tangled charging cables. Lifeaid has...',
        fullDescription: 'Don\'t be bothered by tangled charging cables, Lifeaid has provided a convenient hook for this product, just insert the hook directly to the right side of the motor housing'
      },
      {
        title: 'Durable Nylon Patient Sling – Suitable for Most Transfers',
        description: 'Made of strong and high-quality nylon, this patient lift sling...',
        fullDescription: 'Made of strong and high-quality nylon, this patient lift sling offers reliable support for daily lifting needs. Standard width sling bar compatible with most users and lifting scenarios, ensuring safe and comfortable fit.'
      },
      {
        title: '360° Rotating Sling Bar with Extended Lift Arm',
        description: 'Sturdy cradle sling bar equipped with secure safety hooks and...',
        fullDescription: 'Sturdy cradle sling bar equipped with secure safety hooks and smooth 360-degree rotation for flexible positioning. Long lift arm makes it easy to transfer patients to the center of the bed with minimal pressure.'
      },
      {
        title: 'Ergonomic Hand Grips for Enhanced Comfort and Control',
        description: 'Designed with caregiver comfort in mind...',
        fullDescription: 'Designed with caregiver comfort in mind, ergonomic hand grips provide secure and stable hold during patient transfers, reducing hand fatigue and improving maneuverability.'
      },
      {
        title: 'Simple Remote Control with Easy Lift Operation',
        description: 'Easy-to-use remote allows you to raise or...',
        fullDescription: 'Easy-to-use remote allows you to raise or lower the lift arm with just a single touch of the up/down button. Designed for ease of use—even elderly users or caregivers with minimal training can operate it confidently.'
      },
      {
        title: 'High-Capacity Rechargeable Battery',
        description: 'Battery can be charged while on the lift or easily removed for...',
        fullDescription: 'Battery can be charged while on the lift or easily removed for external wall charging. Sealed lead-acid type battery'
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

const FeaturesUsage: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());
  const [expandedFeatures, setExpandedFeatures] = useState<Set<number>>(new Set());

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

  const toggleFeature = (index: number) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFeatures(newExpanded);
  };

  const t = translations[currentLang];

  return (
    <>
      {/* Guides Section */}
      <section className="features-usage guides-section" id="guides">
        <div className="features-usage-container">
          <div className="features-usage-header">
            <p className="features-usage-badge">{t.guidesBadge}</p>
            <h2 className="features-usage-title">{t.guidesTitle}</h2>
            <p className="features-usage-subtitle">{t.guidesSubtitle}</p>
          </div>

          <div className="features-usage-grid">
            {t.guides.map((guide, index) => (
              <div key={index} className="feature-usage-card">
                <div className="feature-usage-image">
                  <OptimizedImage
                    src={`/Guide${index + 1}.webp`}
                    alt={guide.title}
                    aspectRatio="16/9"
                    placeholder="#e8e8e8"
                  />
                </div>

                <div className="feature-usage-content">
                  <h3 className="feature-usage-card-title">{guide.title}</h3>

                  <p className="feature-usage-description">
                    {guide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-usage features-section" id="features">
        <div className="features-usage-container">
          <div className="features-usage-header">
            <p className="features-usage-badge">{t.featuresBadge}</p>
            <h2 className="features-usage-title">{t.featuresTitle}</h2>
            <p className="features-usage-subtitle">{t.featuresSubtitle}</p>
          </div>

          <div className="features-usage-grid">
            {t.features.map((feature, index) => (
              <div key={index} className="feature-usage-card">
                <div className="feature-usage-image">
                  <OptimizedImage
                    src={index === 3 ? '/feature-4.avif' : index === 4 ? '/feature-5.avif' : index === 5 ? '/feature-6.avif' : index === 6 ? '/feature-7.avif' : `/feature-${index + 1}.webp`}
                    alt={feature.title}
                    aspectRatio="16/9"
                    placeholder="#e8e8e8"
                  />
                </div>

                <div className="feature-usage-content">
                  <h3 className="feature-usage-card-title">{feature.title}</h3>

                  <p
                    className={`feature-usage-description ${expandedFeatures.has(index) ? '' : 'truncated'
                      }`}
                  >
                    {expandedFeatures.has(index) ? feature.fullDescription : feature.description}
                  </p>

                  <button
                    className="feature-usage-toggle"
                    onClick={() => toggleFeature(index)}
                  >
                    {expandedFeatures.has(index) ? t.readLess : t.readMore}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesUsage;