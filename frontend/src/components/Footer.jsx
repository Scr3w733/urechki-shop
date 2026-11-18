import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Beer, Send, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const columns = [
  {
    title: 'Магазин',
    links: [
      ['/catalog', 'Каталог'],
      ['/product/1', 'Хиты продаж'],
      ['/merch', 'Мерч'],
      ['/roulette', 'Рулетка'],
      ['/app', 'Приложение'],
    ],
  },
  {
    title: 'Компания',
    links: [
      ['/about', 'О нас'],
      ['/production', 'Производство'],
      ['/reviews', 'Отзывы'],
      ['/blog', 'Блог'],
      ['/contacts', 'Контакты'],
    ],
  },
  {
    title: 'Помощь',
    links: [
      ['/faq', 'Вопросы и ответы'],
      ['/profile', 'Мой профиль'],
      ['/checkout', 'Доставка и оплата'],
      ['/status', 'Состояние сервисов'],
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const { addNotification } = useNotification();

  const subscribe = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      addNotification('Введите корректный email', 'error');
      return;
    }
    localStorage.setItem('urechki_newsletter', email);
    addNotification('Готово! Расскажем о новых сортах первыми', 'success');
    setEmail('');
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand" style={{ fontSize: '1.35rem', marginBottom: 18 }}>
              <span className="brand-mark"><Beer size={24} /></span> У РЕЧУШКИ
            </Link>
            <p className="small">Настоящий сибирский крафт с 2015 года. Варим с душой, разливаем с характером.</p>
            <div className="flex gap-2" style={{ marginTop: 20 }}>
              <a className="icon-btn" href="https://vk.com" target="_blank" rel="noreferrer" aria-label="ВКонтакте"><MessageCircle size={18} /></a>
            </div>
          </div>

          {columns.map(column => (
            <div key={column.title}>
              <h4 style={{ fontSize: '1rem', marginBottom: 18, fontFamily: 'Manrope, sans-serif' }}>{column.title}</h4>
              <div className="stack" style={{ gap: 11 }}>
                {column.links.map(([to, label]) => (
                  <Link key={to} to={to} className="nav-link small muted">{label}</Link>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: 18, fontFamily: 'Manrope, sans-serif' }}>Контакты</h4>
            <div className="stack" style={{ gap: 13 }}>
              <span className="flex gap-2 small muted"><Phone size={16} className="text-accent" /> +7 (951) 624-01-61</span>
              <span className="flex gap-2 small muted"><Mail size={16} className="text-accent" /> info@urechki.ru</span>
              <span className="flex gap-2 small muted" style={{ alignItems: 'flex-start' }}><MapPin size={16} className="text-accent" /> Новосибирск, ул. 2-я Воинская, 53</span>
            </div>
            <form onSubmit={subscribe} className="footer-subscribe">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Ваш email" aria-label="Email для подписки" />
              <button type="submit" aria-label="Подписаться"><Send size={17} /></button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Пивоварня «У Речушки». Все права защищены.</span>
          <span className="text-accent">Разработка сайта: Притчин Владимир, группа 9-прг401</span>
        </div>
      </div>
    </footer>
  );
}
