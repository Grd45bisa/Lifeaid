import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../Components/Hero';



// Public components
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

// Lazy load components
const About = React.lazy(() => import('../Components/About'));
const WhyChooseUs = React.lazy(() => import('../Components/WhyChooseUs'));
const Product = React.lazy(() => import('../Components/Product'));
const VideoTutorial = React.lazy(() => import('../Components/VideoTutorial'));
const ProductSpecifications = React.lazy(() => import('../Components/ProductSpecifications'));
const SmartCare = React.lazy(() => import('../Components/smart-care-section'));
const FeaturesUsage = React.lazy(() => import('../Components/Featuresusage'));
const Testimonials = React.lazy(() => import('../Components/Testimonials'));
const FAQ = React.lazy(() => import('../Components/Faq'));
const CTASection = React.lazy(() => import('../Components/CTASection'));

// Section loading component
const SectionLoading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    padding: '2rem'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #e3f2fd',
      borderTop: '3px solid #224570',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const Home: React.FC = () => {
  const [, setComponentsLoaded] = React.useState(false);

  React.useEffect(() => {
    // Check if there's a section to scroll to after loading
    const scrollToSection = sessionStorage.getItem('scrollToSection');

    if (scrollToSection) {
      // Clear the stored section
      sessionStorage.removeItem('scrollToSection');

      // Function to scroll to target
      const scrollToTarget = () => {
        const targetElement = document.querySelector(scrollToSection);
        if (targetElement) {
          const offsetTop = (targetElement as HTMLElement).offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
          return true;
        }
        return false;
      };

      // Wait for components to be fully loaded
      const waitForComponents = () => {
        // First, wait for the main content to be present
        const mainElement = document.querySelector('main');
        if (!mainElement) {
          setTimeout(waitForComponents, 50);
          return;
        }

        // Use polling to detect when lazy components are loaded
        let attemptCount = 0;
        const maxAttempts = 40; // 40 attempts * 100ms = 4 seconds max wait

        const attemptScroll = () => {
          attemptCount++;

          // Try to scroll
          const success = scrollToTarget();

          // If successful or max attempts reached, stop
          if (success || attemptCount >= maxAttempts) {
            setComponentsLoaded(true);
            return;
          }

          // Otherwise, try again after a short delay
          setTimeout(attemptScroll, 100);
        };

        // Start attempting to scroll
        setTimeout(attemptScroll, 300); // Initial delay to let components start rendering
      };

      waitForComponents();
    } else {
      // No scroll needed, mark as loaded immediately
      setComponentsLoaded(true);
    }
  }, []);

  return (
    <div>
      <Helmet>
        <title>LifeAid - Solusi Alat Bantu Medis Terpercaya</title>
        <meta name="description" content="LifeAid menyediakan alat bantu medis berkualitas tinggi seperti Electric Patient Lifter untuk perawatan pasien yang lebih aman dan nyaman." />
        <meta property="og:title" content="LifeAid - Solusi Alat Bantu Medis Terpercaya" />
        <meta property="og:description" content="LifeAid menyediakan alat bantu medis berkualitas tinggi seperti Electric Patient Lifter untuk perawatan pasien yang lebih aman dan nyaman." />
        <meta property="og:image" content="/Hero.webp" />
        <meta property="og:url" content="https://lifeaidstore.com/" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navbar />
      <main>
        <Hero />
        <React.Suspense fallback={<SectionLoading />}>
          <About />
          <WhyChooseUs />
          <Product />
          <VideoTutorial />
          <ProductSpecifications />
          <SmartCare />
          <FeaturesUsage />
          <Testimonials />
          <FAQ />
          <CTASection />
        </React.Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Home;