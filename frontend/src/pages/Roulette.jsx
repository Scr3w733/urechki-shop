import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { Gift, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const sectors = [
  { text: "Скидка\n5%", color: "#1a1a1a", textColor: "#d4af37" },
  { text: "Доставка", color: "#d4af37", textColor: "#000000" },
  { text: "Скидка\n10%", color: "#1a1a1a", textColor: "#d4af37" },
  { text: "Бокал", color: "#d4af37", textColor: "#000000" },
  { text: "Скидка\n15%", color: "#1a1a1a", textColor: "#d4af37" },
  { text: "500\nРублей", color: "#d4af37", textColor: "#000000" }
];

export default function Roulette() {
  const { user, addPromoToUser } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [prize, setPrize] = useState(null);
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);

  const spinWheel = async () => {
    if (isSpinning) return;
    if (!user) {
      alert("Пожалуйста, войдите в аккаунт, чтобы сохранить приз!");
      return;
    }

    setIsSpinning(true);
    setPrize(null);

    let index = 0;
    let prizeData = { prize: "Скидка 5%", promoCode: "BEER5", discount: 5 };

    try {
      const response = await axios.get('http://localhost:8081/api/customers/promo');
      if (response.data && response.data.prizeIndex !== undefined) {
        index = response.data.prizeIndex;
        prizeData = response.data;
      }
    } catch (error) {
      console.error("Бэкенд недоступен", error);
      index = Math.floor(Math.random() * sectors.length);
      prizeData = { prize: sectors[index].text.replace('\n', ' '), promoCode: "PROMO" };
    }

    const totalSectors = sectors.length;
    const sectorAngle = 360 / totalSectors;
    const targetAngle = 360 - (index * sectorAngle) - (sectorAngle / 2);
    const spins = 5;
    const newRotation = rotationRef.current + (spins * 360) + targetAngle - (rotationRef.current % 360);
    
    setRotation(newRotation);
    rotationRef.current = newRotation;

    setTimeout(() => {
      setPrize(prizeData);
      setIsSpinning(false);
      // СОХРАНЯЕМ ПРИЗ В АККАУНТ
      addPromoToUser(prizeData); 
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#d4af37', '#ffffff', '#8b0000'] });
    }, 5000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '80px 10%', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontSize: '4rem', color: '#d4af37', marginBottom: '10px' }}>Колесо Фортуны</h1>
      <p style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '50px' }}>Испытай удачу и сорви куш!</p>

      <div style={{ position: 'relative', width: '400px', height: '400px', margin: '0 auto' }}>
        <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <div style={{ width: 0, height: 0, borderLeft: '25px solid transparent', borderRight: '25px solid transparent', borderTop: '40px solid #ff4444' }}></div>
        </div>

        <motion.div animate={{ rotate: rotation }} transition={{ duration: 5, ease: [0.1, 0.9, 0.2, 1] }} style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'conic-gradient(#1a1a1a 0deg 60deg, #d4af37 60deg 120deg, #1a1a1a 120deg 180deg, #d4af37 180deg 240deg, #1a1a1a 240deg 300deg, #d4af37 300deg 360deg)', border: '10px solid #111', position: 'relative', overflow: 'hidden' }}>
          {sectors.map((sector, i) => {
            const angle = (360 / sectors.length) * i + (360 / sectors.length) / 2;
            return (
              <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: '50%', height: '40px', transformOrigin: '0% 50%', transform: `rotate(${angle - 90}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '60px', pointerEvents: 'none' }}>
                <span style={{ color: sector.textColor, fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', whiteSpace: 'pre-line', textAlign: 'center' }}>{sector.text}</span>
              </div>
            );
          })}
        </motion.div>

        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20 }}>
          <motion.button onClick={spinWheel} disabled={isSpinning} whileHover={{ scale: isSpinning ? 1 : 1.1 }} whileTap={{ scale: isSpinning ? 1 : 0.9 }} style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #d4af37 0%, #ffdf00 100%)', border: '6px solid #111', cursor: isSpinning ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(212,175,55,0.8)' }}>
            <Sparkles size={28} color="#000" />
            <span style={{ color: '#000', fontWeight: 900, fontSize: '0.8rem', marginTop: '2px' }}>КРУТИТЬ</span>
          </motion.button>
        </div>
      </div>

      {prize && (
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ marginTop: '50px', padding: '40px', display: 'inline-block', border: '2px solid #d4af37' }}>
          <Gift size={60} color="#d4af37" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '10px' }}>Поздравляем!</h2>
          <p style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px' }}>Вы выиграли: {prize.prize}</p>
          <p style={{ color: '#aaa', fontSize: '1.2rem' }}>Промокод сохранен в вашем профиле!</p>
          <div style={{ background: '#111', padding: '15px 30px', borderRadius: '10px', marginTop: '10px', fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '5px', border: '1px dashed #d4af37' }}>{prize.promoCode}</div>
        </motion.div>
      )}
    </motion.div>
  );
}