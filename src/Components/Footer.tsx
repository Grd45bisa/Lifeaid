import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { supabase } from '../utils/supabaseClient';
import './styles/Footer.css';
import OptimizedImage from './ui/OptimizedImage';

// Language type
type Language = 'id' | 'en';

// Translations
const translations = {
  id: {
    brand: 'LifeAid',
    tagline: 'Sumber Utama Anda untuk Solusi Pengangkatan Pasien.',
    contact: {
      title: 'Hubungi kami',
      email: 'sales@lifeaidstore.com',
      phone: '+62 812-1975-1605'
    },
    newsletter: {
      title: 'Berlangganan email kami',
      subtitle: 'Dapatkan pembaruan terkini dan penawaran eksklusif yang dikirim langsung ke kotak masuk Anda.',
      placeholder: 'Enter your email',
      button: 'Berlangganan',
      submitting: 'Mengirim...',
      success: 'Terima kasih telah berlangganan!',
      error: 'Terjadi kesalahan. Silakan coba lagi.'
    },
    socialMedia: {
      instagram: 'Instagram',
      facebook: 'Facebook',
      whatsapp: 'WhatsApp'
    },
    copyright: '© 2025 LifeAid . Sumber Utama Anda untuk Solusi Pengangkatan Pasien.'
  },
  en: {
    brand: 'LifeAid',
    tagline: 'Your Primary Source for Patient Lifting Solutions.',
    contact: {
      title: 'Contact us',
      email: 'sales@lifeaidstore.com',
      phone: '+62 812-1975-1605'
    },
    newsletter: {
      title: 'Subscribe to our email',
      subtitle: 'Get the latest updates and exclusive offers sent directly to your inbox.',
      placeholder: 'Enter your email',
      button: 'Subscribe',
      submitting: 'Submitting...',
      success: 'Thank you for subscribing!',
      error: 'An error occurred. Please try again.'
    },
    socialMedia: {
      instagram: 'Instagram',
      facebook: 'Facebook',
      whatsapp: 'WhatsApp'
    },
    copyright: '© 2025 LifeAid . Your Primary Source for Patient Lifting Solutions.'
  }
};

