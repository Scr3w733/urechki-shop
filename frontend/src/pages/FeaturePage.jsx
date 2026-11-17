import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Beer, CheckCircle, ChevronRight, Headphones, HelpCircle, Phone, ShoppingBag } from 'lucide-react';
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
        <div className="flex gap-2 wrap" style={{ alignItems: 'center', marginBottom: 28 }}>
          <Link to="/" className="btn btn-ghost btn-sm"><ArrowLeft size={17} /> На главную</Link>
          <span className="tiny dim flex gap-1" style={{ alignItems: 'center' }}>
            <ChevronRight size={13} /> {feature.title}
          </span>
        </div>

        <div className="flex gap-3" style={{ alignItems: 'center', marginBottom: 18 }}>
          <span className="badge badge-accent" style={{ width: 64, height: 64, borderRadius: 18, justifyContent: 'center', flexShrink: 0 }}>
            <Beer size={32} />
          </span>
          <div>
            <span className="eyebrow" style={{ marginBottom: 4 }}>Раздел сайта</span>
            <h1 style={{ margin: 0 }}>{feature.title}</h1>
          </div>
        </div>
        <p className="muted" style={{ fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 720, margin: '0 0 32px' }}>
          {feature.desc}
        </p>

        <div className="glass-panel stack" style={{ padding: 32, gap: 18 }}>
          <div>
            <span className="eyebrow">Коротко</span>
            <h2 style={{ marginBottom: 12 }}>Что стоит знать</h2>
            <p className="small muted" style={{ margin: 0, lineHeight: 1.8 }}>
              Информация в разделе носит справочный характер. Условия акций, доставки и часов
              работы уточняйте в актуальных разделах сайта или у службы поддержки.
            </p>
          </div>

          <div className="card" style={{ borderLeft: '3px solid var(--accent)', background: 'rgba(var(--accent-rgb), .06)' }}>
            <h3 className="small bold" style={{ marginBottom: 14 }}>Где найти подробности</h3>
            <ul className="stack small muted" style={{ gap: 10, paddingLeft: 18, margin: 0 }}>
              <li className="flex gap-2" style={{ alignItems: 'flex-start' }}><CheckCircle size={16} className="text-accent" /> Товары и цены — в каталоге.</li>
              <li className="flex gap-2" style={{ alignItems: 'flex-start' }}><CheckCircle size={16} className="text-accent" /> Типичные вопросы — в разделе FAQ.</li>
              <li className="flex gap-2" style={{ alignItems: 'flex-start' }}><CheckCircle size={16} className="text-accent" /> Адреса и телефоны — на странице контактов.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-sm container-narrow">
        <div className="section-head center">
          <span className="eyebrow">Куда дальше</span>
          <h2>Полезные разделы</h2>
        </div>
        <div className="grid grid-3">
          <Link to="/catalog" className="card card-hover text-center stack" style={{ alignItems: 'center' }}>
            <ShoppingBag size={26} className="text-accent" />
            <strong className="small">Каталог</strong>
            <span className="small muted">Все товары и цены</span>
          </Link>
          <Link to="/faq" className="card card-hover text-center stack" style={{ alignItems: 'center' }}>
            <HelpCircle size={26} className="text-accent" />
            <strong className="small">FAQ</strong>
            <span className="small muted">Частые вопросы</span>
          </Link>
          <Link to="/contacts" className="card card-hover text-center stack" style={{ alignItems: 'center' }}>
            <Headphones size={26} className="text-accent" />
            <strong className="small">Поддержка</strong>
            <span className="small muted">Все способы связи</span>
          </Link>
        </div>
        <div className="flex gap-2 wrap center" style={{ marginTop: 24 }}>
          <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
          <a href="tel:+79516240161" className="btn btn-outline"><Phone size={16} /> Позвонить нам</a>
        </div>
      </section>
    </div>
  );
}
