import React, { useState, useEffect } from 'react';
import './styles/Testimonials.css';
import { isUsingDatabaseProducts, fetchPublicTestimonials, type Testimonial as DbTestimonial } from '../utils/supabaseClient';

// Language type
type Language = 'id' | 'en';

// Static translations
const translations = {
  id: {
    badge: 'TESTIMONI',
    title: 'Apa Kata Pelanggan Kami',
    subtitle: 'Jangan hanya percaya kata-kata kami—lihat apa yang dikatakan pelanggan kami yang puas. Pengalaman dan kesuksesan mereka menunjukkan betapa besar komitmen kami terhadap kualitas dan layanan.',
    prevButton: 'Previous testimonials',
    nextButton: 'Next testimonials',
    goToSlide: 'Go to slide',
    testimonials: [
      {
        name: 'Sinta',
        role: 'Pelanggan Tokopedia',
        comment: 'Barang datang sesuai dengan pesanan Penjual amanah, dan pengiriman cepat',
        initial: 'S'
      },
      {
        name: 'Dani',
        role: 'Pelanggan Tokopedia',
        comment: 'seller sangat membantu proses order dan pengiriman',
        initial: 'D'
      },
      {
        name: 'T***a',
        role: 'Pelanggan Tokopedia',
        comment: 'Barang bagus dan sesuai, kualitas bagus, seller sresponsif dan membantu sekali. keseluruhan toko ini sangat rekomendasi. terima kasih banyak',
        initial: 'T'
      }
    ]
  },
  en: {
    badge: 'TESTIMONIALS',
    title: 'What Our Customers Say',
    subtitle: 'Don\'t just take our word for it—see what our satisfied customers have to say. Their experiences and successes demonstrate our great commitment to quality and service.',
    prevButton: 'Previous testimonials',
    nextButton: 'Next testimonials',
    goToSlide: 'Go to slide',
    testimonials: [
      {
        name: 'Sinta',
        role: 'Tokopedia Customer',
        comment: 'The goods arrived as ordered. Trusted seller, and fast delivery',
        initial: 'S'
      },
      {
        name: 'Dani',
        role: 'Tokopedia Customer',
        comment: 'The seller was very helpful with the ordering and delivery process',
        initial: 'D'
      },
      {
        name: 'T***a',
        role: 'Tokopedia Customer',
        comment: 'Good product and as expected, good quality, seller is responsive and very helpful. Overall this store is highly recommended. Thank you very much',
        initial: 'T'
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

interface Testimonial {
  name: string;
  role: string;
  rating?: number;
  comment: string;
  initial: string;
}

// Map database testimonial to display format
const mapDbToDisplay = (item: DbTestimonial, lang: Language): Testimonial => ({
  name: item.name,
  role: lang === 'id' ? (item.role_id || '') : (item.role_en || ''),
  rating: item.rating,
  comment: lang === 'id' ? item.comment_id : item.comment_en,
  initial: item.name.charAt(0).toUpperCase()
});

const Testimonials: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dbTestimonials, setDbTestimonials] = useState<DbTestimonial[]>([]);
  const [useDatabase, setUseDatabase] = useState(false);

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

  // Load testimonials from database if enabled
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const useDb = await isUsingDatabaseProducts();
        setUseDatabase(useDb);
        if (useDb) {
          const data = await fetchPublicTestimonials();
          setDbTestimonials(data);
        }
      } catch (err) {
        console.error('Error loading testimonials:', err);
      }
    };
    loadTestimonials();
  }, []);

  const t = translations[currentLang];

  // Get testimonials based on source
  const testimonials: Testimonial[] = useDatabase && dbTestimonials.length > 0
    ? dbTestimonials.map(item => mapDbToDisplay(item, currentLang))
    : t.testimonials.map(item => ({
      ...item,
      rating: 5
    }));

  // Handle responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  // Reset index when items per view changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsPerView, maxIndex, currentIndex]);

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="testimonial-stars">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`star ${index < rating ? 'filled' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 0L12.2451 6.90983H19.5106L13.6327 11.1803L15.8779 18.0902L10 13.8197L4.12215 18.0902L6.36729 11.1803L0.489435 6.90983H7.75486L10 0Z" />
          </svg>
        ))}
      </div>
    );
  };

  const translateValue = -currentIndex * (100 / itemsPerView);

  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-container">
        {/* Header */}
        <div className="testimonials-header">
          <p className="testimonials-badge">{t.badge}</p>
          <h2 className="testimonials-title">{t.title}</h2>
          <p className="testimonials-subtitle">{t.subtitle}</p>
        </div>

        {/* Carousel Container */}
        <div className="testimonials-carousel">
          {/* Navigation Arrows */}
          <button
            className={`carousel-arrow carousel-arrow-prev ${currentIndex === 0 ? 'disabled' : ''}`}
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label={t.prevButton}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Testimonials Track */}
          <div className="testimonials-track-container">
            <div
              className="testimonials-track"
              style={{
                transform: `translateX(${translateValue}%)`,
                transition: isTransitioning ? 'transform 0.3s ease-in-out' : 'none'
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="testimonial-card"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  {/* Comment */}
                  <p className="testimonial-comment">"{testimonial.comment}"</p>
                  {/* Stars */}
                  {renderStars(testimonial.rating || 5)}
                  {/* Author Info */}
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      {testimonial.initial}
                    </div>
                    <div className="author-info">
                      <h4 className="author-name">{testimonial.name}</h4>
                      <p className="author-role">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className={`carousel-arrow carousel-arrow-next ${currentIndex === maxIndex ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            aria-label={t.nextButton}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;