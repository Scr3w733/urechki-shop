import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  CheckCircle,
  Clock,
  Gift,
  Heart,
  Home,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  User,
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { appPreviewImage } from '../utils/product';

const features = [
  { icon: ShoppingBag, title: 'Быстрый заказ', desc: 'Избранные товары и последний заказ всегда под рукой.' },
  { icon: Star, title: 'Персональные предложения', desc: 'Скидки и промокоды, подобранные под ваши покупки.' },
  { icon: Bell, title: 'Уведомления', desc: 'Сообщим о новых сортах и статусе доставки.' },
  { icon: Clock, title: 'История покупок', desc: 'Прошлые заказы и чеки — без поиска по почте.' },
  { icon: Heart, title: 'Избранное', desc: 'Любимые сорта в одном списке, синхронизированном с сайтом.' },
  { icon: Gift, title: 'Бонусы и подарки', desc: 'Баланс бонусов, промокоды и идеи для подарков.' },
];

const onScreen = [
  'Каталог с фильтрами по вкусу и стилю',
  'Карточка товара с составом и отзывами',
  'Оформление заказа в пару касаний',
  'Статус доставки и история покупок',
];

const NOTIFY_KEY = 'urechki_app_notify';

export default function AppPage() {
  const { addNotification } = useNotification();
  const [email, setEmail] = useState('');

  const notifyMe = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      addNotification('Введите корректный email', 'error');
      return;
    }
    try {
      localStorage.setItem(NOTIFY_KEY, email);
      addNotification('Email сохранён в этом браузере — о релизе объявим на сайте', 'success');
      setEmail('');
    } catch {
      addNotification('Не удалось сохранить email — попробуйте ещё раз', 'error');
    }
  };

  return (
    <div className="fade-in">
      {/* HERO */}
      <section className="section container" style={{ textAlign: 'center' }}>
        <span className="eyebrow" style={{ justifyContent: 'center' }}><Smartphone size={14} /> Приложение в разработке</span>
        <h1 style={{ maxWidth: 760, margin: '0 auto 20px' }}>
          Весь магазин <span className="text-accent">в вашем кармане</span>
        </h1>
        <p className="muted" style={{ maxWidth: 620, margin: '0 auto 32px' }}>
          Готовим приложение «У Речушки»: заказ в пару касаний, история покупок и персональные
          предложения. Пока оно в разработке — заглядывайте в магазин через сайт.
        </p>
        <span className="badge badge-accent"><Sparkles size={14} /> Скоро</span>
        <form onSubmit={notifyMe} className="flex gap-2 wrap center" style={{ maxWidth: 520, margin: '28px auto 0' }}>
          <input
            className="input"
            style={{ flex: '1 1 240px' }}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Ваш email"
            aria-label="Email для уведомления о релизе"
          />
          <button type="submit" className="btn btn-primary"><Bell size={17} /> Уведомить о релизе</button>
        </form>
        <p className="tiny dim" style={{ marginTop: 10 }}>
          Email сохранится только в этом браузере — о запуске мы объявим на сайте и в рассылке.
        </p>
        <div className="flex gap-2 wrap center" style={{ marginTop: 20 }}>
          <Link to="/catalog" className="btn btn-outline">Пока в каталог <ArrowRight size={18} /></Link>
        </div>
      </section>

      {/* CSS PHONE MOCKUP */}
      <section className="section-sm container">
        <div className="section-head center">
          <span className="eyebrow">Предпросмотр</span>
          <h2>Как это будет выглядеть</h2>
          <p className="small">Дизайн-концепт: экраны ещё дорабатываются.</p>
        </div>
        <div className="grid grid-2" style={{ alignItems: 'center', gap: 40 }}>
          <div className="flex center">
            <div
              role="img"
              aria-label="Концепт экрана мобильного приложения «У Речушки»"
              style={{
                position: 'relative',
                width: 260,
                padding: 10,
                borderRadius: 36,
                border: '2px solid var(--border-accent)',
                background: '#0b0b0e',
                boxShadow: '0 30px 70px rgba(0,0,0,.6)',
              }}
            >
              <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', width: 84, height: 20, borderRadius: 12, background: '#050506', zIndex: 5 }} />
              <div style={{ position: 'relative', height: 500, borderRadius: 26, overflow: 'hidden', background: '#111' }}>
                <img
                  src={appPreviewImage()}
                  alt=""
                  aria-hidden="true"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,10,.25), rgba(8,8,10,.82))' }} />
                <div className="stack" style={{ position: 'relative', height: '100%', padding: '34px 16px 14px' }}>
                  <div className="flex between tiny" style={{ color: '#fff' }}>
                    <span>9:41</span>
                    <span className="flex gap-1"><Bell size={11} /> ▮▮▮</span>
                  </div>
                  <span className="badge badge-accent" style={{ alignSelf: 'flex-start', marginTop: 16 }}>URECHKI</span>
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '10px 0 0' }}>Крафт у речушки</h3>
                  <div className="flex gap-1" style={{ background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: '8px 10px', marginTop: 12, color: 'rgba(255,255,255,.75)' }}>
                    <Search size={14} /> <span className="tiny">Найти сорт…</span>
                  </div>
                  <div className="flex gap-1" style={{ marginTop: 12 }}>
                    <span className="badge badge-accent tiny">Всё</span>
                    <span className="badge tiny">Пиво</span>
                    <span className="badge tiny">Закуски</span>
                  </div>
                  <div className="stack" style={{ gap: 8, marginTop: 'auto' }}>
                    <div className="glass-panel" style={{ padding: 10, background: 'rgba(20,20,24,.72)' }}>
                      <div className="flex between tiny" style={{ color: '#fff' }}>
                        <strong>Сибирский IPA</strong><span className="text-accent">290 ₽</span>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,.6)' }}>🌿 Горькое · 0,5 л</span>
                    </div>
                    <div className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>Добавить в корзину</div>
                  </div>
                  <div className="flex between" style={{ borderTop: '1px solid rgba(255,255,255,.12)', paddingTop: 10, marginTop: 12, color: 'rgba(255,255,255,.7)' }}>
                    <Home size={16} /><Search size={16} /><Heart size={16} /><User size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="stack" style={{ gap: 14 }}>
            <span className="eyebrow">На экранах</span>
            <h2>Всё нужное под рукой</h2>
            <div className="stack" style={{ gap: 10 }}>
              {onScreen.map((item, i) => (
                <div key={item} className="flex gap-2" style={{ alignItems: 'flex-start' }}>
                  <span className="badge badge-accent">{String(i + 1).padStart(2, '0')}</span>
                  <p className="small muted" style={{ margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
            <p className="tiny dim" style={{ margin: 0 }}>
              Это концепт, а не готовый скриншот: часть экранов ещё проектируется.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section container">
        <div className="section-head center">
          <span className="eyebrow">Что будет</span>
          <h2>Возможности приложения</h2>
          <p className="small">Планируемые функции — пока они доступны на сайте в том или ином виде.</p>
        </div>
        <div className="grid grid-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-hover stack" style={{ alignItems: 'flex-start' }}>
              <span className="icon-btn text-accent"><Icon size={21} /></span>
              <strong className="small">{title}</strong>
              <p className="small muted" style={{ margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATUS / CTA */}
      <section className="section-sm container-narrow">
        <div className="glass-panel stack" style={{ padding: '34px 26px', alignItems: 'center', textAlign: 'center', borderColor: 'var(--border-accent)' }}>
          <CheckCircle size={30} className="text-accent" />
          <span className="badge badge-accent uppercase" style={{ letterSpacing: '2px' }}>Скоро</span>
          <h2>Мы работаем над приложением</h2>
          <p className="muted" style={{ maxWidth: 540, margin: 0 }}>
            Ссылок для скачивания пока нет — как только приложение выйдет, здесь появятся
            рабочие кнопки для iOS и Android. Пока все товары и акции доступны на сайте.
          </p>
          <div className="flex gap-2 wrap center">
            <button type="button" className="btn btn-primary" disabled aria-disabled="true" title="Приложение ещё в разработке">
              Скоро в магазинах приложений
            </button>
            <Link to="/contacts" className="btn btn-outline">Написать нам</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
