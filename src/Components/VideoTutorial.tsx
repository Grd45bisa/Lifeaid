import React, { useState, useEffect } from 'react';
import './styles/VideoTutorial.css';
import { detectLanguage, type Language } from '../utils/languageUtils';

const translations = {
  id: {
    badge: 'Video Tutorial',
    title: 'Cara Menggunakan Pengangkat Pasien Listrik LifeAid',
    description: 'Tonton video tutorial ini untuk mempelajari cara menggunakan alat pengangkat pasien elektrik LifeAid dengan aman dan mudah. Video ini menunjukkan petunjuk langkah demi langkah untuk memindahkan pasien ke kursi roda, tempat tidur, atau mobil, memastikan kenyamanan dan keamanan bagi pasien dan pengasuh.',
    buyNow: 'Beli Sekarang',
    consultation: 'Konsultasi Gratis'
  },
  en: {
    badge: 'Video Tutorial',
    title: 'How to Use LifeAid Electric Patient Lift',
    description: 'Watch this video tutorial to learn how to use the LifeAid electric patient lift safely and easily. This video shows step-by-step instructions for transferring patients to a wheelchair, bed, or car, ensuring comfort and safety for both the patient and the caregiver.',
    buyNow: 'Buy Now',
    consultation: 'Free Consultation'
  }
};

const VideoTutorial: React.FC = () => {
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [currentLang, setCurrentLang] = useState<Language>('id');

  useEffect(() => {
    setCurrentLang(detectLanguage());

    const handleStorageChange = () => {
      setCurrentLang(detectLanguage());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = translations[currentLang];

  const handlePlayClick = () => {
    setShowThumbnail(false);
  };

  // YouTube Video ID dari link yang diberikan
  const youtubeVideoId = 'tvzP8EqYx_0';

  return (
    <section className="video-tutorial-section" id="video-tutorial">
      <div className="video-tutorial-container">
        {/* Badge */}
        <div className="video-badge-wrapper">
          <span className="video-badge">
            {t.badge}
          </span>
        </div>

        {/* Title */}
        <h2 className="video-title">
          {t.title}
        </h2>

        {/* Description */}
        <p className="video-description">
          {t.description}
        </p>

        {/* Video Container */}
        <div className="video-wrapper">
          <div className="video-aspect-ratio" style={{ position: 'relative' }}>
            {/* YouTube Video - dengan autoplay */}
            <iframe
              src={showThumbnail
                ? `https://www.youtube.com/embed/${youtubeVideoId}`
                : `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`
              }
              className="video-element"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="LifeAid Tutorial"
              style={{
                border: 'none',
                display: showThumbnail ? 'none' : 'block'
              }}
            ></iframe>

            {/* Thumbnail Overlay */}
            {showThumbnail && (
              <div
                className="video-thumbnail-container"
                onClick={handlePlayClick}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={currentLang === 'id'
                    ? '/Videos/VideoThumbnail.webp'
                    : '/Videos/How_to_Use_LifeAid_-_Electric_Patient_Lifter.webp'
                  }
                  alt="Video Thumbnail"
                  className="video-element"
                  style={{ objectFit: 'cover' }}
                />
                <div className="video-play-overlay">
                  <button className="video-play-button" aria-label="Play video">
                    <svg
                      className="video-play-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="video-cta-wrapper">
          <a className="video-cta-primary" href="/#product">
            <svg className="video-cta-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            {t.buyNow}
          </a>

          <button className="video-cta-secondary" onClick={() => window.open('https://wa.me/6281219751605', '_blank')}>
            <svg className="video-cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {t.consultation}
          </button>
        </div>
      </div>
    </section>
  );
};

export default VideoTutorial;