import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const sectors = [
  { text: 'Скидка\n5%', color: '#1a1a1a', textColor: '#d4af37' },
  { text: 'Доставка', color: '#d4af37', textColor: '#000000' },
  { text: 'Скидка\n10%', color: '#1a1a1a', textColor: '#d4af37' },
  { text: 'Бокал', color: '#d4af37', textColor: '#000000' },
  { text: 'Скидка\n15%', color: '#1a1a1a', textColor: '#d4af37' },
  { text: '500\nрублей', color: '#d4af37', textColor: '#000000' },
];

export default function Roulette() {
  const { user, addPromoToUser } = useAuth();
  const { addNotification } = useNotification();
  const [isSpinning, setIsSpinning] = useState(false);
  const [prize, setPrize] = useState(null);
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);

  const spinWheel = async () => {
    if (isSpinning) return;
    if (!user) {
      addNotification('Войдите в аккаунт, чтобы сохранить приз', 'info');
      return;
    }

    setIsSpinning(true);
    setPrize(null);

    let index = 0;
    let prizeData = { prize: 'Скидка 5%', promoCode: 'BEER5', discount: 5 };

    try {
      const response = await axios.get('/api/customers/promo');
      if (response.data && response.data.prizeIndex !== undefined) {
        index = response.data.prizeIndex;
        prizeData = response.data;
      }
    } catch {
      index = Math.floor(Math.random() * sectors.length);
      prizeData = { prize: sectors[index].text.replace('\n', ' '), promoCode: 'PROMO' };
      addNotification('Сервис призов временно недоступен — приз определён локально', 'info');
    }

    const sectorAngle = 360 / sectors.length;
    const targetAngle = 360 - (index * sectorAngle) - sectorAngle / 2;
    const spins = 5;
    const newRotation = rotationRef.current + spins * 360 + targetAngle - (rotationRef.current % 360);

    setRotation(newRotation);
    rotationRef.current = newRotation;

    setTimeout(() => {
      setPrize(prizeData);
      setIsSpinning(false);
      addPromoToUser(prizeData);
      addNotification(`Приз «${prizeData.prize}» сохранён в вашем профиле`, 'success');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#d4af37', '#ffffff', '#8b0000'] });
    }, 5000);
  };

  return (
    <div className="fade-in">
      <section className="section container-narrow text-center">
        <span className="eyebrow"><Sparkles size={14} /> Игра</span>
        <h1>Колесо фортуны</h1>
        <p className="muted" style={{ maxWidth: 580, margin: '16px auto 0' }}>
          Крутите колесо и получайте призы — скидки на пиво, доставку или маленький подарок.
          Промокод сохранится в вашем профиле.
        </p>
      </section>

      <section className="section-sm container-narrow text-center">
        <div
          style={{ position: 'relative', width: 'min(380px, 82vw)', aspectRatio: '1', margin: '0 auto' }}
          aria-label="Колесо фортуны"
        >
          <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
            <div style={{ width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: '36px solid var(--danger)' }} />
          </div>

          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 5, ease: [0.1, 0.9, 0.2, 1] }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'conic-gradient(#1a1a1a 0deg 60deg, #d4af37 60deg 120deg, #1a1a1a 120deg 180deg, #d4af37 180deg 240deg, #1a1a1a 240deg 300deg, #d4af37 300deg 360deg)',
              border: '10px solid #111',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow)',
            }}
          >
            {sectors.map((sector, i) => {
              const angle = (360 / sectors.length) * i + 360 / sectors.length / 2;
              return (
                <div
                  key={sector.text}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '50%',
                    height: 40,
                    transformOrigin: '0% 50%',
                    transform: `rotate(${angle - 90}deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: 52,
                    pointerEvents: 'none',
                  }}
                >
                  <span className="bold uppercase tiny" style={{ color: sector.textColor, whiteSpace: 'pre-line', textAlign: 'center' }}>{sector.text}</span>
                </div>
              );
            })}
          </motion.div>

          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20 }}>
            <motion.button
              onClick={spinWheel}
              disabled={isSpinning}
              whileHover={{ scale: isSpinning ? 1 : 1.08 }}
              whileTap={{ scale: isSpinning ? 1 : 0.94 }}
              className="btn btn-primary"
              style={{ width: 96, height: 96, borderRadius: '50%', flexDirection: 'column', gap: 0, padding: 0 }}
              aria-label="Крутить колесо"
            >
              <Sparkles size={26} />
              <span className="tiny">{isSpinning ? '...' : 'КРУТИТЬ'}</span>
            </motion.button>
          </div>
        </div>

        {!user && (
          <p className="small muted flex gap-1" style={{ justifyContent: 'center', marginTop: 28 }}>
            <Info size={16} className="text-accent" /> Для сохранения приза нужно войти в аккаунт
          </p>
        )}

        {prize && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel stack"
            style={{ margin: '32px auto 0', maxWidth: 460, padding: 28, borderColor: 'var(--border-accent)', alignItems: 'center' }}
          >
            <Gift size={48} className="text-accent" />
            <h2 style={{ fontSize: '1.6rem' }}>Поздравляем!</h2>
            <p className="muted" style={{ margin: 0 }}>Вы выиграли: <strong className="text-accent">{prize.prize}</strong></p>
            <p className="tiny dim" style={{ margin: 0 }}>Промокод сохранён в вашем профиле</p>
            <div className="badge badge-accent uppercase" style={{ fontSize: '1.4rem', letterSpacing: '4px', padding: '12px 22px' }}>{prize.promoCode}</div>
          </motion.div>
        )}
      </section>

      <section className="section-sm container-narrow">
        <p className="tiny dim text-center" style={{ margin: 0 }}>
          Условия акции и срок действия промокодов уточняйте у службы поддержки.
        </p>
      </section>
    </div>
  );
}
