import { Link } from 'react-router-dom';
import { ArrowLeft, Beer, Compass, HelpCircle, Home, MapPin, Search } from 'lucide-react';

const quickLinks = [
  { to: '/about', icon: Beer, label: 'О нас', desc: 'Наша история' },
  { to: '/faq', icon: HelpCircle, label: 'FAQ', desc: 'Частые вопросы' },
  { to: '/contacts', icon: MapPin, label: 'Контакты', desc: 'Адреса баров' },
];

export default function NotFound() {
  return (
    <section className="section container-narrow text-center" style={{ minHeight: '78vh' }}>
      <span className="badge badge-accent" style={{ width: 96, height: 96, borderRadius: '50%', justifyContent: 'center', marginBottom: 24 }} role="img" aria-label="Пиво">
        <Beer size={48} />
      </span>
      <span className="eyebrow" style={{ justifyContent: 'center' }}>Ошибка 404</span>
      <h1 className="text-accent" style={{ fontSize: 'clamp(4rem, 12vw, 8rem)', lineHeight: 1, margin: '12px 0 8px' }}>404</h1>
      <h2 style={{ marginBottom: 16 }}>Эта страница уже выпита</h2>
      <p className="muted" style={{ maxWidth: 540, margin: '0 auto 32px' }}>
        Кажется, вы свернули не туда. Возможно, страница была перемещена или в адресе есть
        опечатка. Проверьте ссылку или начните с главной.
      </p>
      <div className="flex gap-2 wrap center">
        <Link to="/" className="btn btn-primary btn-lg"><Home size={18} /> На главную</Link>
        <Link to="/catalog" className="btn btn-outline btn-lg"><Compass size={18} /> В каталог</Link>
      </div>

      <div className="glass-panel" style={{ padding: 24, marginTop: 44, textAlign: 'left' }}>
        <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: 16 }}>
          <Search size={17} className="text-accent" />
          <h3 className="small bold" style={{ margin: 0 }}>Популярные разделы</h3>
        </div>
        <div className="grid grid-3">
          {quickLinks.map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="card card-hover stack text-center" style={{ alignItems: 'center' }}>
              <Icon size={22} className="text-accent" />
              <strong className="small">{label}</strong>
              <span className="tiny muted">{desc}</span>
            </Link>
          ))}
        </div>
      </div>

      <span className="tiny dim flex gap-1" style={{ justifyContent: 'center', marginTop: 32 }}>
        <ArrowLeft size={13} /> Ничего страшного — пиво ещё есть.
      </span>
    </section>
  );
}
