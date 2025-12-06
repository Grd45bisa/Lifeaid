import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductBySlug } from '../data/productData';
import './styles/ProductDetailPage.css';
import Accessories from '../Components/Accessories';
import WhatsAppBubbleChat from '../Components/WhatsAppBubbleChat';

// Language type
type Language = 'id' | 'en';

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

// Format Rupiah
const formatRupiah = (angka: number): string => {
  const numberString = angka.toString();
  const sisa = numberString.length % 3;
  let rupiah = numberString.substr(0, sisa);
  const ribuan = numberString.substr(sisa).match(/\d{3}/g);

  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }
  return 'Rp' + rupiah;
};

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Get product data
  const product = getProductBySlug(slug || '');

  const [currentLang, setCurrentLang] = useState<Language>(detectLanguage());
  const [activeTab, setActiveTab] = useState<'detail'>('detail');
  const [activeThumbnail, setActiveThumbnail] = useState(0);
  const [mainImage, setMainImage] = useState(product?.img || '');
  const [showPrimaryDropdown, setShowPrimaryDropdown] = useState(false);

  const primaryDropdownRef = useRef<HTMLDivElement>(null);

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

  // Set initial main image
  useEffect(() => {
    if (product) {
      setMainImage(product.img);
    }
  }, [product]);

  // Redirect if product not found
  useEffect(() => {
    if (!product) {
      navigate('/');
    }
  }, [product, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (primaryDropdownRef.current && !primaryDropdownRef.current.contains(event.target as Node)) {
        setShowPrimaryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!product) {
    return null;
  }

  const handleThumbnailClick = (index: number, imgUrl: string) => {
    setActiveThumbnail(index);
    setMainImage(imgUrl);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out this product: ${product.title[currentLang]}\n${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(product.title[currentLang]);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert(currentLang === 'id' ? 'Link berhasil disalin!' : 'Link copied successfully!');
    }).catch(() => {
      alert(currentLang === 'id' ? 'Gagal menyalin link' : 'Failed to copy link');
    });
  };

  const handleBuyShopee = () => {
    // Replace with actual Shopee link
    window.open('https://shopee.co.id/Lifeaid', '_blank');
    setShowPrimaryDropdown(false);
  };

  const handleBuyTokopedia = () => {
    // Replace with actual Tokopedia link
    window.open('https://www.tokopedia.com/lifeaid', '_blank');
    setShowPrimaryDropdown(false);
  };

  const handleBuyWhatsApp = () => {
    const message = encodeURIComponent(
      `Halo, saya tertarik dengan produk ${product.title[currentLang]} (${product.price}). Mohon informasi lebih lanjut.`
    );
    window.open(`https://wa.me/6281219751605?text=${message}`, '_blank');
    setShowPrimaryDropdown(false);
  };

  return (
    <section className="product-detail-page">
      <div className="page-container">
        {/* LEFT: GALLERY */}
        <div className="product-gallery">
          <div className="product-main-image">
            <img src={mainImage} alt={product.title[currentLang]} />
          </div>

          <div className="thumb-list">
            {product.thumbnails.map((thumb, index) => (
              <div
                key={index}
                className={`thumb-item ${activeThumbnail === index ? 'active' : ''}`}
                onClick={() => handleThumbnailClick(index, thumb)}
              >
                <img src={thumb} alt={`${product.title[currentLang]} ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE: INFO */}
        <div className="product-info">
          <h1 className="product-title">{product.title[currentLang]}</h1>

          <div className="product-price">
            <span className="price-current">{product.price}</span>
          </div>

          <div className="tabs">
            <div
              className={`tab-btn ${activeTab === 'detail' ? 'active' : ''}`}
              onClick={() => setActiveTab('detail')}
            >
              {currentLang === 'id' ? 'Detail Produk' : 'Product Details'}
            </div>
          </div>

          <div className="tab-content">
            <div className={`tab-pane ${activeTab === 'detail' ? 'active' : ''}`}>
              {currentLang === 'id' ? 'Kondisi' : 'Condition'}: <strong>{product.condition[currentLang]}</strong> <br />
              {currentLang === 'id' ? 'Min. Pemesanan' : 'Min. Order'}: <strong>{product.minOrder[currentLang]}</strong> <br />
              {currentLang === 'id' ? 'Etalase' : 'Category'}: <strong>{product.category[currentLang]}</strong>
              <br /><br />
              {product.description[currentLang] && (
                <div className="description-container">
                  <div
                    className="description-text"
                    dangerouslySetInnerHTML={{ __html: product.description[currentLang].replace(/\n/g, '<br/>') }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: CHECKOUT CARD */}
        <aside className="checkout-card">
          <div className="checkout-title">
            {currentLang === 'id' ? 'Ringkasan Pesanan' : 'Order Summary'}
          </div>

          <div className="selected-variant">
            <div className="selected-variant-thumb">
              <img src={product.img} alt={product.title[currentLang]} />
            </div>
            <div>
              <div className="selected-color-name">{product.title[currentLang]}</div>
            </div>
          </div>

          <div className="subtotal-row">
            <span>{currentLang === 'id' ? 'Subtotal' : 'Subtotal'}</span>
            <span className="subtotal-value">{formatRupiah(product.priceNumeric)}</span>
          </div>

          {/* Primary Dropdown Button */}
          <div className="dropdown-wrapper" ref={primaryDropdownRef}>
            <button
              className="btn btn-primary"
              onClick={() => setShowPrimaryDropdown(!showPrimaryDropdown)}
            >
              {currentLang === 'id' ? 'Beli Sekarang' : 'Buy Now'}
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className={`dropdown-menu ${showPrimaryDropdown ? 'show' : ''}`}>
              <button className="dropdown-item" onClick={handleBuyShopee}>
                <svg height="20" viewBox="0 0 109.59 122.88" xmlns="http://www.w3.org/2000/svg">
                  <path d="M74.98 91.98C76.15 82.36 69.96 76.22 53.6 71c-7.92-2.7-11.66-6.24-11.57-11.12.33-5.4 5.36-9.34 12.04-9.47 4.63.09 9.77 1.22 14.76 4.56.59.37 1.01.32 1.35-.2.46-.74 1.61-2.53 2-3.17.26-.42.31-.96-.35-1.44-.95-.7-3.6-2.13-5.03-2.72-3.88-1.62-8.23-2.64-12.86-2.63-9.77.04-17.47 6.22-18.12 14.47-.42 5.95 2.53 10.79 8.86 14.47 1.34.78 8.6 3.67 11.49 4.57 9.08 2.83 13.8 7.9 12.69 13.81-1.01 5.36-6.65 8.83-14.43 8.93-6.17-.24-11.71-2.75-16.02-6.1-.11-.08-.65-.5-.72-.56-.53-.42-1.11-.39-1.47.15-.26.4-1.92 2.8-2.34 3.43-.39.55-.18.86.23 1.2 1.8 1.5 4.18 3.14 5.81 3.97 4.47 2.28 9.32 3.53 14.48 3.72 3.32.22 7.5-.49 10.63-1.81 5.6-2.39 9.22-7.14 9.95-13.08M54.79 7.18c-10.59 0-19.22 9.98-19.62 22.47h39.25c-.41-12.49-9.04-22.47-19.63-22.47m40.2 115.7h-.41l-80.82-.01c-5.5-.21-9.54-4.66-10.09-10.19l-.05-1-3.61-79.5C0 32.12 0 32.06 0 32a2.35 2.35 0 0 1 2.3-2.35h25.48C28.41 13.15 40.26 0 54.79 0S81.18 13.15 81.8 29.65h25.44c1.3 0 2.35 1.05 2.35 2.35v.12l-3.96 79.81-.04.68c-.47 5.6-5 10.12-10.6 10.27" style={{ fill: '#ee4d2d' }} />
                </svg> {currentLang === 'id' ? 'Beli di Shopee' : 'Buy on Shopee'}
              </button>
              <button className="dropdown-item" onClick={handleBuyTokopedia}>
                <svg height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="512" cy="512" r="512" style={{ fill: '#42b549' }} />
                  <path d="M620.4 326.4c-5.6-56.4-51.8-100.3-108-100.3-56.1 0-102.3 43.5-108.7 99.6l29.1 2.3c5.2-40.5 38.6-71.8 79.4-71.8s74.6 31.8 78.9 72.8zm94.3-6.5c-32 0-63.9-1.7-95.8 1.1l-29.1 2.6c-25.9 2.3-54.3 8.9-77.6 20.9-24.8-12.9-50.2-19.8-77.9-22l-29.1-2.3c-32-2.6-63.8-.4-95.8-.4h-17.5v418.3h294.4c80.4 0 146.1-67.7 146.1-150.5V319.9zM331.4 496.1c0-48.6 38.3-88.1 85.5-88.1s85.5 39.4 85.5 88.1c0 48.6-38.3 88.1-85.5 88.1-47.3 0-85.5-39.5-85.5-88.1M512 632.9c-12.7-13.9-25.4-27.7-38.1-41.5 8-14.2 23.1-21.3 38.1-21.2 15 0 30.1 7 38.1 21.2-12.7 13.8-25.4 27.6-38.1 41.5m95.1-48.7c-47.2 0-85.5-39.4-85.5-88.1 0-48.6 38.3-88.1 85.5-88.1s85.5 39.4 85.5 88.1c0 48.6-38.3 88.1-85.5 88.1M427.6 441.4c30.5 0 55.2 25.5 55.2 56.8 0 31.4-24.7 56.9-55.2 56.9s-55.2-25.5-55.2-56.9c0-10.5 2.8-20.3 7.6-28.7 3.9 10 13.5 17.1 24.7 17.1 14.7 0 26.6-12.2 26.6-27.4 0-6.8-2.4-13-6.4-17.8zm168.8 0c30.5 0 55.2 25.5 55.2 56.8 0 31.4-24.7 56.9-55.2 56.9s-55.2-25.5-55.2-56.9c0-10.5 2.7-20.3 7.5-28.7 4 10 13.5 17.1 24.7 17.1 14.7 0 26.6-12.2 26.6-27.4 0-6.8-2.4-13-6.4-17.8z" style={{ fill: '#fff' }} />
                </svg> {currentLang === 'id' ? 'Beli di Tokopedia' : 'Buy on Tokopedia'}
              </button>
              <button className="dropdown-item" onClick={handleBuyWhatsApp}>
                <svg height="20" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xmlSpace="preserve">
                  <path fillRule="evenodd" clipRule="evenodd" d="M20.5 3.5C18.25 1.25 15.2 0 12 0 5.41 0 0 5.41 0 12c0 2.11.65 4.11 1.7 5.92L0 24l6.33-1.55C8.08 23.41 10 24 12 24c6.59 0 12-5.41 12-12 0-3.19-1.24-6.24-3.5-8.5M12 22c-1.78 0-3.48-.59-5.01-1.49l-.36-.22-3.76.99 1-3.67-.24-.38C2.64 15.65 2 13.88 2 12 2 6.52 6.52 2 12 2c2.65 0 5.2 1.05 7.08 2.93S22 9.35 22 12c0 5.48-4.53 10-10 10m5.5-7.55c-.3-.15-1.77-.87-2.04-.97s-.47-.15-.67.15-.77.97-.95 1.17c-.17.2-.35.22-.65.07s-1.26-.46-2.4-1.48c-.89-.79-1.49-1.77-1.66-2.07s-.02-.46.13-.61c.13-.13.3-.35.45-.52s.2-.3.3-.5.05-.37-.02-.52c-.08-.15-.68-1.62-.93-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01s-.52.08-.8.37c-.27.3-1.04 1.03-1.04 2.5s1.07 2.89 1.22 3.09 2.11 3.22 5.1 4.51c.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42s.25-1.3.17-1.42c-.07-.13-.27-.21-.57-.36" fill="#25d366" />
                </svg> {currentLang === 'id' ? 'Beli di WhatsApp' : 'Buy on WhatsApp'}
              </button>
            </div>
          </div>

          <div className="card-footer-actions">
            <div className="share-title">
              {currentLang === 'id' ? 'Bagikan Produk' : 'Share Product'}
            </div>
            <div className="social-buttons">
              <button
                className="social-btn whatsapp"
                onClick={shareToWhatsApp}
                title="Share to WhatsApp"
              >
                <svg height="20" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" xmlSpace="preserve">
                  <path fillRule="evenodd" clipRule="evenodd" d="M20.5 3.5C18.25 1.25 15.2 0 12 0 5.41 0 0 5.41 0 12c0 2.11.65 4.11 1.7 5.92L0 24l6.33-1.55C8.08 23.41 10 24 12 24c6.59 0 12-5.41 12-12 0-3.19-1.24-6.24-3.5-8.5M12 22c-1.78 0-3.48-.59-5.01-1.49l-.36-.22-3.76.99 1-3.67-.24-.38C2.64 15.65 2 13.88 2 12 2 6.52 6.52 2 12 2c2.65 0 5.2 1.05 7.08 2.93S22 9.35 22 12c0 5.48-4.53 10-10 10m5.5-7.55c-.3-.15-1.77-.87-2.04-.97s-.47-.15-.67.15-.77.97-.95 1.17c-.17.2-.35.22-.65.07s-1.26-.46-2.4-1.48c-.89-.79-1.49-1.77-1.66-2.07s-.02-.46.13-.61c.13-.13.3-.35.45-.52s.2-.3.3-.5.05-.37-.02-.52c-.08-.15-.68-1.62-.93-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01s-.52.08-.8.37c-.27.3-1.04 1.03-1.04 2.5s1.07 2.89 1.22 3.09 2.11 3.22 5.1 4.51c.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42s.25-1.3.17-1.42c-.07-.13-.27-.21-.57-.36" fill="currentColor" />
                </svg>
              </button>
              <button
                className="social-btn facebook"
                onClick={shareToFacebook}
                title="Share to Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1">
                  <path d="M11.991 1a10.614 10.614 0 0 0-11 10.7 10.46 10.46 0 0 0 3.414 7.866l.052 1.69A1.8 1.8 0 0 0 6.256 23a1.8 1.8 0 0 0 .726-.152L8.903 22a12 12 0 0 0 3.088.4 10.615 10.615 0 0 0 11.001-10.7 10.615 10.615 0 0 0-11-10.7m0 19.4a10 10 0 0 1-2.635-.35 1.8 1.8 0 0 0-1.196.092l-1.714.756-.045-1.493A1.8 1.8 0 0 0 5.8 18.13a8.5 8.5 0 0 1-2.81-6.43 8.66 8.66 0 0 1 9-8.7 8.705 8.705 0 1 1 0 17.4m3.735-11.815-2.313 2.755-3.347-2.056a1 1 0 0 0-1.289.21l-3.05 3.636a1 1 0 1 0 1.53 1.285l2.499-2.975 3.347 2.056a1 1 0 0 0 1.289-.21l2.866-3.415a1 1 0 1 0-1.531-1.286" fill="currentColor" />
                </svg>
              </button>
              <button
                className="social-btn twitter"
                onClick={shareToTwitter}
                title="Share to Twitter"
              >
                <svg width="20" height="20" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284zM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854z" fill="currentColor" stroke="currentColor" /></svg>
              </button>
              <button
                className="social-btn copy"
                onClick={copyLink}
                title="Copy Link"
              >
                <svg width="20" height="20" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve">
                  <path d="M84 128.6H54.6C36.6 128.6 22 114 22 96c0-9 3.7-17.2 9.6-23.1s14.1-9.6 23.1-9.6H84m24 65.3h29.4c9 0 17.2-3.7 23.1-9.6s9.6-14.1 9.6-23.1c0-18-14.6-32.6-32.6-32.6H108M67.9 96h56.2" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 12, strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 10 }} />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      </div>
      <Accessories />
      <WhatsAppBubbleChat />
    </section>
  );
};

export default ProductDetailPage;
