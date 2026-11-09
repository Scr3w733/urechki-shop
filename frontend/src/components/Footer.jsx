import { Link } from 'react-router-dom';
import { Beer, Send, Globe, Camera, PlayCircle, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#050505', borderTop: '1px solid rgba(212,175,55,0.2)', padding: '80px 10% 30px', marginTop: '100px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '60px' }}>
        
        {/* Колонка 1: Лого */}
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '2rem', fontWeight: 900, color: '#d4af37', marginBottom: '20px' }}>
            <Beer size={40} /> У РЕЧУШКИ
          </Link>
          <p style={{ color: '#888', lineHeight: '1.8', marginBottom: '20px' }}>
            Настоящий сибирский крафт. Мы варим пиво с душой с 2015 года. Присоединяйтесь к нашей культуре!
          </p>
          <div style={{ display: 'flex', gap: '15px', color: '#d4af37' }}>
            <Globe style={{ cursor: 'pointer' }} />
            <Camera style={{ cursor: 'pointer' }} />
            <PlayCircle style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* Колонка 2: Меню */}
        <div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px' }}>Навигация</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', color: '#888' }}>
            <li><Link to="/catalog" className="nav-link">Каталог товаров</Link></li>
            <li><Link to="/about" className="nav-link">История компании</Link></li>
            <li><Link to="/production" className="nav-link">Производство</Link></li>
            <li><Link to="/reviews" className="nav-link">Отзывы</Link></li>
            <li><Link to="/contacts" className="nav-link">Контакты</Link></li>
          </ul>
        </div>

        {/* Колонка 3: Контакты */}
        <div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px' }}>Контакты</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px', color: '#888' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={18} color="#d4af37" /> +7 (951) 624-01-61</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={18} color="#d4af37" /> info@urechki.ru</li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><MapPin size={18} color="#d4af37" /> г. Новосибирск, ул. 2-я Воинская, 53</li>
          </ul>
        </div>

        {/* Колонка 4: Рассылка */}
        <div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px' }}>Подписка на новинки</h3>
          <p style={{ color: '#888', marginBottom: '15px' }}>Узнавайте первыми о новых сортах и закрытых акциях.</p>
          <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
            <input type="email" placeholder="Ваш Email" style={{ background: 'transparent', border: 'none', padding: '15px', color: '#fff', flex: 1, outline: 'none' }} />
            <button style={{ background: '#d4af37', border: 'none', padding: '0 20px', cursor: 'pointer' }}><Send size={20} color="#000" /></button>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #222', paddingTop: '20px', textAlign: 'center', color: '#555', fontSize: '0.9rem' }}>
        © 2026 Пивоварня «У Речушки». Все права защищены. <br/>
        <span style={{ color: '#d4af37' }}>Разработка сайта: Притчин Владимир, группа 9-прг401</span>
      </div>
    </footer>
  );
}