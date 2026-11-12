import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const colors = [
  { id: 'black', name: 'Черный', hex: '#1a1a1a', text: '#ffffff' },
  { id: 'white', name: 'Белый', hex: '#f0f0f0', text: '#000000' },
  { id: 'gold', name: 'Золотой', hex: '#d4af37', text: '#000000' },
];

const prints = [
  { id: 'logo', name: 'Логотип "У Речушки"', icon: '🍻', extraPrice: 0 },
  { id: 'beer', name: 'Пиво - это жизнь', icon: '🍺', extraPrice: 100 },
  { id: 'bear', name: 'Сибирский медведь', icon: '🐻', extraPrice: 150 },
  { id: 'none', name: 'Без принта', icon: '', extraPrice: -50 },
];

export default function MerchCustomizer() {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedPrint, setSelectedPrint] = useState(prints[0]);
  const [size, setSize] = useState('M');
  const { addToCart } = useCart();

  const basePrice = 1500;
  const totalPrice = basePrice + selectedPrint.extraPrice;

  const handleAddToCart = () => {
    const customProduct = {
      id: Date.now(), // Уникальный ID для кастомного товара
      name: `Футболка (${selectedColor.name}, ${selectedPrint.name}, ${size})`,
      price: totalPrice,
      category: 'Мерч',
      description: `Кастомная футболка с принтом "${selectedPrint.name}"`
    };
    addToCart(customProduct);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '80px 10%', minHeight: '80vh', maxWidth: '1200px', margin: '0 auto' }}>
      
      <h1 style={{ fontSize: '4rem', color: '#d4af37', textAlign: 'center', marginBottom: '10px', textShadow: '0 0 20px rgba(212,175,55,0.5)' }}>Конструктор Мерча</h1>
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: '1.2rem', marginBottom: '60px' }}>Создай свою уникальную футболку</p>

      <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
        
        {/* ЛЕВАЯ ЧАСТЬ: ПРЕВЬЮ */}
        <div style={{ flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div 
            key={selectedColor.id}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ 
              width: '100%', maxWidth: '400px', height: '450px', 
              backgroundColor: selectedColor.hex, 
              borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.1)',
              position: 'relative', overflow: 'hidden'
            }}
          >
            {/* Имитация футболки (эмодзи) */}
            <div style={{ fontSize: '15rem', filter: selectedColor.id === 'white' ? 'invert(1)' : 'none' }}>👕</div>
            
            {/* Принт */}
            {selectedPrint.id !== 'none' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '4rem', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                {selectedPrint.icon}
              </motion.div>
            )}
            
            <div style={{ position: 'absolute', bottom: '20px', color: selectedColor.text, fontWeight: 'bold', opacity: 0.5 }}>
              ПРЕВЬЮ
            </div>
          </motion.div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: НАСТРОЙКИ */}
        <div style={{ flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Выбор цвета */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.2rem' }}>1. Выберите цвет футболки</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              {colors.map(color => (
                <button 
                  key={color.id} 
                  onClick={() => setSelectedColor(color)}
                  style={{ 
                    width: '50px', height: '50px', borderRadius: '50%', background: color.hex, 
                    border: selectedColor.id === color.id ? '3px solid #d4af37' : '1px solid #333', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: selectedColor.id === color.id ? '0 0 15px rgba(212,175,55,0.5)' : 'none'
                  }}
                >
                  {selectedColor.id === color.id && <Check color={color.text} size={24} />}
                </button>
              ))}
            </div>
          </div>

          {/* Выбор принта */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.2rem' }}>2. Выберите принт</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {prints.map(print => (
                <button 
                  key={print.id} 
                  onClick={() => setSelectedPrint(print)}
                  style={{ 
                    background: selectedPrint.id === print.id ? 'rgba(212,175,55,0.2)' : '#111', 
                    border: selectedPrint.id === print.id ? '1px solid #d4af37' : '1px solid #333',
                    color: '#fff', padding: '15px', borderRadius: '10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px', transition: '0.3s'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{print.icon || '❌'}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{print.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#d4af37' }}>{print.extraPrice > 0 ? `+${print.extraPrice}₽` : print.extraPrice < 0 ? `${print.extraPrice}₽` : 'Бесплатно'}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Размер и Цена */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '1.2rem' }}>3. Размер</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['S', 'M', 'L', 'XL'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSize(s)}
                    style={{ width: '40px', height: '40px', borderRadius: '8px', background: size === s ? '#d4af37' : '#111', color: size === s ? '#000' : '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#aaa', marginBottom: '5px' }}>Итого:</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#d4af37', lineHeight: 1 }}>{totalPrice} ₽</div>
            </div>
          </div>

          <motion.button 
            onClick={handleAddToCart}
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(212,175,55,0.6)' }} whileTap={{ scale: 0.98 }}
            style={{ width: '100%', padding: '20px', background: '#d4af37', color: '#000', fontSize: '1.2rem', fontWeight: 900, border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
          >
            <ShoppingBag size={24} /> ДОБАВИТЬ В КОРЗИНУ
          </motion.button>

        </div>
      </div>
    </motion.div>
  );
}