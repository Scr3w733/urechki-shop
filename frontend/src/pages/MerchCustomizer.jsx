import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, productImage } from '../utils/product';

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
const shirtPath = 'M78 24 L58 32 L24 64 L50 92 L68 74 L68 210 Q110 220 152 210 L152 74 L170 92 L196 64 L162 32 L142 24 Q142 46 110 46 Q78 46 78 24 Z';

export default function MerchCustomizer() {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedPrint, setSelectedPrint] = useState(prints[0]);
  const [size, setSize] = useState('M');
  const { addToCart } = useCart();

  const totalPrice = basePrice + selectedPrint.extraPrice;

  const handleAddToCart = () => {
    const customProduct = {
      id: `merch-${selectedColor.id}-${selectedPrint.id}-${size}`,
      name: `Футболка (${selectedColor.name}, ${selectedPrint.name}, ${size})`,
      price: totalPrice,
      category: 'Мерч',
      description: `Кастомная футболка с принтом «${selectedPrint.name}»`,
      image: productImage({ category: 'Мерч' }),
    };
    addToCart(customProduct);
  };

  return (
    <div className="fade-in">
      <section className="section container-narrow text-center">
        <span className="eyebrow"><Sparkles size={14} /> Мерч</span>
        <h1>Конструктор мерча</h1>
        <p className="muted" style={{ maxWidth: 560, margin: '16px auto 0' }}>
          Соберите свою футболку: выберите цвет, принт и размер. Предпросмотр и цена обновляются сразу.
        </p>
      </section>

      <section className="section-sm container">
        <div className="grid grid-2" style={{ alignItems: 'start', gap: 32 }}>
          {/* Предпросмотр */}
          <div className="glass-panel stack" style={{ padding: 24, alignItems: 'center' }}>
            <motion.div
              key={`${selectedColor.id}-${selectedPrint.id}-${size}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex center"
              style={{
                width: '100%',
                maxWidth: 380,
                minHeight: 420,
                borderRadius: 'var(--radius)',
                background: 'radial-gradient(circle at 50% 40%, rgba(var(--accent-rgb),.10), transparent 65%)',
                border: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <svg
                viewBox="0 0 220 240"
                width="84%"
                role="img"
                aria-label={`Футболка ${selectedColor.name}, принт «${selectedPrint.name}», размер ${size}`}
                style={{ filter: 'drop-shadow(0 18px 24px rgba(0,0,0,.45))' }}
              >
                <defs>
                  <linearGradient id="shirtShade" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,.14)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,.24)" />
                  </linearGradient>
                </defs>
                <path d={shirtPath} fill={selectedColor.hex} stroke="var(--border-accent)" strokeWidth="2" />
                <path d={shirtPath} fill="url(#shirtShade)" />
                <path d="M78 24 Q110 58 142 24" fill="none" stroke={selectedColor.text} strokeOpacity=".28" strokeWidth="2" />
                <path d="M68 76 L68 206 M152 76 L152 206" fill="none" stroke={selectedColor.text} strokeOpacity=".12" strokeWidth="1.5" />
                {selectedPrint.id !== 'none' && (
                  <text x="110" y="128" textAnchor="middle" fontSize="42" style={{ userSelect: 'none' }}>
                    {selectedPrint.icon}
                  </text>
                )}
                <text x="110" y="176" textAnchor="middle" fontSize="10" letterSpacing="2" fill={selectedColor.text} opacity=".6">
                  URECHKI
                </text>
              </svg>
              <span className="badge badge-accent" style={{ position: 'absolute', top: 14, left: 14 }}>{size}</span>
              <span className="badge" style={{ position: 'absolute', bottom: 16, right: 16 }}>ПРЕВЬЮ</span>
            </motion.div>
            <div className="flex gap-2 wrap center">
              <span className="badge">{selectedColor.name}</span>
              <span className="badge">{selectedPrint.name}</span>
              <span className="badge">Размер {size}</span>
            </div>
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

            <div className="card">
              <span className="eyebrow">Шаг 3</span>
              <h3 className="small bold" style={{ marginBottom: 12 }}>Размер</h3>
              <div className="flex gap-1">
                {sizes.map(s => (
                  <button key={s} className={`chip ${size === s ? 'chip-active' : ''}`} onClick={() => setSize(s)} aria-pressed={size === s}>{s}</button>
                ))}
              </div>
            </div>

            <div className="glass-panel stack" style={{ padding: 20 }}>
              <span className="eyebrow">Расчёт цены</span>
              <div className="flex between small">
                <span className="muted">Футболка, основа</span>
                <span>{formatPrice(basePrice)}</span>
              </div>
              <div className="flex between small">
                <span className="muted">Принт «{selectedPrint.name}»</span>
                <span className={selectedPrint.extraPrice < 0 ? 'text-accent' : ''}>
                  {selectedPrint.extraPrice > 0 ? `+${formatPrice(selectedPrint.extraPrice)}` : selectedPrint.extraPrice < 0 ? `−${formatPrice(Math.abs(selectedPrint.extraPrice))}` : 'Бесплатно'}
                </span>
              </div>
              <div className="flex between small">
                <span className="muted">Размер {size}</span>
                <span>без доплаты</span>
              </div>
              <div className="flex between" style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <strong className="small">Итого</strong>
                <strong className="text-accent" style={{ fontSize: '1.6rem', lineHeight: 1.2 }}>{formatPrice(totalPrice)}</strong>
              </div>
            </div>

            <div className="stack" style={{ gap: 8 }}>
              <button className="btn btn-primary btn-lg btn-block" onClick={handleAddToCart}>
                <ShoppingBag size={20} /> Добавить в корзину
              </button>
              <p className="tiny dim text-center" style={{ margin: 0 }}>
                Товар появится в корзине — оформление заказа будет отдельным шагом.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
