import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, Share2, Sparkles, Tag } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useNotification } from '../context/NotificationContext';
import { articles } from './Blog';

export default function BlogPost() {
  const { id } = useParams();
  const article = articles.find(item => item.id === id);
  const { addNotification } = useNotification();

  if (!article) {
    return (
      <section className="section container-narrow">
        <EmptyState
          title="Статья не найдена"
          description="Возможно, она переехала или ссылка устарела."
          action={<Link to="/blog" className="btn btn-primary">Ко всем статьям</Link>}
        />
      </section>
    );
  }

  // Похожие статьи подбираем по совпадению категории и тегов.
  const related = articles
    .filter(item => item.id !== article.id)
    .map(item => ({
      ...item,
      score: (item.category === article.category ? 2 : 0)
        + item.tags.filter(tag => article.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addNotification('Ссылка на статью скопирована', 'success');
    } catch {
      addNotification('Не удалось скопировать ссылку', 'error');
    }
  };

  return (
    <div className="fade-in">
      <article className="section container-narrow">
        <Link to="/blog" className="btn btn-ghost btn-sm" style={{ marginBottom: 28 }}>
          <ArrowLeft size={17} /> Ко всем статьям
        </Link>

        <div className="product-media" style={{ minHeight: 220, borderRadius: 'var(--radius)', fontSize: '6rem', marginBottom: 28 }}>
          <span role="img" aria-label={article.title}>{article.img}</span>
        </div>

        <div className="flex gap-2 wrap" style={{ alignItems: 'center', marginBottom: 12 }}>
          <span className="eyebrow"><Sparkles size={14} /> Журнал пивоварни</span>
          <span className="badge badge-accent">{article.category}</span>
        </div>
        <h1 style={{ marginBottom: 20 }}>{article.title}</h1>

        <div className="flex gap-2 wrap" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 24 }}>
          <span className="small muted flex gap-1"><CalendarDays size={15} /> {article.date}</span>
          <span className="small muted flex gap-1"><Clock size={15} /> {article.read}</span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={share}>
            <Share2 size={16} /> Поделиться
          </button>
        </div>

        <div className="flex gap-2 wrap" style={{ marginBottom: 28 }}>
          <Tag size={15} className="text-accent" />
          {article.tags.map(tag => (
            <Link key={tag} to="/blog" className="chip" title="Все статьи с этим тегом">#{tag}</Link>
          ))}
        </div>

        <p className="muted" style={{ fontSize: '1.05rem', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{article.content}</p>
      </article>

      <section className="section-sm container-narrow">
        <div className="section-head">
          <span className="eyebrow">Читайте также</span>
          <h2>Похожие статьи</h2>
          <p className="small">Подобраны по категории и тегам текущей статьи.</p>
        </div>
        <div className="grid grid-3">
          {related.map(item => (
            <Link key={item.id} to={`/blog/${item.id}`} className="card card-hover stack">
              <span className="badge badge-accent" style={{ fontSize: '2rem', alignSelf: 'flex-start' }} role="img" aria-label={item.title}>{item.img}</span>
              <span className="tiny dim">{item.category}</span>
              <h3 className="small bold">{item.title}</h3>
              <span className="tiny dim">{item.date} · {item.read}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
