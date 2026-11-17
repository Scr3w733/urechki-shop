import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Beer, CheckCircle, Headphones, Phone } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { featuresData } from '../data/features';

export default function FeaturePage() {
  const { id } = useParams();
  const feature = featuresData.find(f => f.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!feature) {
    return (
      <section className="section container-narrow">
        <EmptyState
          title="Страница не найдена"
          description="Такого раздела нет — возможно, ссылка устарела."
          action={<Link to="/" className="btn btn-primary">На главную</Link>}
        />
      </section>
    );
  }

  return (
    <div className="fade-in">
      <section className="section container-narrow">
        <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 28 }}>
          <ArrowLeft size={17} /> На главную
        </Link>

        <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: 32 }}>
          <span className="badge badge-accent" style={{ width: 64, height: 64, borderRadius: 18, justifyContent: 'center' }}>
            <Beer size={32} />
          </span>
          <div>
            <span className="eyebrow" style={{ marginBottom: 4 }}>Раздел сайта</span>
            <h1>{feature.title}</h1>
          </div>
        </div>

        <div className="glass-panel stack" style={{ padding: 32 }}>
          <p className="muted" style={{ fontSize: '1.05rem', lineHeight: 1.8, margin: 0 }}>{feature.desc}</p>
          <p className="muted" style={{ lineHeight: 1.8, margin: 0 }}>
            Мы трепетно относимся к качеству своих услуг. Каждый клиент для нас — часть большой
            семьи «У Речушки». Если у вас есть вопросы по этому разделу, свяжитесь с нашей
            службой поддержки по телефону <a className="text-accent bold" href="tel:+79516240161">+7 (951) 624-01-61</a>.
          </p>

          <div className="card" style={{ borderLeft: '3px solid var(--accent)', background: 'rgba(var(--accent-rgb), .06)' }}>
            <h3 style={{ marginBottom: 14 }}>Особенности раздела «{feature.title}»</h3>
            <ul className="stack small muted" style={{ gap: 8, paddingLeft: 20 }}>
              <li>Индивидуальный подход к каждому гостю.</li>
              <li>Только проверенная информация и актуальные данные.</li>
              <li>Постоянные обновления и улучшения сервиса.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-sm container-narrow">
        <div className="grid grid-3">
          <Link to="/catalog" className="card card-hover text-center stack" style={{ alignItems: 'center' }}>
            <Beer size={26} className="text-accent" />
            <strong className="small">Каталог</strong>
            <span className="small muted">Посмотреть все товары</span>
          </Link>
          <Link to="/faq" className="card card-hover text-center stack" style={{ alignItems: 'center' }}>
            <CheckCircle size={26} className="text-accent" />
            <strong className="small">FAQ</strong>
            <span className="small muted">Частые вопросы</span>
          </Link>
          <Link to="/contacts" className="card card-hover text-center stack" style={{ alignItems: 'center' }}>
            <Headphones size={26} className="text-accent" />
            <strong className="small">Поддержка</strong>
            <span className="small muted">Все способы связи</span>
          </Link>
        </div>
        <div className="text-center" style={{ marginTop: 24 }}>
          <a href="tel:+79516240161" className="btn btn-outline"><Phone size={16} /> Позвонить нам</a>
        </div>
      </section>
    </div>
  );
}