// EmailJS Configuration - Same as CTA section
const EMAILJS_CONFIG = {
  serviceId: 'service_ovo0bkw',
  templateId: 'template_dgpejqd',
  publicKey: '-k0Z6rJV5VsKb-VXV'
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

const Footer: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Dynamic settings from Admin
  const [settings, setSettings] = useState({
    email: 'sales@lifeaidstore.com',
    phone: '+62 812-1975-1605',
    whatsapp: '6281219751605',
    instagram: 'https://instagram.com/lifeaidstore',
    facebook: ''
  });

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }, []);

  // Load settings from Supabase/localStorage
  useEffect(() => {
    const loadSettings = async () => {
      console.log('Footer: Loading settings...');

      // First try localStorage (faster)
      const saved = localStorage.getItem('website-settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          console.log('Footer: Found localStorage settings:', parsed);
          setSettings({
            email: parsed.email || 'sales@lifeaidstore.com',
            phone: parsed.phone || '+62 812-1975-1605',
            whatsapp: parsed.whatsapp || '6281219751605',
            instagram: parsed.instagram || 'https://instagram.com/lifeaidstore',
            facebook: parsed.facebook || ''
          });
        } catch {
          console.warn('Footer: Invalid localStorage JSON');
        }
      }

      // Then try Supabase (may override localStorage if available)
      try {
        const { data, error } = await supabase
          .from('website_settings')
          .select('key, value');

        if (!error && data && data.length > 0) {
          console.log('Footer: Found Supabase settings:', data);
          const newSettings = {
            email: 'sales@lifeaidstore.com',
            phone: '+62 812-1975-1605',
            whatsapp: '6281219751605',
            instagram: 'https://instagram.com/lifeaidstore',
            facebook: ''
          };
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === 'email' && item.value) newSettings.email = item.value;
            if (item.key === 'phone' && item.value) newSettings.phone = item.value;
            if (item.key === 'whatsapp' && item.value) newSettings.whatsapp = item.value;
            if (item.key === 'instagram' && item.value) newSettings.instagram = item.value;
            if (item.key === 'facebook' && item.value) newSettings.facebook = item.value;
          });
          setSettings(newSettings);
        }
      } catch (err) {
        console.warn('Footer: Supabase unavailable');
      }
    };

    loadSettings();

    // Listen for localStorage changes (when admin saves settings)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'website-settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          console.log('Footer: Settings changed via storage event:', parsed);
          setSettings({
            email: parsed.email || 'sales@lifeaidstore.com',
            phone: parsed.phone || '+62 812-1975-1605',
            whatsapp: parsed.whatsapp || '6281219751605',
            instagram: parsed.instagram || 'https://instagram.com/lifeaidstore',
            facebook: parsed.facebook || ''
          });
        } catch {
          // Invalid JSON
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // SAVE TO SUPABASE CONTACT_MESSAGES
      const { error: supabaseError } = await supabase
        .from('contact_messages')
        .insert({
          name: 'Newsletter Subscriber',
          email: email,
          phone: null,
          message: `Newsletter subscription from: ${email}`,
          type: 'subscribe', // Mark as newsletter subscription
          is_read: false,
          is_replied: false
        });

      if (supabaseError) {
        console.warn('Supabase save failed:', supabaseError.message);
        // Continue with email even if Supabase fails
      } else {
        console.log('✅ Saved to contact_messages (subscribe)');
      }

      // Prepare template parameters
      const templateParams = {
        to_name: 'LifeAid Team',
        from_email: email,
        subscriber_email: email,
        language: currentLang === 'id' ? 'Indonesian' : 'English',
        date: new Date().toLocaleString(currentLang === 'id' ? 'id-ID' : 'en-US', {
          dateStyle: 'full',
          timeStyle: 'short'
        }),
        message: `New newsletter subscription from: ${email}`
      };

      // Send email via EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );

      console.log('EmailJS Response:', response);

      if (response.status === 200) {
        setSubmitStatus('success');
        setEmail('');

        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 5000);
      } else {
        throw new Error('Email sending failed');
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      setSubmitStatus('error');

      // Reset error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = translations[currentLang];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          {/* Left Column - Logo & Contact */}
          <div className="footer-column footer-brand">
            {/* Logo */}
            <div className="footer-logo">
              <OptimizedImage src="/LifeAid.webp" alt="LifeAid Logo" className="footer-logo-image" width={50} height={50} />
              <h3 className="footer-brand-name">{t.brand}</h3>
            </div>

            {/* Social Media */}
            <div className="footer-social">
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label={t.socialMedia.instagram}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label={t.socialMedia.facebook}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label={t.socialMedia.whatsapp}
                >
                  <svg height="20" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xmlSpace="preserve">
                    <path fillRule="evenodd" clipRule="evenodd" d="M20.5 3.5C18.25 1.25 15.2 0 12 0 5.41 0 0 5.41 0 12c0 2.11.65 4.11 1.7 5.92L0 24l6.33-1.55C8.08 23.41 10 24 12 24c6.59 0 12-5.41 12-12 0-3.19-1.24-6.24-3.5-8.5M12 22c-1.78 0-3.48-.59-5.01-1.49l-.36-.22-3.76.99 1-3.67-.24-.38C2.64 15.65 2 13.88 2 12 2 6.52 6.52 2 12 2c2.65 0 5.2 1.05 7.08 2.93S22 9.35 22 12c0 5.48-4.53 10-10 10m5.5-7.55c-.3-.15-1.77-.87-2.04-.97s-.47-.15-.67.15-.77.97-.95 1.17c-.17.2-.35.22-.65.07s-1.26-.46-2.4-1.48c-.89-.79-1.49-1.77-1.66-2.07s-.02-.46.13-.61c.13-.13.3-.35.45-.52s.2-.3.3-.5.05-.37-.02-.52c-.08-.15-.68-1.62-.93-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01s-.52.08-.8.37c-.27.3-1.04 1.03-1.04 2.5s1.07 2.89 1.22 3.09 2.11 3.22 5.1 4.51c.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42s.25-1.3.17-1.42c-.07-.13-.27-.21-.57-.36" fill="#ffffff" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Middle Column - Contact */}
          <div className="footer-column footer-contact">
            <h4 className="footer-title">{t.contact.title}</h4>

            <div className="footer-contact-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a href={`mailto:${settings.email}`} className="footer-contact-link">
                {settings.email}
              </a>
            </div>

            <div className="footer-contact-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                {/* Format WhatsApp number for display */}
                +{settings.whatsapp.replace(/(\d{2})(\d{3})(\d{4})(\d+)/, '$1 $2-$3-$4')}
              </a>
            </div>
          </div>

          {/* Right Column - Newsletter */}
          <div className="footer-column footer-newsletter">
            <h4 className="footer-title">{t.newsletter.title}</h4>
            <p className="footer-newsletter-subtitle">
              {t.newsletter.subtitle}
            </p>

            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <div className="newsletter-input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder={t.newsletter.placeholder}
                  className="newsletter-input"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="newsletter-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t.newsletter.submitting : t.newsletter.button}
                </button>
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="newsletter-message success">
                  {t.newsletter.success}
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="newsletter-message error">
                  {t.newsletter.error}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;