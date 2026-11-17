import { Link } from 'react-router-dom';
import { ArrowLeft, Beer, Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="section container-narrow text-center" style={{ minHeight: '70vh' }}>
      <span className="badge badge-accent" style={{ width: 96, height: 96, borderRadius: '50%', justifyContent: 'center', fontSize: '3rem', marginBottom: 24 }} role="img" aria-label="Пиво">
        <Beer size={48} />
      </span>
      <span className="eyebrow" style={{ justifyContent: 'center' }}>Ошибка 404</span>
      <h1 className="text-accent" style={{ fontSize: 'clamp(4rem, 12vw, 8rem)', lineHeight: 1, marginBottom: 16 }}>404</h1>
      <h2 style={{ marginBottom: 16 }}>Ой! Эта страница уже выпита.</h2>
      <p className="muted" style={{ maxWidth: 540, margin: '0 auto 32px' }}>
        Кажется, вы свернули не туда. Возможно, страница была перемещена или в адресе есть опечатка.
      </p>
      <div className="flex gap-2 wrap center">
        <Link to="/" className="btn btn-primary btn-lg"><Home size={18} /> На главную</Link>
        <Link to="/catalog" className="btn btn-outline btn-lg"><Compass size={18} /> В каталог</Link>
      </div>
      <div className="flex gap-2 wrap center" style={{ marginTop: 40 }}>
        <Link to="/about" className="nav-link small muted">О нас</Link>
        <Link to="/faq" className="nav-link small muted">FAQ</Link>
        <Link to="/contacts" className="nav-link small muted">Контакты</Link>
      </div>
      <span className="tiny dim" style={{ display: 'block', marginTop: 48 }}>
        <ArrowLeft size={12} /> Ничего страшного — пиво ещё есть.
      </span>
    </section>
  );
}
