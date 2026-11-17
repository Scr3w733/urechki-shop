import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { formatPrice } from '../utils/product';

const colors = [
  { id: 'black', name: 'Чёрный', hex: '#1a1a1a', text: '#ffffff' },
  { id: 'white', name: 'Белый', hex: '#f0f0f0', text: '#000000' },
  { id: 'gold', name: 'Золотой', hex: '#d4af37', text: '#000000' },
];

const prints = [
  { id: 'logo', name: 'Логотип «У Речушки»', icon: '🍻', extraPrice: 0 },
  { id: 'beer', name: 'Пиво — это жизнь', icon: '🍺', extraPrice: 100 },
  { id: 'bear', name: 'Сибирский медведь', icon: '🐻', extraPrice: 150 },
  { id: 'none', name: 'Без принта', icon: '', extraPrice: -50 },
];

const sizes = ['S', 'M', 'L', 'XL'];
const basePrice = 1500;

export default function MerchCustomizer() {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedPrint, setSelectedPrint] = useState(prints[0]);
  const [size, setSize] = useState('M');
  const { addToCart } = useCart();
  const { addNotification } = useNotification();

  const totalPrice = basePrice + selectedPrint.extraPrice;

  const handleAddToCart = () => {
    const customProduct = {
      id: Date.now(),
      name: `Футболка (${selectedColor.name}, ${selectedPrint.name}, ${size})`,
      price: totalPrice,
      category: 'Мерч',
      description: `Кастомная футболка с принтом «${selectedPrint.name}»`,
    };
    addToCart(customProduct);
    addNotification('Футболка добавлена в корзину', 'success');
  };

  return (
    <div className="fade-in">
      <section className="section container-narrow text-center">
        <span className="eyebrow"><Sparkles size={14} /> Мерч</span>
        <h1>Конструктор мерча</h1>
        <p className="muted" style={{ maxWidth: 560, margin: '16px auto 0' }}>
          Соберите свою футболку: выберите цвет, принт и размер. Предпросмотр обновляется сразу.
        </p>
      </section>

      <section className="section-sm container">
        <div className="grid grid-2" style={{ alignItems: 'start', gap: 32 }}>
          {/* Предпросмотр */}
          <div className="glass-panel stack" style={{ padding: 24, alignItems: 'center' }}>
            <motion.div
              key={selectedColor.id}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex center"
              style={{
                width: '100%',
                maxWidth: 380,
                minHeight: 420,
                borderRadius: 'var(--radius)',
                background: selectedColor.hex,
                border: '2px solid var(--border)',
                boxShadow: 'var(--shadow)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <span style={{ fontSize: '11rem', filter: selectedColor.id === 'white' ? 'invert(1)' : 'none' }} role="img" aria-label="Футболка">👕</span>
              {selectedPrint.id !== 'none' && (
                <motion.span
                  key={selectedPrint.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ position: 'absolute', top: '44%', fontSize: '4rem', textShadow: '0 4px 12px rgba(0,0,0,.35)' }}
                  role="img"
                  aria-label={selectedPrint.name}
                >
                  {selectedPrint.icon}
                </motion.span>
              )}
              <span className="badge" style={{ position: 'absolute', bottom: 16, color: selectedColor.text, borderColor: 'rgba(255,255,255,.25)' }}>ПРЕВЬЮ</span>
            </motion.div>
            <p className="tiny dim" style={{ margin: 0 }}>Изображение носит иллюстративный характер</p>
          </div>

          {/* Настройки */}
          <div className="stack" style={{ gap: 18 }}>
            <div className="card">
              <span className="eyebrow">Шаг 1</span>
              <h3 className="small bold" style={{ marginBottom: 16 }}>Выберите цвет футболки</h3>
              <div className="flex gap-2 wrap">
                {colors.map(color => (
                  <button
                    key={color.id}
                    className="btn"
                    onClick={() => setSelectedColor(color)}
                    aria-pressed={selectedColor.id === color.id}
                    style={{
                      background: color.hex,
                      color: color.text,
                      border: selectedColor.id === color.id ? '3px solid var(--accent)' : '1px solid var(--border)',
                      boxShadow: selectedColor.id === color.id ? '0 0 0 3px rgba(var(--accent-rgb), .18)' : 'none',
                    }}
                  >
                    {selectedColor.id === color.id && <Check size={16} />} {color.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <span className="eyebrow">Шаг 2</span>
              <h3 className="small bold" style={{ marginBottom: 16 }}>Выберите принт</h3>
              <div className="grid grid-2">
                {prints.map(print => {
                  const active = selectedPrint.id === print.id;
                  return (
                    <button
                      key={print.id}
                      className={`flex gap-2 ${active ? 'chip chip-active' : 'chip'}`}
                      onClick={() => setSelectedPrint(print)}
                      aria-pressed={active}
                      style={{ textAlign: 'left', borderRadius: 'var(--radius-sm)', padding: 12 }}
                    >
                      <span style={{ fontSize: '1.4rem' }} role="img" aria-label={print.name}>{print.icon || '—'}</span>
                      <span>
                        <span className="small bold" style={{ display: 'block' }}>{print.name}</span>
                        <span className="tiny text-accent">
                          {print.extraPrice > 0 ? `+${formatPrice(print.extraPrice)}` : print.extraPrice < 0 ? `−${formatPrice(Math.abs(print.extraPrice))}` : 'Бесплатно'}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card flex between wrap gap-2">
              <div>
                <span className="eyebrow">Шаг 3</span>
                <h3 className="small bold" style={{ marginBottom: 12 }}>Размер</h3>
                <div className="flex gap-1">
                  {sizes.map(s => (
                    <button key={s} className={`chip ${size === s ? 'chip-active' : ''}`} onClick={() => setSize(s)} aria-pressed={size === s}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="small muted" style={{ display: 'block' }}>Итого</span>
                <strong className="text-accent" style={{ fontSize: '2rem', lineHeight: 1.2 }}>{formatPrice(totalPrice)}</strong>
              </div>
            </div>

            <button className="btn btn-primary btn-lg btn-block" onClick={handleAddToCart}>
              <ShoppingBag size={20} /> Добавить в корзину
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
