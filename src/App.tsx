import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import './index.css';

// Lazy load pages
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';

// Lazy load pages
const Home = lazy(() => import('./Pages/Home'));
const ProductDetailPage = lazy(() => import('./Pages/ProductDetailPage'));

// Loading component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    flexDirection: 'column'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid #e3f2fd',
      borderTop: '4px solid #224570',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{
      marginTop: '20px',
      color: '#666',
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif'
    }}>
      Memuat LifeAid...
    </p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
      </Routes>
      <Footer />
    </Suspense>
  );
}

export default App;