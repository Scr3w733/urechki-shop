import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Check, Gift } from 'lucide-react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import ScrollToTop from './components/ScrollToTop';
import Preloader from './components/Preloader';
import Footer from './components/Footer';
import SocialProof from './components/SocialProof'; 
import ChatBot from './components/ChatBot'; 
import ScrollProgress from './components/ScrollProgress';
import CookieBanner from './components/CookieBanner';
import AppBanner from './components/AppBanner';
import CommandPalette from './components/CommandPalette'; 

import Home from './pages/Home';
import About from './pages/About';
import Production from './pages/Production';
import Contacts from './pages/Contacts';
import Reviews from './pages/Reviews';
import ProductDetails from './pages/ProductDetails';
import Catalog from './pages/Catalog';
import FeaturePage from './pages/FeaturePage';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Roulette from './pages/Roulette';
import MerchCustomizer from './pages/MerchCustomizer';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost'; 
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import AppPage from './pages/AppPage';
import './index.css';

function PromoPill() {
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState(null);
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('urechki_active_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user && user.name) setUserName(user.name);
      }
    } catch (e) { console.log(e); }
  }, []);
  const copyToClipboard = () => {
    navigator.clipboard.writeText('URE4KA');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.div initial={{ x: -100 }} animate={{ x: 0 }} transition={{ delay: 3, type: 'spring' }} style={{ position: 'fixed', top: '100px', left: '-5px', background: 'linear-gradient(90deg, var(--accent), #fff)', padding: '10px 15px 10px 10px', borderRadius: '0 20px 20px 0', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 9990, boxShadow: '5px 5px 20px rgba(0,0,0,0.5)', cursor: 'none', maxWidth: '250px' }} onClick={copyToClipboard} whileHover={{ scale: 1.05, x: 5 }}>
      <Gift size={24} color="#000" style={{ flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.75rem', color: '#000', fontWeight: 'bold' }}>{userName ? `Промокод для ${userName}` : 'Промокод на скидку'}</span>
        <span style={{ fontSize: '1.1rem', color: '#000', fontWeight: 900, letterSpacing: '1px' }}>URE4KA</span>
      </div>
      <div style={{ background: '#000', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', flexShrink: 0 }}>
        {copied ? <Check size={16} color="var(--accent)" /> : <Copy size={16} color="var(--accent)" />}
      </div>
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/about" element={<About />} />
        <Route path="/production" element={<Production />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/feature/:id" element={<FeaturePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/roulette" element={<Roulette />} />
        <Route path="/merch" element={<MerchCustomizer />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <AnimatePresence>
              {loading && <Preloader />}
            </AnimatePresence>
            
            <CustomCursor />

            <Router>
              <CommandPalette /> 

              <div className="super-bg">
                <div className="particles"></div>
                <div className="rays"></div>
                <div className="cyber-grid"></div>
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
              </div>
              
              <ScrollProgress />
              <Navbar />
              <CartSidebar />
              <PromoPill />
              <AppBanner />
              
              <AnimatedRoutes />
              
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

export default App;