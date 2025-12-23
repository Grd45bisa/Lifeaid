import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './index.css';

// Public components
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';

// Lazy load public pages
const Home = lazy(() => import('./Pages/Home'));
const ProductDetailPage = lazy(() => import('./Pages/ProductDetailPage'));

// Lazy load admin components
const AdminLayout = lazy(() => import('./Components/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./Pages/Admin/AdminDashboard'));
const AdminLogin = lazy(() => import('./Pages/Admin/AdminLogin'));
const ProtectedRoute = lazy(() => import('./Components/Admin/ProtectedRoute'));
const AdminChatHistory = lazy(() => import('./Pages/Admin/AdminChatHistory'));
const AdminChatDetail = lazy(() => import('./Pages/Admin/AdminChatDetail'));
const AdminProducts = lazy(() => import('./Pages/Admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./Pages/Admin/AdminProductForm'));
const AdminTestimonials = lazy(() => import('./Pages/Admin/AdminTestimonials'));
const AdminTestimonialForm = lazy(() => import('./Pages/Admin/AdminTestimonialForm'));
const AdminMessages = lazy(() => import('./Pages/Admin/AdminMessages'));
const AdminSettings = lazy(() => import('./Pages/Admin/AdminSettings'));
const AdminFeaturedProduct = lazy(() => import('./Pages/Admin/AdminFeaturedProduct'));

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

// Layout wrapper for public pages
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Suspense fallback={<LoadingFallback />}>
      {isAdminRoute ? (
        // Admin Routes - without public Navbar/Footer
        <Routes>
          {/* Public admin route - Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="chat-history" element={<AdminChatHistory />} />
            <Route path="chat-history/:sessionId" element={<AdminChatDetail />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="testimonials/new" element={<AdminTestimonialForm />} />
            <Route path="testimonials/edit/:id" element={<AdminTestimonialForm />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="featured-product" element={<AdminFeaturedProduct />} />
          </Route>
        </Routes>
      ) : (
        // Public Routes - with Navbar/Footer
        <PublicLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
          </Routes>
        </PublicLayout>
      )}
    </Suspense>
  );
}

export default App;