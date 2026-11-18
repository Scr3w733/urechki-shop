import { lazy, Suspense, useState, useEffect, useRef } from 'react';
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
import MobileBottomNav from './components/MobileBottomNav';
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
const Loyalty = lazy(() => import('./pages/Loyalty'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Analytics = lazy(() => import('./pages/Analytics'));
const SystemStatus = lazy(() => import('./pages/SystemStatus'));

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
  ['/loyalty', Loyalty],
  ['/track', TrackOrder],
  ['/favorites', Favorites],
  ['/analytics', Analytics],
  ['/status', SystemStatus],
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
  const [copyStatus, setCopyStatus] = useState(null);
  const [userName, setUserName] = useState(null);
  const [hidden, setHidden] = useState(false);
  const statusTimer = useRef(null);

  useEffect(() => () => clearTimeout(statusTimer.current), []);

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
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText('URE4KA');
        copied = true;
      }
    } catch {
      copied = false;
    }
    if (!copied) {
      // Fallback для HTTP-сборок, где Clipboard API недоступен.
      try {
        const field = document.createElement('textarea');
        field.value = 'URE4KA';
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        copied = document.execCommand('copy');
        field.remove();
      } catch {
        copied = false;
      }
    }
    setCopyStatus(copied ? 'copied' : 'error');
    clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setCopyStatus(null), 2500);
  };

  if (hidden) return null;

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.8, type: 'spring' }}
      className="promo-pill"
      whileHover={{ scale: 1.03, x: 4 }}
    >
      <button
        className="promo-pill-close"
        onClick={() => {
          setHidden(true);
          localStorage.setItem('urechki_promo_hidden', '1');
        }}
        aria-label="Скрыть промокод"
      >
        <X size={13} />
      </button>
      <button
        type="button"
        className="promo-pill-main"
        onClick={copyToClipboard}
        aria-label="Скопировать промокод URE4KA"
        title={copyStatus === 'error' ? 'Не удалось скопировать — выделите код вручную' : 'Нажмите, чтобы скопировать'}
      >
        <Gift size={22} color="#1a1608" style={{ flexShrink: 0 }} />
        <span style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <span style={{ fontSize: '0.68rem', color: '#1a1608', fontWeight: 800 }}>
            {userName ? `Для ${userName}` : 'Промокод'}
          </span>
          <span style={{ fontSize: '1.05rem', color: '#1a1608', fontWeight: 800, letterSpacing: '1px' }}>URE4KA</span>
        </span>
        <span className="promo-pill-icon" aria-hidden="true">
          {copyStatus === 'copied'
            ? <Check size={15} color="var(--accent)" />
            : copyStatus === 'error'
              ? <X size={15} color="#ff6b6b" />
              : <Copy size={15} color="var(--accent)" />}
        </span>
        <span className="sr-only" role="status">
          {copyStatus === 'copied' ? 'Промокод скопирован' : copyStatus === 'error' ? 'Не удалось скопировать промокод' : ''}
        </span>
      </button>
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
              <MobileBottomNav />
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
