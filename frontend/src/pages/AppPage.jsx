import { Link } from 'react-router-dom';
import { ArrowRight, Bell, CheckCircle, ShoppingBag, Smartphone, Sparkles, Star } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const features = [
  { icon: ShoppingBag, title: 'Быстрый заказ', desc: 'Избранные товары и последний заказ всегда под рукой.' },
  { icon: Star, title: 'Персональные предложения', desc: 'Скидки и промокоды, подобранные под ваши покупки.' },
  { icon: Bell, title: 'Уведомления', desc: 'Сообщим о новых сортах и статусе доставки.' },
];

const screens = [
  { label: 'Главная', blocks: [92, 14, 14, 38] },
  { label: 'Каталог', blocks: [56, 56, 56, 20] },
  { label: 'Заказ', blocks: [74, 14, 14, 36] },
];

export default function AppPage() {
  const { addNotification } = useNotification();

  const notifyMe = () => {
    addNotification('Спасибо! Сообщим, когда приложение будет доступно', 'success');
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
        <div className="flex gap-2 wrap center" style={{ marginTop: 28 }}>
          <button className="btn btn-primary btn-lg" onClick={notifyMe}><Bell size={18} /> Сообщить о запуске</button>
          <Link to="/catalog" className="btn btn-outline btn-lg">Пока в каталог <ArrowRight size={18} /></Link>
        </div>
      </section>

      {/* SCREENSHOT PLACEHOLDERS */}
      <section className="section-sm container">
        <div className="section-head center">
          <span className="eyebrow">Предпросмотр</span>
          <h2>Как это будет выглядеть</h2>
          <p className="small">Заглушки экранов — дизайн ещё дорабатывается.</p>
        </div>
        <div className="grid grid-3" style={{ justifyItems: 'center' }}>
          {screens.map(screen => (
            <div key={screen.label} className="stack" style={{ alignItems: 'center', gap: 12 }}>
              <div
                aria-label={`Экран: ${screen.label}`}
                style={{
                  width: 180,
                  padding: 10,
                  borderRadius: 28,
                  border: '2px solid var(--border-accent)',
                  background: '#0d0d10',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div className="stack" style={{ height: 320, padding: 14, borderRadius: 20, background: 'linear-gradient(160deg, rgba(var(--accent-rgb), .12), transparent 60%)' }}>
                  <span className="badge badge-accent" style={{ alignSelf: 'flex-start' }}>URECHKI</span>
                  {screen.blocks.map((height, i) => (
                    <div key={i} className="skeleton" style={{ height, borderRadius: 10, width: i % 2 ? '70%' : '100%' }} />
                  ))}
                </div>
              </div>
              <span className="small muted">{screen.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section container">
        <div className="section-head center">
          <span className="eyebrow">Что будет</span>
          <h2>Возможности приложения</h2>
        </div>
        <div className="grid grid-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-hover text-center stack" style={{ alignItems: 'center' }}>
              <span className="icon-btn text-accent"><Icon size={21} /></span>
              <strong className="small">{title}</strong>
              <p className="small muted" style={{ margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATUS */}
      <section className="section-sm container-narrow">
        <div className="glass-panel stack" style={{ padding: '34px 26px', alignItems: 'center', textAlign: 'center', borderColor: 'var(--border-accent)' }}>
          <CheckCircle size={30} className="text-accent" />
          <h2>Мы работаем над этим</h2>
          <p className="muted" style={{ maxWidth: 540, margin: 0 }}>
            Ссылки для скачивания появятся здесь после релиза. Пока все товары и акции доступны
            на сайте — а о дате запуска мы расскажем в рассылке.
          </p>
          <div className="flex gap-2 wrap center">
            <button className="btn btn-primary" onClick={notifyMe}><Bell size={16} /> Уведомить о релизе</button>
            <Link to="/contacts" className="btn btn-outline">Написать нам</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
