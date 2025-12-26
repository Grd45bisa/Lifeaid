import React, { useState, useEffect, useRef } from 'react';
import './styles/Navbar.css';
import OptimizedImage from './ui/OptimizedImage';

// Language type
type Language = 'id' | 'en';

// Translations
const translations = {
  id: {
    home: 'Beranda',
    about: 'Tentang',
    product: 'Produk',
    featuredProducts: 'Produk Unggulan',
    collections: 'Koleksi',
    tutorial: 'Tutorial',
    testimonials: 'Testimoni',
    faq: 'FAQ',
    contact: 'Kontak',
    consultation: 'Konsultasi'
  },
  en: {
    home: 'Home',
    about: 'About',
    product: 'Product',
    featuredProducts: 'Featured',
    collections: 'Collections',
    tutorial: 'Tutorial',
    testimonials: 'Reviews',
    faq: 'FAQ',
    contact: 'Contact',
    consultation: 'Consultation'
  }
};

// Detect country based on timezone and IP
const detectCountry = async (): Promise<'id' | 'en'> => {
  const savedLang = localStorage.getItem('preferred-language') as Language;
  if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
    return savedLang;
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const indonesianTimezones = [
    'Asia/Jakarta',
    'Asia/Makassar',
    'Asia/Jayapura',
    'Asia/Pontianak'
  ];

  if (indonesianTimezones.includes(timezone)) {
    return 'id';
  }

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('id')) {
    return 'id';
  }

  try {
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.country_code === 'ID') {
        return 'id';
      }
    }
  } catch (error) {
    console.log('Geolocation detection failed, using default');
  }

  return 'en';
};

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

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());
  const [activeSection, setActiveSection] = useState('home');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const navbarRef = useRef<HTMLElement | null>(null);
  const dropdownRef = useRef<HTMLLIElement | null>(null);
  const dropdownTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const autoDetectCountry = async () => {
      const savedLang = localStorage.getItem('preferred-language');
      if (!savedLang) {
        const detectedLang = await detectCountry();
        setCurrentLang(detectedLang);
        localStorage.setItem('preferred-language', detectedLang);
        console.log(`Language auto-detected: ${detectedLang === 'id' ? 'Bahasa Indonesia' : 'English'}`);
      }
    };
    autoDetectCountry();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const sections = ['home', 'about', 'product', 'video-tutorial', 'testimonials', 'faq', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (isMenuOpen && navbarRef.current && !navbarRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      if (isProductDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsProductDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen, isProductDropdownOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsProductDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (dropdownTimeoutRef.current) {
        window.clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const event = new CustomEvent('navbar-menu-toggle', { detail: { isOpen: isMenuOpen } });
    window.dispatchEvent(event);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
    if (isProductDropdownOpen) {
      setIsProductDropdownOpen(false);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsProductDropdownOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    closeMenu();

    if (targetId === '#' || targetId === '/#' || targetId === '') {
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveSection('home');
      }
      return;
    }

    if (targetId.startsWith('#')) {
      if (window.location.pathname !== '/') {
        sessionStorage.setItem('scrollToSection', targetId);
        window.location.href = '/';
      } else {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const offsetTop = (targetElement as HTMLElement).offsetTop - 70;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
      }
    }
  };

  const handleLanguageChange = (lang: Language) => {
    if (lang !== currentLang) {
      setCurrentLang(lang);
      localStorage.setItem('preferred-language', lang);
      window.dispatchEvent(new Event('storage'));
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  const handleConsultationClick = () => {
    closeMenu();
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      const offsetTop = (contactSection as HTMLElement).offsetTop - 70;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };





  const t = translations[currentLang];

  return (
    <>
      {isMenuOpen && <div className="navbar-overlay" onClick={closeMenu} />}
      <nav ref={navbarRef} className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-logo">
            <a href="#" onClick={(e) => handleNavClick(e, '#')}>
              <OptimizedImage src="/Logo-trans.png" alt="LifeAid" width={40} height={40} priority />
              <span>LifeAid</span>
            </a>
          </div>

          <ul className="navbar-links">
            <li>
              <a href="#" onClick={(e) => handleNavClick(e, '#')} className={activeSection === 'home' ? 'active' : ''}>
                {t.home}
              </a>
            </li>
            <li>
              <a href="#about" onClick={(e) => handleNavClick(e, '#about')} className={activeSection === 'about' ? 'active' : ''}>
                {t.about}
              </a>
            </li>
            <li>
              <a href="#product" onClick={(e) => handleNavClick(e, '#product')} className={activeSection === 'product' ? 'active' : ''}>
                {t.product}
              </a>
            </li>
            <li>
              <a href="#video-tutorial" onClick={(e) => handleNavClick(e, '#video-tutorial')} className={activeSection === 'video-tutorial' ? 'active' : ''}>
                {t.tutorial}
              </a>
            </li>
            <li>
              <a href="#testimonials" onClick={(e) => handleNavClick(e, '#testimonials')} className={activeSection === 'testimonials' ? 'active' : ''}>
                {t.testimonials}
              </a>
            </li>
            <li>
              <a href="#faq" onClick={(e) => handleNavClick(e, '#faq')} className={activeSection === 'faq' ? 'active' : ''}>
                {t.faq}
              </a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className={activeSection === 'contact' ? 'active' : ''}>
                {t.contact}
              </a>
            </li>
          </ul>

          <div className="navbar-actions">
            <div className="lang-switcher">
              <button className={currentLang === 'id' ? 'active' : ''} onClick={() => handleLanguageChange('id')}>
                ID
              </button>
              <button className={currentLang === 'en' ? 'active' : ''} onClick={() => handleLanguageChange('en')}>
                EN
              </button>
            </div>
            <button className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-header">
          <OptimizedImage src="/LifeAid.webp" alt="LifeAid" width={40} height={40} />
          <span>LifeAid</span>
        </div>

        <ul className="mobile-links">
          <li>
            <a href="#" onClick={(e) => handleNavClick(e, '#')} className={activeSection === 'home' ? 'active' : ''}>
              {t.home}
            </a>
          </li>
          <li>
            <a href="#about" onClick={(e) => handleNavClick(e, '#about')} className={activeSection === 'about' ? 'active' : ''}>
              {t.about}
            </a>
          </li>
          <li>
            <a href="#product" onClick={(e) => handleNavClick(e, '#product')} className={activeSection === 'product' ? 'active' : ''}>
              {t.product}
            </a>
          </li>

          <li>
            <a href="#video-tutorial" onClick={(e) => handleNavClick(e, '#video-tutorial')} className={activeSection === 'video-tutorial' ? 'active' : ''}>
              {t.tutorial}
            </a>
          </li>
          <li>
            <a href="#testimonials" onClick={(e) => handleNavClick(e, '#testimonials')} className={activeSection === 'testimonials' ? 'active' : ''}>
              {t.testimonials}
            </a>
          </li>
          <li>
            <a href="#faq" onClick={(e) => handleNavClick(e, '#faq')} className={activeSection === 'faq' ? 'active' : ''}>
              {t.faq}
            </a>
          </li>
          <li>
            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className={activeSection === 'contact' ? 'active' : ''}>
              {t.contact}
            </a>
          </li>
        </ul>

        <div className="mobile-footer">
          <div className="mobile-lang">
            <button className={currentLang === 'id' ? 'active' : ''} onClick={() => handleLanguageChange('id')}>
              Bahasa Indonesia
            </button>
            <button className={currentLang === 'en' ? 'active' : ''} onClick={() => handleLanguageChange('en')}>
              English
            </button>
          </div>
          <button className="mobile-cta" onClick={handleConsultationClick}>
            {t.consultation}
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;