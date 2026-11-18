import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { Check, Copy, Gift, History, Info, RotateCcw, Sparkles } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const SPIN_LIMIT = 3;
const SPIN_DURATION = 4200;

// Порядок секторов совпадает с порядком призов в crm-service.
const sectors = [
  { text: 'Скидка\n5%', color: '#17171b', textColor: '#f2d07a' },
  { text: 'Скидка\n10%', color: '#a87c26', textColor: '#17120a' },
  { text: 'Скидка\n15%', color: '#17171b', textColor: '#f2d07a' },
  { text: 'Промокод\n500 ₽', color: '#a87c26', textColor: '#17120a' },
  { text: 'Своим\n−5%', color: '#17171b', textColor: '#f2d07a' },
  { text: 'Первый\nзаказ −5%', color: '#a87c26', textColor: '#17120a' },
];

const historyKey = (email) => `urechki_roulette_history_${email || 'guest'}`;

const readHistory = (email) => {
  try {
    const raw = localStorage.getItem(historyKey(email));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
};

export default function Roulette() {
  const { user, addPromoToUser } = useAuth();
  const { addNotification } = useNotification();
  const [isSpinning, setIsSpinning] = useState(false);
  const [prize, setPrize] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(SPIN_LIMIT);
  const [historyByEmail, setHistoryByEmail] = useState(() => ({
    [user?.email || 'guest']: readHistory(user?.email),
  }));
  const [copied, setCopied] = useState(false);
  const rotationRef = useRef(0);
  const spinTimer = useRef(null);
  const copyTimer = useRef(null);
  const effectiveSpinsLeft = user?.email ? spinsLeft : SPIN_LIMIT;
  const history = historyByEmail[user?.email || 'guest'] || [];

  useEffect(() => () => {
    window.clearTimeout(spinTimer.current);
    window.clearTimeout(copyTimer.current);
  }, []);

  useEffect(() => {
    if (!user?.email) return undefined;
    const email = user.email;
    let cancelled = false;
    axios.get('/api/customers/promo', { params: { email } })
      .then((res) => {
        if (!cancelled) setSpinsLeft(Number(res.data?.spinsLeft ?? SPIN_LIMIT));
      })
      .catch(() => {
        // Сервер недоступен — покажем локальный лимит, но приз всё равно выдаст сервер.
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryByEmail(prev => (prev[email] ? prev : { ...prev, [email]: readHistory(email) }));
        }
      });
    return () => { cancelled = true; };
  }, [user?.email]);

  const copyCode = async () => {
    if (!prize?.promoCode) return;
    try {
      await navigator.clipboard.writeText(prize.promoCode);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      addNotification('Не удалось скопировать — выделите код вручную', 'info');
    }
  };

  const spinWheel = async () => {
    if (isSpinning) return;
    if (!user?.email) {
      addNotification('Войдите в аккаунт, чтобы сохранить приз', 'info');
      return;
    }
    if (effectiveSpinsLeft <= 0) {
      addNotification('Лимит попыток на сегодня исчерпан', 'info');
      return;
    }

    setIsSpinning(true);
    setPrize(null);
    setCopied(false);

    try {
      const { data } = await axios.post('/api/customers/promo/claim', { email: user.email });
      const index = Math.max(0, Math.min(sectors.length - 1, Number(data.prizeIndex) || 0));
      const sectorAngle = 360 / sectors.length;
      const targetAngle = 360 - (index * sectorAngle) - sectorAngle / 2;
      const nextRotation = rotationRef.current + 6 * 360 + targetAngle - (rotationRef.current % 360);
      setRotation(nextRotation);
      rotationRef.current = nextRotation;
      setSpinsLeft(Number(data.spinsLeft ?? Math.max(0, effectiveSpinsLeft - 1)));

      const prizeData = {
        prize: data.prize || sectors[index].text.replace('\n', ' '),
        promoCode: data.promoCode || 'PROMO',
      };

      spinTimer.current = window.setTimeout(() => {
        setPrize(prizeData);
        setIsSpinning(false);
        addPromoToUser(prizeData);

        const entry = {
          id: Date.now(),
          prize: prizeData.prize,
          promoCode: prizeData.promoCode,
          date: new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        };
        const nextHistory = [entry, ...history].slice(0, 5);
        setHistoryByEmail(prev => ({ ...prev, [user.email]: nextHistory }));
        try {
          localStorage.setItem(historyKey(user.email), JSON.stringify(nextHistory));
        } catch {
          // История останется доступна до перезагрузки страницы.
        }

        addNotification('Приз сохранён в профиле и в истории розыгрышей', 'success');
        confetti({
          particleCount: 90,
          spread: 62,
          startVelocity: 32,
          origin: { y: 0.65 },
          colors: ['#f2d07a', '#ffffff', '#a87c26'],
        });
      }, SPIN_DURATION);
    } catch (err) {
      if (err.response?.status === 429) {
        setSpinsLeft(0);
        addNotification('Лимит попыток на сегодня исчерпан. Возвращайтесь завтра.', 'info');
      } else {
        addNotification('Не удалось запустить розыгрыш. Попробуйте позже.', 'error');
      }
      setIsSpinning(false);
    }
  };

  const used = SPIN_LIMIT - effectiveSpinsLeft;

  return (
    <div className="fade-in">
      <section className="section container-narrow text-center">
        <span className="eyebrow"><Sparkles size={14} /> Акция</span>
        <h1>Колесо призов «У Речушки»</h1>
        <p className="muted" style={{ maxWidth: 600, margin: '16px auto 0' }}>
          Три попытки в день — и приз гарантирован. Скидки уже подключены к заказу,
          а промокод сохранится в профиле и в истории на этой странице.
        </p>
      </section>

      <section className="section-sm container-narrow text-center">
        <div className="glass-panel" style={{ padding: '28px 20px 34px', maxWidth: 560, margin: '0 auto' }}>
          <div className="flex between wrap gap-2" style={{ marginBottom: 22 }}>
            <span className="badge badge-accent"><Gift size={14} /> Приз каждый раз</span>
            <span className="small muted">Попыток сегодня: <strong style={{ color: 'var(--accent)' }}>{effectiveSpinsLeft} из {SPIN_LIMIT}</strong></span>
          </div>

          <div className="roulette-progress" role="img" aria-label={`Использовано ${used} из ${SPIN_LIMIT} попыток`}>
            {Array.from({ length: SPIN_LIMIT }, (_, i) => (
              <span key={i} className={`roulette-dot ${i < used ? 'used' : ''}`} />
            ))}
          </div>

          <div className="roulette-stage" aria-label="Колесо призов">
            <div className="roulette-pointer" aria-hidden="true" />
            <div className="roulette-rim" aria-hidden="true" />
            <motion.div
              className="roulette-wheel"
              animate={{ rotate: rotation }}
              transition={{ duration: SPIN_DURATION / 1000, ease: [0.12, 0.86, 0.18, 1] }}
            >
              {sectors.map((sector, i) => {
                const sectorAngle = 360 / sectors.length;
                const angle = sectorAngle * i + sectorAngle / 2;
                return (
                  <div key={sector.text} className="roulette-sector" style={{ transform: `rotate(${angle - 90}deg)` }}>
                    <span className="roulette-sector-label" style={{ color: sector.textColor }}>{sector.text}</span>
                  </div>
                );
              })}
            </motion.div>

            <div className="roulette-hub-wrap">
              <motion.button
                type="button"
                onClick={spinWheel}
                disabled={isSpinning || effectiveSpinsLeft <= 0}
                whileHover={isSpinning || effectiveSpinsLeft <= 0 ? undefined : { scale: 1.05 }}
                whileTap={isSpinning || effectiveSpinsLeft <= 0 ? undefined : { scale: 0.95 }}
                className="roulette-hub"
                aria-label={effectiveSpinsLeft <= 0 ? 'Лимит попыток исчерпан' : 'Крутить колесо'}
              >
                {isSpinning ? <RotateCcw size={26} className="spin-icon" /> : <Sparkles size={28} />}
                <span>{isSpinning ? 'КРУТИМ' : effectiveSpinsLeft > 0 ? 'КРУТИТЬ' : 'ЗАВТРА'}</span>
              </motion.button>
            </div>
          </div>

          {!user && (
            <p className="small muted flex gap-1" style={{ justifyContent: 'center', marginTop: 26 }}>
              <Info size={16} className="text-accent" /> Для сохранения приза нужно войти в аккаунт
            </p>
          )}

          {prize && (
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="roulette-prize"
            >
              <Gift size={42} className="text-accent" />
              <div>
                <span className="tiny dim">Ваш приз</span>
                <h2>{prize.prize}</h2>
                <button type="button" className="roulette-code" onClick={copyCode} aria-label="Скопировать промокод">
                  {prize.promoCode} {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            </motion.div>
          )}

          <div className="roulette-rules" style={{ marginTop: 28 }}>
            <div><span>1</span> Войдите в аккаунт</div>
            <div><span>2</span> Крутите до 3 раз в день</div>
            <div><span>3</span> Примените код в заказе</div>
          </div>
        </div>
      </section>

      <section className="section-sm container-narrow">
        <div className="section-head">
          <span className="eyebrow"><History size={14} /> История призов</span>
          <h2>Последние 5 розыгрышей</h2>
          <p className="small">Список привязан к вашему аккаунту и хранится в этом браузере.</p>
        </div>
        {history.length ? (
          <div className="stack" style={{ gap: 10 }}>
            {history.map(item => (
              <div key={item.id} className="glass-panel flex between wrap gap-2" style={{ padding: '14px 18px' }}>
                <div className="flex gap-2" style={{ alignItems: 'center' }}>
                  <span className="badge badge-accent"><Gift size={14} /></span>
                  <div>
                    <strong className="small">{item.prize}</strong>
                    <div className="tiny dim">{item.date}</div>
                  </div>
                </div>
                <span className="badge uppercase" style={{ letterSpacing: '2px' }}>{item.promoCode}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="История пока пуста"
            description="Покрутите колесо — здесь появятся последние 5 выигрышей."
            icon={<Gift size={42} />}
          />
        )}
      </section>

      <section className="section-sm container-narrow">
        <p className="tiny dim text-center" style={{ margin: 0 }}>
          Промокоды действуют на заказы от 500 ₽, не суммируются и не обналичиваются. 18+
        </p>
      </section>
    </div>
  );
}
