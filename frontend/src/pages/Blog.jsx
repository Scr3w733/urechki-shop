import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock } from 'lucide-react';

const articles = [
  { id: 1, title: 'История сибирского пивоварения', desc: 'Как Новосибирск стал столицей крафта за Уралом.', img: '🏭', date: '12 ноября 2026', read: '5 мин' },
  { id: 2, title: 'Как правильно дегустировать пиво', desc: 'Гид для начинающих: температура, бокалы, аромат и вкус.', img: '🍺', date: '10 ноября 2026', read: '7 мин' },
  { id: 3, title: 'С чем сочетать разные сорта пива', desc: 'Гастрономические пары: от вяленого леща к лагеру до шоколада к стауту.', img: '🍽️', date: '5 ноября 2026', read: '10 мин' },
  { id: 4, title: 'Наш путь к идеальному IPA', desc: 'Сколько хмеля нужно для счастья? Рассказываем, как мы создавали «Сибирское IPA».', img: '🌿', date: '1 ноября 2026', read: '4 мин' },
];

export default function Blog() {
  return (
    <div className="fade-in">
      <section className="section container-narrow text-center">
        <span className="eyebrow">Журнал пивоварни</span>
        <h1>Наш блог</h1>
        <p className="muted" style={{ maxWidth: 640, margin: '16px auto 0' }}>
          О пивной культуре, рецептах и жизни пивоварни — коротко и по делу.
        </p>
      </section>

      <section className="section-sm container">
        <div className="grid grid-3">
          {articles.map(article => (
            <Link key={article.id} to={`/blog/${article.id}`} className="card card-hover stack">
              <div className="product-media" style={{ minHeight: 160, borderRadius: 'var(--radius-sm)', fontSize: '4rem' }}>
                <span role="img" aria-label={article.title}>{article.img}</span>
              </div>
              <div className="flex gap-2 wrap tiny dim">
                <span className="flex gap-1"><CalendarDays size={14} /> {article.date}</span>
                <span className="flex gap-1"><Clock size={14} /> {article.read}</span>
              </div>
              <h2 className="small bold">{article.title}</h2>
              <p className="small muted" style={{ flex: 1, margin: 0 }}>{article.desc}</p>
              <span className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>Читать статью <ArrowRight size={16} /></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
