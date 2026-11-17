import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock, Tag } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export const articles = [
  {
    id: '1',
    title: 'История сибирского пивоварения',
    desc: 'Как Новосибирск стал столицей крафта за Уралом.',
    img: '🏭',
    date: '12 ноября 2026',
    read: '5 мин',
    category: 'История',
    tags: ['Сибирь', 'Пивоварение', 'Новосибирск'],
    content: `История пивоварения в Сибири уходит корнями в глубокое прошлое. Ещё в XIX веке в Ново-Николаевске начали открываться первые частные пивоварни. Местные купцы быстро поняли, что сибирская вода и отборный ячмень дают невероятный вкус. Мы решили возродить традиции честного, ручного пивоварения.`,
  },
  {
    id: '2',
    title: 'Как правильно дегустировать пиво',
    desc: 'Гид для начинающих: температура, бокалы, аромат и вкус.',
    img: '🍺',
    date: '10 ноября 2026',
    read: '7 мин',
    category: 'Гид',
    tags: ['Дегустация', 'Советы', 'Стиль'],
    content: `Многие пьют пиво, даже не задумываясь о его букете.\n\n1. Температура. Лагеры пьют охлаждёнными (4–8 °C), а стауты раскрываются при 10–14 °C.\n2. Бокал. Форма влияет на аромат.\n3. Аромат. Понюхайте перед первым глотком.\n4. Вкус. Оцените горечь и послевкусие.`,
  },
  {
    id: '3',
    title: 'С чем сочетать разные сорта пива',
    desc: 'Гастрономические пары: от вяленого леща к лагеру до шоколада к стауту.',
    img: '🍽️',
    date: '5 ноября 2026',
    read: '10 мин',
    category: 'Гастрономия',
    tags: ['Сочетания', 'Закуски', 'Стиль'],
    content: `Гастрономические сочетания — это наука. Лагер идеально идёт с вяленой рыбой. Тёмный стаут отлично сочетается с десертами и мясом. Пшеничное пиво подчеркнёт вкус салатов. Приходите в наши бары за специальными сетами!`,
  },
  {
    id: '4',
    title: 'Наш путь к идеальному IPA',
    desc: 'Сколько хмеля нужно для счастья? Рассказываем, как мы создавали «Сибирское IPA».',
    img: '🌿',
    date: '1 ноября 2026',
    read: '4 мин',
    category: 'Пивоварение',
    tags: ['IPA', 'Хмель', 'Рецептуры', 'Пивоварение'],
    content: `IPA — один из самых популярных стилей. Мы экспериментировали с пятью сортами хмеля. В итоге остановились на комбинации, которая даёт яркий цитрусовый аромат и мягкую горечь. Попробуйте «Сибирский IPA» в нашем баре!`,
  },
];

const categories = ['Все', ...new Set(articles.map(article => article.category))];
const tags = [...new Set(articles.flatMap(article => article.tags))];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('Все');
  const [activeTag, setActiveTag] = useState('Все');

  const filtered = useMemo(() => articles.filter(article => {
    const byCategory = activeCategory === 'Все' || article.category === activeCategory;
    const byTag = activeTag === 'Все' || article.tags.includes(activeTag);
    return byCategory && byTag;
  }), [activeCategory, activeTag]);

  const resetFilters = () => {
    setActiveCategory('Все');
    setActiveTag('Все');
  };

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
        <div className="glass-panel stack" style={{ padding: 20, marginBottom: 28 }}>
          <span className="form-label"><Tag size={14} /> Раздел</span>
          <div className="flex gap-2 wrap">
            {categories.map(category => (
              <button
                key={category}
                className={`chip ${activeCategory === category ? 'chip-active' : ''}`}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
          <span className="form-label" style={{ marginTop: 8 }}>Теги</span>
          <div className="flex gap-2 wrap">
            <button
              className={`chip ${activeTag === 'Все' ? 'chip-active' : ''}`}
              onClick={() => setActiveTag('Все')}
              aria-pressed={activeTag === 'Все'}
            >
              Все теги
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                className={`chip ${activeTag === tag ? 'chip-active' : ''}`}
                onClick={() => setActiveTag(tag)}
                aria-pressed={activeTag === tag}
              >
                #{tag}
              </button>
            ))}
          </div>
          <div className="flex between wrap gap-2">
            <span className="tiny dim">Показано: {filtered.length} из {articles.length}</span>
            {(activeCategory !== 'Все' || activeTag !== 'Все') && (
              <button className="text-button small text-accent" onClick={resetFilters}>Сбросить фильтры</button>
            )}
          </div>
        </div>

        {filtered.length ? (
          <div className="grid grid-3">
            {filtered.map(article => (
              <Link key={article.id} to={`/blog/${article.id}`} className="card card-hover stack">
                <div className="product-media" style={{ minHeight: 160, borderRadius: 'var(--radius-sm)', fontSize: '4rem' }}>
                  <span role="img" aria-label={article.title}>{article.img}</span>
                </div>
                <div className="flex gap-2 wrap tiny dim">
                  <span className="flex gap-1"><CalendarDays size={14} /> {article.date}</span>
                  <span className="flex gap-1"><Clock size={14} /> {article.read}</span>
                </div>
                <span className="badge badge-accent" style={{ alignSelf: 'flex-start' }}>{article.category}</span>
                <h2 className="small bold">{article.title}</h2>
                <p className="small muted" style={{ flex: 1, margin: 0 }}>{article.desc}</p>
                <div className="flex gap-1 wrap">
                  {article.tags.map(tag => <span key={tag} className="tiny dim">#{tag}</span>)}
                </div>
                <span className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>Читать статью <ArrowRight size={16} /></span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Статей по этим фильтрам нет"
            description="Попробуйте другой раздел или тег — мы регулярно добавляем новые материалы."
            action={<button className="btn btn-outline" onClick={resetFilters}>Сбросить фильтры</button>}
          />
        )}
      </section>
    </div>
  );
}
