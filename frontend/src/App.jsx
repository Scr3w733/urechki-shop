import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext'; // <-- Добавили
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import ScrollToTop from './components/ScrollToTop';
import Preloader from './components/Preloader';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Production from './pages/Production';
import Contacts from './pages/Contacts';
import Reviews from './pages/Reviews';
import ProductDetails from './pages/ProductDetails';
import Catalog from './pages/Catalog';
import FeaturePage from './pages/FeaturePage';
import Profile from './pages/Profile'; // <-- Добавили
import Checkout from './pages/Checkout'; // <-- Добавили
import './index.css';

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
        <Route path="/profile" element={<Profile />} /> {/* Новый роут */}
        <Route path="/checkout" element={<Checkout />} /> {/* Новый роут */}
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
    <AuthProvider> {/* Обернули в AuthProvider */}
      <CartProvider>
        <AnimatePresence>
          {loading && <Preloader />}
        </AnimatePresence>
        
        <Router>
          <div className="super-bg">
            <div className="particles"></div>
            <div className="rays"></div>
            <div className="cyber-grid"></div>
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>
          </div>
          <Navbar />
          <CartSidebar />
          <ScrollToTop />
          <AnimatedRoutes />
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;