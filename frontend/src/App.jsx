import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Check, Gift, X } from 'lucide-react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import SocialProof from './components/SocialProof';
import ChatBot from './components/ChatBot';
import ScrollProgress from './components/ScrollProgress';
import CookieBanner from './components/CookieBanner';
import AppBanner from './components/AppBanner';
import CommandPalette from './components/CommandPalette';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Production = lazy(() => import('./pages/Production'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Reviews = lazy(() => import('./pages/Reviews'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Catalog = lazy(() => import('./pages/Catalog'));
const FeaturePage = lazy(() => import('./pages/FeaturePage'));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Roulette = lazy(() => import('./pages/Roulette'));
const MerchCustomizer = lazy(() => import('./pages/MerchCustomizer'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AppPage = lazy(() => import('./pages/AppPage'));

const routes = [
  ['/', Home],
  ['/catalog', Catalog],
  ['/about', About],
  ['/production', Production],
  ['/reviews', Reviews],
  ['/contacts', Contacts],
  ['/product/:id', ProductDetails],
  ['/feature/:id', FeaturePage],
  ['/profile', Profile],
  ['/checkout', Checkout],
  ['/roulette', Roulette],
  ['/merch', MerchCustomizer],
  ['/faq', FAQ],
  ['/blog', Blog],
  ['/blog/:id', BlogPost],
  ['/admin', AdminDashboard],
  ['/app', AppPage],
];

function RouteLoader() {
  return (
    <div className="container section" style={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
      <div className="stack center text-center">
        <div className="spinner" style={{ width: 34, height: 34, margin: '0 auto' }} />
        <span className="muted small">Загружаем страницу…</span>
      </div>
    </div>
  );
}

function PromoPill() {
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('urechki_active_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user?.name) setUserName(user.name);
      }
      setHidden(localStorage.getItem('urechki_promo_hidden') === '1');
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('URE4KA');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (hidden) return null;

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.8, type: 'spring' }}
      className="promo-pill"
      onClick={copyToClipboard}
      whileHover={{ scale: 1.03, x: 4 }}
    >
      <button
        className="promo-pill-close"
        onClick={(e) => {
          e.stopPropagation();
          setHidden(true);
          localStorage.setItem('urechki_promo_hidden', '1');
        }}
        aria-label="Скрыть промокод"
      >
        <X size={13} />
      </button>
      <Gift size={22} color="#000" style={{ flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.68rem', color: '#000', fontWeight: 800 }}>
          {userName ? `Для ${userName}` : 'Промокод'}
        </span>
        <span style={{ fontSize: '1.05rem', color: '#000', fontWeight: 900, letterSpacing: '1px' }}>URE4KA</span>
      </div>
      <div style={{ background: '#000', padding: 6, borderRadius: '50%', display: 'flex', marginLeft: 'auto' }}>
        {copied ? <Check size={15} color="var(--accent)" /> : <Copy size={15} color="var(--accent)" />}
      </div>
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
      >
        <ErrorBoundary>
          <Suspense fallback={<RouteLoader />}>
            <Routes location={location}>
              {routes.map(([path, Component]) => <Route key={path} path={path} element={<Component />} />)}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <CustomCursor />
            <Router>
              <CommandPalette />
              <div className="super-bg" aria-hidden="true">
                <div className="particles" />
                <div className="rays" />
                <div className="cyber-grid" />
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
              </div>
              <ScrollProgress />
              <Navbar />
              <CartSidebar />
              <PromoPill />
              <AppBanner />
              <main id="main-content"><AnimatedRoutes /></main>
              <Footer />
              <SocialProof />
              <ChatBot />
              <CookieBanner />
              <ScrollToTop />
            </Router>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
