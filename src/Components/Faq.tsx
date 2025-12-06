import React, { useState, useEffect } from 'react';
import './styles/FAQ.css';

// Language type
type Language = 'id' | 'en';

// Translations
const translations = {
  id: {
    title: 'Pertanyaan yang Sering Diajukan (FAQ) - LifeAid',
    subtitle: 'Temukan jawaban atas pertanyaan yang paling sering diajukan tentang produk dan layanan kami.',
    faqs: [
      {
        question: 'Apa itu Patient Lifter dan untuk siapa?',
        answer: 'Alat Pengangkat Pasien adalah alat bantu mekanis yang dirancang untuk mengangkat dan memindahkan pasien dengan mobilitas terbatas dengan aman dan mudah. Alat ini ideal untuk:',
        listItems: [
          'Orang lanjut usia yang mengalami kesulitan berdiri atau berjalan.',
          'Pasien pasca stroke atau lumpuh.',
          'Individu dengan disabilitas atau kelemahan otot.',
          'Siapa pun yang memerlukan bantuan untuk pindah dari tempat tidur ke kursi roda, toilet, atau mobil.'
        ],
        conclusion: 'Tujuan utamanya adalah untuk memastikan keselamatan pasien saat mencegah risiko cedera punggung bagi pengasuh atau anggota keluarga.'
      },
      {
        question: 'Bagaimana saya mengetahui apakah pengangkat cukup kuat untuk pasien saya?',
        answer: 'Setiap model Pengangkat Pasien Listrik kami memiliki kapasitas berat maksimum yang jelas, biasanya mendukung beban hingga 180 kg (sekitar 400 lbs). Informasi terperinci mengenai kapasitas berat untuk setiap model dapat ditemukan di halaman deskripsi produk masing-masing. Jika Anda tidak yakin, jangan ragu untuk berkonsultasi dengan tim kami melalui chat untuk memastikan Anda memilih produk yang tepat dan paling aman.',
        listItems: []
      },
      {
        question: 'Apa itu sling dan bagaimana cara memilih yang tepat?',
        answer: 'Gendongan adalah kain khusus yang digunakan bersama Patient Lifter untuk menahan pasien selama pemindahan. Memilih gendongan yang tepat sangat penting untuk kenyamanan dan keamanan. Secara umum, kami menawarkan beberapa jenis:',
        listItems: [
          'Sling Standar: Untuk keperluan umum, seperti pemindahan dari tempat tidur ke kursi roda.',
          'Gendongan Berjalan: Dirancang khusus untuk membantu latihan rehabilitasi berdiri atau berjalan.',
          'Selempang Premium: Terbuat dari bahan yang lebih nyaman dan dirancang untuk penggunaan jangka panjang untuk mencegah kulit lecet.'
        ],
        conclusion: 'Pilihan yang tepat bergantung pada kondisi spesifik pasien dan aktivitas harian. Tim kami siap membantu Anda memilih gendongan yang paling sesuai.'
      },
      {
        question: 'Apakah ada garansi dan layanan purna jual?',
        answer: 'Tentu saja. Kepercayaan Anda adalah prioritas kami. Semua unit LifeAid Electric Patient Lifter dilindungi garansi resmi 1 tahun untuk layanan dan suku cadang. Sebagai toko spesialis, kami berkomitmen untuk menyediakan dukungan dan solusi teknis bahkan setelah masa garansi berakhir, memastikan Anda merasa tenang.',
        listItems: []
      }
    ]
  },
  en: {
    title: 'Frequently Asked Questions (FAQ) - LifeAid',
    subtitle: 'Find answers to the most frequently asked questions about our products and services.',
    faqs: [
      {
        question: 'What is a Patient Lifter and who is it for?',
        answer: 'A Patient Lifter is a mechanical aid designed to lift and move patients with limited mobility safely and easily. This tool is ideal for:',
        listItems: [
          'Elderly people who have difficulty standing or walking.',
          'Post-stroke or paralyzed patients.',
          'Individuals with disabilities or muscle weakness.',
          'Anyone who needs help moving from bed to wheelchair, toilet, or car.'
        ],
        conclusion: 'The main purpose is to ensure patient safety while preventing the risk of back injury to caregivers or family members.'
      },
      {
        question: 'How do I know if the lifter is strong enough for my patient?',
        answer: 'Each model of our Electric Patient Lifter has a clear maximum weight capacity, typically supporting loads up to 180 kg (approximately 400 lbs). Detailed information regarding weight capacity for each model can be found on the respective product description page. If you are unsure, please feel free to consult with our team via chat to ensure you choose the right and safest product.',
        listItems: []
      },
      {
        question: 'What is a sling and how to choose the right one?',
        answer: 'A sling is a special fabric used with the Patient Lifter to hold the patient during transfer. Choosing the right sling is very important for comfort and safety. In general, we offer several types:',
        listItems: [
          'Standard Sling: For general purposes, such as transferring from bed to wheelchair.',
          'Walking Sling: Specially designed to assist in standing or walking rehabilitation exercises.',
          'Premium Sling: Made from more comfortable materials and designed for long-term use to prevent skin chafing.'
        ],
        conclusion: 'The right choice depends on the patient\'s specific condition and daily activities. Our team is ready to help you choose the most suitable sling.'
      },
      {
        question: 'Is there a warranty and after-sales service?',
        answer: 'Of course. Your trust is our priority. All LifeAid Electric Patient Lifter units are protected by an official 1-year warranty for service and spare parts. As a specialist store, we are committed to providing support and technical solutions even after the warranty period ends, ensuring your peace of mind.',
        listItems: []
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

interface FAQItem {
  question: string;
  answer: string;
  listItems: string[];
  conclusion?: string;
}

const FAQ: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

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

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const t = translations[currentLang];
  const faqItems: FAQItem[] = t.faqs;

  return (
    <section className="faq-section" id="faq">
      <div className="faq-container">
        {/* Header */}
        <div className="faq-header">
          <h2 className="faq-title">{t.title}</h2>
          <p className="faq-subtitle">{t.subtitle}</p>
        </div>

        {/* FAQ Items */}
        <div className="faq-list">
          {faqItems.map((item, index) => (
            <div 
              key={index} 
              className={`faq-item ${expandedFAQ === index ? 'active' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={expandedFAQ === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="faq-icon">
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
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span className="faq-question-text">{item.question}</span>
                <span className="faq-chevron">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>

              <div
                id={`faq-answer-${index}`}
                className="faq-answer"
                aria-hidden={expandedFAQ !== index}
              >
                <div className="faq-answer-content">
                  <p>{item.answer}</p>
                  {item.listItems && item.listItems.length > 0 && (
                    <ul className="faq-list-items">
                      {item.listItems.map((listItem, idx) => (
                        <li key={idx}>{listItem}</li>
                      ))}
                    </ul>
                  )}
                  {item.conclusion && (
                    <p className="faq-conclusion">{item.conclusion}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;