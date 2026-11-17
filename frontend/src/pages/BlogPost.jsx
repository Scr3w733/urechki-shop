import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, Share2, Sparkles } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useNotification } from '../context/NotificationContext';

const articlesData = {
  '1': {
    title: 'История сибирского пивоварения',
    img: '🏭',
    date: '12 ноября 2026',
    read: '5 мин',
    content: `История пивоварения в Сибири уходит корнями в глубокое прошлое. Ещё в XIX веке в Ново-Николаевске начали открываться первые частные пивоварни. Местные купцы быстро поняли, что сибирская вода и отборный ячмень дают невероятный вкус. Мы решили возродить традиции честного, ручного пивоварения.`,
  },
  '2': {
    title: 'Как правильно дегустировать пиво',
    img: '🍺',
    date: '10 ноября 2026',
    read: '7 мин',
    content: `Многие пьют пиво, даже не задумываясь о его букете.\n\n1. Температура. Лагеры пьют охлаждёнными (4–8 °C), а стауты раскрываются при 10–14 °C.\n2. Бокал. Форма влияет на аромат.\n3. Аромат. Понюхайте перед первым глотком.\n4. Вкус. Оцените горечь и послевкусие.`,
  },
  '3': {
    title: 'С чем сочетать разные сорта пива',
    img: '🍽️',
    date: '5 ноября 2026',
    read: '10 мин',
    content: `Гастрономические сочетания — это наука. Лагер идеально идёт с вяленой рыбой. Тёмный стаут отлично сочетается с десертами и мясом. Пшеничное пиво подчеркнёт вкус салатов. Приходите в наши бары за специальными сетами!`,
  },
  '4': {
    title: 'Наш путь к идеальному IPA',
    img: '🌿',
    date: '1 ноября 2026',
    read: '4 мин',
    content: `IPA — один из самых популярных стилей. Мы экспериментировали с пятью сортами хмеля. В итоге остановились на комбинации, которая даёт яркий цитрусовый аромат и мягкую горечь. Попробуйте «Сибирский IPA» в нашем баре!`,
  },
};

const otherArticles = Object.entries(articlesData).filter(([key]) => key !== '1').slice(0, 3);

export default function BlogPost() {
  const { id } = useParams();
  const article = articlesData[id];
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

        <span className="eyebrow"><Sparkles size={14} /> Журнал пивоварни</span>
        <h1 style={{ marginBottom: 20 }}>{article.title}</h1>

        <div className="flex gap-2 wrap" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 32 }}>
          <span className="small muted flex gap-1"><CalendarDays size={15} /> {article.date}</span>
          <span className="small muted flex gap-1"><Clock size={15} /> {article.read}</span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={share}>
            <Share2 size={16} /> Поделиться
          </button>
        </div>

        <p className="muted" style={{ fontSize: '1.05rem', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{article.content}</p>
      </article>

      <section className="section-sm container-narrow">
        <div className="section-head">
          <span className="eyebrow">Читайте также</span>
          <h2>Другие статьи</h2>
        </div>
        <div className="grid grid-3">
          {otherArticles.map(([key, item]) => (
            <Link key={key} to={`/blog/${key}`} className="card card-hover stack">
              <span className="badge badge-accent" style={{ fontSize: '2rem', alignSelf: 'flex-start' }} role="img" aria-label={item.title}>{item.img}</span>
              <h3 className="small bold">{item.title}</h3>
              <span className="tiny dim">{item.date} · {item.read}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
