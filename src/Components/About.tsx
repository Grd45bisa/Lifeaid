import React, { useState, useEffect } from 'react';
import './styles/About.css';

// Language type
type Language = 'id' | 'en';

// Translations
const translations = {
  id: {
    badge: 'TENTANG KAMI',
    title: 'Solusi Alat Bantu Angkat Pasien & Perawatan Lansia',
    subtitle: 'LifeAid menyediakan alat bantu angkat pasien, lift pasien listrik, dan peralatan medis rumah yang aman, mudah digunakan, dan terjangkau untuk perawatan lansia di rumah.',
    storyTitle: 'Kisah LifeAid: Dari Keluarga untuk Keluarga',
    storyText1: 'Merawat orang tua atau keluarga sakit di rumah sering kali melelahkan dan berisiko cedera saat mengangkat atau memindahkan. Kami menghadirkan solusi lift pasien dan alat bantu yang mengurangi beban dan risiko tersebut.',
    storyText2: 'LifeAid lahir untuk membantu keluarga Indonesia mendapatkan lift pasien listrik, sling, dan aksesori medis yang mudah dipakai tanpa perlu keahlian khusus, sehingga perawatan di rumah menjadi lebih aman dan nyaman.',
    storyText3: 'Setiap produk kami diuji kualitasnya. Kami pastikan lift pasien dan aksesori yang dijual aman, tahan lama, harga wajar, dan benar-benar membantu kegiatan perawatan sehari-hari.',
    offeringsTitle: 'Produk & Layanan Kami',
    offering1Title: 'Lift Pasien Listrik',
    offering1Desc: 'Lift pasien bertenaga baterai untuk transfer aman dan mudah — ideal untuk perawatan lansia dan pasien di rumah.',
    offering2Title: 'Aksesoris Lift & Sling',
    offering2Desc: 'Sling dari standar sampai premium, baterai cadangan, dan suku cadang berkualitas untuk mendukung penggunaan lift pasien.',
    offering3Title: 'Pengiriman Door-to-Door Seluruh Indonesia',
    offering3Desc: 'Pengiriman cepat ke rumah Anda, dari Sabang sampai Merauke — packing aman dan tracking pengiriman.',
    offering4Title: 'Garansi & Dukungan Teknis',
    offering4Desc: 'Garansi resmi, layanan purna jual, dan konsultasi gratis lewat WhatsApp untuk bantuan pemasangan dan pemilihan produk.',
   },
  en: {
    badge: 'ABOUT US',
    title: 'Patient Lifts & Home Elderly Care Solutions',
    subtitle: 'LifeAid offers patient lifts, electric lifts, and home medical equipment that are safe, easy to use, and affordable for at-home elderly care.',
    storyTitle: 'The Story of LifeAid: Family to Family',
    storyText1: 'Caring for elderly or sick family members at home can be tiring and risky when lifting or transferring. We provide patient lifts and aids that reduce effort and injury risk.',
    storyText2: 'LifeAid was created to help Indonesian families access electric patient lifts, slings, and medical accessories that anyone can use without special training, making home care safer and more comfortable.',
    storyText3: 'We test every product to ensure quality. Our patient lifts and accessories are durable, reasonably priced, and designed to truly assist daily caregiving tasks.',
    offeringsTitle: 'Products & Services',
    offering1Title: 'Electric Patient Lifts',
    offering1Desc: 'Battery-powered patient lifts for safe, easy transfers — ideal for elderly and home care.',
    offering2Title: 'Lift Accessories & Slings',
    offering2Desc: 'Slings from standard to premium, spare batteries, and high-quality parts to support your patient lift.',
    offering3Title: 'Nationwide Delivery Across Indonesia',
    offering3Desc: 'Door-to-door delivery from Sabang to Merauke with secure packaging and tracking.',
    offering4Title: 'Warranty & Technical Support',
    offering4Desc: 'Official warranty, after-sales service, and free WhatsApp consultation for setup and product selection.',
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

const About: React.FC = () => {
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

  const offerings = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
      ),
      title: t.offering1Title,
      description: t.offering1Desc
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" version="1.1" id="Capa_1" viewBox="0 0 415.881 415.881" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve">
  <g>
    <g>
      <path d="M179.641,189.565c2.455,0,4.869,0.193,7.223,0.561l36.999-36.998c-13.193-7.048-28.249-11.051-44.221-11.051    c-51.92,0-94.162,42.241-94.162,94.162c0,51.921,42.242,94.162,94.162,94.162s94.161-42.241,94.161-94.162    c0-15.973-4.002-31.027-11.051-44.22l-36.997,36.999c0.367,2.354,0.56,4.766,0.56,7.222c0,25.736-20.937,46.674-46.672,46.674    c-25.736,0-46.674-20.938-46.674-46.674S153.905,189.565,179.641,189.565z"></path>
      <path d="M290.454,164.316c13.488,20.712,21.338,45.417,21.338,71.922c0,72.87-59.281,132.153-132.15,132.153    c-72.869,0-132.153-59.283-132.153-132.152s59.283-132.153,132.152-132.153c26.508,0,51.211,7.851,71.924,21.34l34.104-34.104    c-29.738-21.817-66.402-34.724-106.027-34.724c-99.055,0-179.641,80.587-179.641,179.641c0,99.054,80.586,179.642,179.641,179.642    c99.054,0,179.638-80.588,179.638-179.642c0-39.626-12.904-76.29-34.721-106.026L290.454,164.316z"></path>
      <path d="M415.415,56.64c-1.119-3.539-4.119-6.157-7.775-6.793l-35.449-6.157l-6.156-35.45c-0.637-3.656-3.256-6.655-6.793-7.774    c-3.537-1.122-7.402-0.178-10.027,2.447l-27.412,27.411c-1.863,1.864-2.91,4.393-2.912,7.029l0.002,40.896l-148.1,148.096    c-5.176,5.177-5.176,13.566,0,18.743c5.178,5.175,13.568,5.177,18.744,0L337.632,96.991h40.896c2.635,0,5.164-1.047,7.027-2.911    l27.412-27.413C415.593,64.044,416.536,60.177,415.415,56.64z"></path>
    </g>
  </g>
</svg>
      ),
      title: t.offering2Title,
      description: t.offering2Desc
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Layer_1" viewBox="0 0 512 512" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve">
  <path fill="currentColor" d="M491.9,156.3c-19.4-46-51.9-85-92.7-112.6C358.3,16.1,309,0,256,0c-35.3,0-69,7.2-99.7,20.1c-46,19.4-85,51.9-112.6,92.7  C16.1,153.7,0,203,0,256c0,35.3,7.2,69,20.1,99.7c19.4,46,51.9,85,92.7,112.6C153.7,495.9,203,512,256,512c35.3,0,69-7.2,99.7-20.1  c46-19.4,85-51.9,112.6-92.7C495.9,358.3,512,309,512,256C512,220.7,504.8,187,491.9,156.3z M123.2,81.3c-1,11.8,2.5,23.7,9.9,33.1  c6.8,8.7,17.6,11.5,18.1,23.4c0.5,11.4-1.3,17.3-8.8,25.3c-3.2,3.4-5.5,8.3-8.8,11.5c-4,3.9-2.5,2.7-8.8,3.8  c-11.8,2-21.9,5.1-33.4,8.2c-18,5-20.6-22.4-28.1-35.8C78.2,123.6,98.7,99.9,123.2,81.3z M74,378.8c-23.7-35-37.5-77.2-37.5-122.7  c0-19.9,2.7-39.2,7.6-57.6c8.4,18.1,20.6,33.7,28.9,52.2c10.7,23.8,39.5,17.2,52.2,38.1c11.3,18.5-0.8,42,7.7,61.3  c6.1,14.1,20.6,17.1,30.5,27.4c10.2,10.4,10,24.6,11.5,38.1c1.8,15.9,4.6,31.7,8.5,47.2c0,0.2,0.1,0.3,0.1,0.5  c-4.4-1.5-8.7-3.2-12.9-5C131.2,441.7,97.7,413.8,74,378.8z M169.8,290.1c3.2-0.7,16.2,1.6,20.2,2.4c6.3,1.3,9.7,5.2,14.7,9.1  c13,10.4,27.3,18.5,41.8,26.4c11.2,6.2,14.5,14.1,7.3,27c-6.9,12.2-22.1,20.4-31.9,30.2c-2.7,2.6-8.3,11.8-11.7,9.8  c-2.4-1.4-3.2-13.3-4.1-16c-4.5-13.7-13.2-25.7-24.8-34.2c-3.6-2.7-12.4-6.2-14.5-9.9c-2.3-4-0.2-13.6-0.1-17.9  c0.1-6.4-2.8-17-1.2-22.9C167.3,287.4,163.8,291.4,169.8,290.1z M378.7,438c-35,23.7-77.2,37.5-122.7,37.5  c-12.5,0-24.7-1.1-36.7-3.1c0.1-3.1,0.2-6,0.5-8c2.8-18.2,11.9-35.9,24.1-49.5c12.1-13.4,28.7-22.5,39-37.7  c10.2-14.9,13.2-34.9,9-52.3c-6.1-25.6-40.9-34.2-59.7-48.1c-10.8-8-20.4-20.4-34.6-21.4c-6.5-0.5-12,0.9-18.5-0.7  c-5.9-1.5-10.6-4.7-16.9-3.9c-11.8,1.6-19.3,14.2-32,12.5c-12.1-1.6-24.5-15.7-27.2-27.2c-3.5-14.8,8.2-19.6,20.7-20.9  c5.2-0.5,11.1-1.1,16.1,0.8c6.6,2.5,9.7,8.9,15.7,12.2c11.1,6.1,13.4-3.6,11.7-13.5c-2.5-14.8-5.5-20.8,7.7-31  c9.1-7,17-12.1,15.5-24.7c-0.9-7.4-4.9-10.8-1.1-18.1c2.9-5.6,10.7-10.7,15.9-14c13.2-8.6,56.7-8,39-32.2  c-5.2-7.1-14.9-19.8-24-21.5c-11.4-2.2-16.5,10.6-24.5,16.2c-8.2,5.8-24.3,12.4-32.5,3.4c-11.1-12.1,7.3-16.1,11.4-24.5  c1.9-3.9,0-9.5-3.4-14.8c4.1-1.7,8.2-3.3,12.4-4.8c2.7,1.9,5.6,3.2,9.2,3.4c7.6,0.5,14.9-3.6,21.5,1.6c7.4,5.7,12.7,12.9,22.6,14.7  c9.5,1.7,19.6-3.8,21.9-13.6c1.5-5.9,0-12.1-1.3-18.3c29.7,0.2,58.1,6.3,83.8,17.2c12.9,5.4,25.1,12.1,36.6,19.7  c-2.3-1-5.2-1-8.8,0.7c-6.9,3.2-16.8,11.4-17.6,19.6c-0.8,9.2,12.8,10.5,19.2,10.5c9.7,0,19.6-4.3,16.4-15.6  c-1.4-5-3.3-10.3-6.5-13.3c7.3,5,14.2,10.5,20.8,16.3c-0.1,0.1-0.2,0.2-0.3,0.2c-6.6,6.9-14.2,12.3-18.7,20.6  c-3.2,5.9-6.8,8.7-13.2,10.2c-3.5,0.8-7.6,1.1-10.6,3.5c-8.3,6.8-3.5,22.4,4.3,27.1c9.9,5.9,24.6,3.1,32.1-5.3  c5.8-6.6,9.3-18.1,19.8-18.1c4.6,0,9.1,1.8,12.4,5c4.3,4.5,3.5,8.7,4.4,14.3c1.7,10,10.4,4.6,15.8-0.5c3.9,7,7.4,14.1,10.6,21.5  c-5.9,8.5-10.5,17.8-24.8,7.9c-8.5-5.9-13.7-14.5-24.4-17.1c-9.3-2.3-18.9,0.1-28.1,1.7c-10.5,1.8-22.9,2.6-30.8,10.5  c-7.7,7.6-11.7,17.9-19.9,25.5c-15.8,14.9-22.4,31.1-12.2,52.1c9.8,20.2,30.4,31.2,52.6,29.7c21.8-1.5,44.4-14.1,43.8,17.6  c-0.2,11.2,2.1,19,5.6,29.4c3.2,9.6,3,18.9,3.7,28.8c0.8,11.2,2.4,23.1,5.5,34.5C414.9,409.1,397.9,425,378.7,438z M459.4,338.5  c-0.1-2.2-0.4-4.3-0.7-6.5c-1.5-9.8-7.3-19-8.1-28.7c-1.5-18.1,1.8-32.5-12.1-47.6c-13.4-14.6-33.1-18.1-52-15.1  c-9.5,1.5-47.7,7.6-32.3-14.1c3-4.3,8.3-7.8,11.7-11.8c3-3.5,5.5-10,9-12.8c3.5-2.8,19.4-5.9,24-4.5c4.6,1.4,9.3,8,13.3,10.9  c7.3,5.5,15.9,9.2,24.9,10.7c8.8,1.3,23.2-1.1,33.9-7c2.9,14.2,4.4,28.9,4.4,44C475.4,285.2,469.7,313.1,459.4,338.5z"></path>
</svg>
      ),
      title: t.offering3Title,
      description: t.offering3Desc
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Capa_1" viewBox="0 0 326.177 326.177" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve">
  <g>
    <path fill="currentColor" d="M309.764,45.916c-5.08-4.058-10.497-5.156-16.475-2.127c-11.623,5.885-19.14,16.807-27.174,26.684   c-3.535,4.357-16.508,13.929-9.6,0.995c3.285-6.146,7.794-11.77,11.776-17.465c13.543-19.358,14.968-47.918-15.648-50.426   c-35.229-2.883-63.991,19.341-75.369,51.736c-4.242,12.086-3.432,25.656-1.561,38.052c1.05,6.951,6.63,11.515,0.979,17.895   c-3.666,4.139-7.751,7.887-11.841,11.645c-13.739-14-24.742-29.61-29.812-48.087c19.581-14.767,26.488-42.588,3.992-60.82   c-20.609-16.698-47.614,0.212-55.946,21.783c-20.516,3.628-30.508,9.856-40.238,28.251C25.644,64.778,11.932,73.122,3.11,90.386   c-9.812,19.194,5.825,35.767,16.072,51.666c9.54,14.805,24.71,31.737,44.029,24.579c8.86-3.285,15.126-11.661,18.819-19.978   c1.681-3.78,2.616-8.115,2.665-12.281c0.005-1.186,0.044-2.371,0.054-3.552c13.424,11.455,26.412,23.818,39.052,36.714   c-19.749,25.982-40.439,50.779-62.582,74.901c-21.299,23.203-16.736,52.525,6.69,72.394c21.153,17.943,49.99,2.932,63.621-17.062   c15.665-22.985,32.379-45.258,48.788-67.744c7.468,8.751,14.854,17.492,22.115,26.107c16.11,19.129,28.299,40.336,52.161,50.018   c17.557,7.125,34.652-9.551,43.942-21.745c32.085-42.109-29.175-74.134-54.478-96.81c-5.156-4.618-10.715-9.154-16.497-13.679   c1.267-2.279,2.312-4.77,3.214-7.348c3.307-9.453,0.615-8.148,12.145-4.172c7,2.41,13.462,3.824,20.777,4.694   c25.161,2.997,47.907-29.121,55.674-48.924C328.502,94.933,331.188,63.038,309.764,45.916z M82.139,291.364   c-23.448-19.885,29.491-64.012,41.397-78.948c6.119-7.675,12.069-15.48,17.976-23.312c6.402,7.413,12.934,14.724,19.722,21.773   C142.964,238.687,100.017,306.529,82.139,291.364z M258.365,234.983c6.07,4.814,11.988,9.507,17.666,14.778   c18.188,16.894-16.692,32.656-31.291,15.79c-16.595-19.162-31.487-39.417-49.18-57.67c-1.719-1.773-3.389-3.595-5.086-5.39   c-0.604-1.071-1.305-2.072-2.148-2.883c-2.997-2.894-5.907-5.88-8.79-8.898c-7.593-8.36-15.088-16.807-22.594-25.237   c-1.365-1.594-2.73-3.182-4.09-4.776c-0.272-0.348-0.56-0.691-0.87-1.017c-0.511-0.598-1.023-1.202-1.539-1.795   c-0.68-0.794-1.392-1.463-2.121-2.029c-14.588-16.138-29.594-31.862-46.314-45.987c-12.048-16.007-43.377-17.144-44.225,7.691   c-0.174,5.167,1.702,28.501-6.886,21.038c-6.184-5.368-10.318-13.396-14.517-20.309c-2.997-4.939-5.831-9.975-8.806-14.936   c0.337-0.848,0.734-2.002,1.191-3.514c3.737-6.951,10.019-9.975,18.841-9.061c5.657,0.8,12.613-0.305,15.354-6.249   c9.094-19.749,13.331-20.739,34.718-23.676c6.021-0.827,9.801-7.664,9.981-13.114c0.761-22.877,36.328-3.525,8.507,7.462   c-7.571,2.991-10.666,8.746-9.497,16.731c5.08,34.674,23.339,55.582,49.381,78.312   C189.196,179.162,223.908,207.663,258.365,234.983z M288.1,120.638c-6.304,10.666-18.694,21.114-31.971,17.563   c-7.968-2.132-17.617-8.028-26.178-6.891c-13.685,1.817-20.288,8.545-23.861,21.473c-3.421-2.535-6.619-5.488-9.763-8.18   c-2.671-2.284-5.254-4.661-7.843-7.033c5.912-5.776,11.661-11.672,16.573-18.515c7.723-10.764-0.723-22.208-3.111-32.917   c-4.721-21.153,7.968-44.182,27.571-52.433c5.363-2.252,24.498-8.278,18.107,2.361c-3.59,5.972-7.968,11.52-11.863,17.291   c-11.243,16.638-15.572,47.945,10.797,54.374c26.14,6.369,35.256-18.455,50.757-33.309   C302.851,88.602,295.182,108.666,288.1,120.638z"></path>
  </g>
