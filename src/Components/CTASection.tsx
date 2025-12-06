import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import emailjs from '@emailjs/browser';
import './styles/CTASection.css';

// Language type
type Language = 'id' | 'en';

// Translations
const translations = {
  id: {
    title: 'Siap Memberikan Perawatan Terbaik untuk Orang Tercinta Anda?',
    description: 'Jangan tunda lagi. Hubungi tim ahli kami sekarang untuk konsultasi gratis dan temukan solusi mobilitas yang tepat. Kami siap membantu 24/7 dengan layanan profesional dan berpengalaman.',
    contactNow: 'Hubungi Sekarang',
    viewCatalog: 'Lihat Katalog Lengkap',
    formTitle: 'Dapatkan Konsultasi Gratis',
    name: 'Nama',
    email: 'Email',
    phone: 'Nomor Telepon',
    comment: 'Komentar',
    submit: 'Kirim',
    submitting: 'Mengirim...',
    required: 'wajib diisi',
    successMessage: 'Terima kasih! Pesan Anda telah terkirim ke email kami.',
    errorMessage: 'Terjadi kesalahan. Silakan coba lagi.'
  },
  en: {
    title: 'Ready to Provide the Best Care for Your Loved Ones?',
    description: 'Don\'t wait any longer. Contact our expert team now for a free consultation and find the right mobility solution. We\'re ready to help 24/7 with professional and experienced service.',
    contactNow: 'Contact Now',
    viewCatalog: 'View Complete Catalog',
    formTitle: 'Get Free Consultation',
    name: 'Name',
    email: 'Email',
    phone: 'Phone Number',
    comment: 'Comment',
    submit: 'Submit',
    submitting: 'Submitting...',
    required: 'required',
    successMessage: 'Thank you! Your message has been sent to our email.',
    errorMessage: 'An error occurred. Please try again.'
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

interface FormData {
  name: string;
  email: string;
  phone: string;
  comment: string;
}

// =============================================
// EMAILJS CONFIGURATION
// Ganti dengan credentials kamu dari EmailJS.com
// =============================================
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_ovo0bkw',      // Contoh: 'service_abc123'
  TEMPLATE_ID: 'template_dgpejqd',    // Contoh: 'template_xyz456'
  PUBLIC_KEY: '-k0Z6rJV5VsKb-VXV'       // Contoh: 'abcdef123456'
};

const CTASection: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    comment: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Prepare template parameters
    const templateParams = {
      to_name: 'Admin',                           // Nama penerima
      from_name: formData.name,                   // Nama pengirim
      from_email: formData.email,                 // Email pengirim
      phone: formData.phone || '-',               // Nomor telepon
      message: formData.comment || '-',           // Pesan/komentar
      language: currentLang === 'id' ? 'Bahasa Indonesia' : 'English',
      reply_to: formData.email                    // Email untuk reply
    };

    try {
      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Email sent successfully!', result.status, result.text);

      // Success - Reset form
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        comment: ''
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);

    } catch (error) {
      console.error('❌ Failed to send email:', error);
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
    <section className="cta-section" id="contact">
      <div className="cta-container">
        <div className="cta-content">
          {/* Left Content */}
          <div className="cta-text">
            <h2 className="cta-title">
              {t.title}
            </h2>
            <p className="cta-description">
              {t.description}
            </p>

            {/* CTA Buttons */}
            <div className="cta-buttons">
              <button className="cta-btn cta-btn-primary" onClick={() => window.open('https://wa.me/6281219751605', '_blank')}>
                {t.contactNow}
              </button>
            </div>
          </div>

          {/* Right Form */}
          <div className="cta-form-wrapper">
            <div className="cta-form-card">
              <h3 className="form-title">{t.formTitle}</h3>

              <form onSubmit={handleSubmit} className="cta-form">
                {/* Name Field */}
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    {t.name} <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t.name}
                    className="form-input"
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    {t.email} <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t.email}
                    className="form-input"
                    required
                  />
                </div>

                {/* Phone Field */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t.phone}
                    className="form-input"
                  />
                </div>

                {/* Comment Field */}
                <div className="form-group">
                  <label htmlFor="comment" className="form-label">
                    {t.comment}
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    placeholder={t.comment}
                    rows={4}
                    className="form-textarea"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`form-submit ${isSubmitting ? 'submitting' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t.submitting : t.submit}
                </button>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="form-message success">
                    ✅ {t.successMessage}
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="form-message error">
                    ❌ {t.errorMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;