</svg>
      ),
      title: t.offering4Title,
      description: t.offering4Desc
    }
  ];

  return (
    <section className="about" id="about">
      <div className="about-header">
        <p className="about-badge">{t.badge}</p>
        <h2 className="about-title">{t.title}</h2>
        <p className="about-subtitle">{t.subtitle}</p>
      </div>

      <div className="about-container">
        <div className="about-image">
          <img
            src="/About.webp"
            alt={currentLang === 'id' 
              ? 'Alat bantu angkat pasien LifeAid' 
              : 'LifeAid patient lift aid'}
            className="about-image-main"
            loading="lazy"
          />
        </div>

        <div className="about-content">
          <h3 className="about-content-title">{t.storyTitle}</h3>

          <p className="about-text">{t.storyText1}</p>
          <p className="about-text">{t.storyText2}</p>
          <p className="about-text">{t.storyText3}</p>
        </div>
      </div>

      <div className="about-offerings">
        <h2 className="offerings-title">{t.offeringsTitle}</h2>

        <div className="offerings-grid">
          {offerings.map((offering, index) => (
            <div className="offering-card" key={index}>
              <div className="offering-icon">
                {offering.icon}
              </div>
              <h4 className="offering-title">{offering.title}</h4>
              <p className="offering-description">
                {offering.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;