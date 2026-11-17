import { useState } from 'react';
import { MessageSquare, Star, ThumbsUp } from 'lucide-react';

const names = ['Алексей', 'Мария', 'Дмитрий', 'Ольга', 'Сергей', 'Анна', 'Иван', 'Елена', 'Максим', 'Татьяна'];
const texts = [
  'Отличное место! Пиво всегда свежее, закуски вкусные.',
  'Беру мерч уже второй раз — качество на высоте.',
  'Лучший стаут в городе, однозначно рекомендую.',
  'Приятная атмосфера и вежливый персонал. Заглядываем всей компанией.',
  'Сухарики просто огонь, беру с собой всегда.',
  'Крафт реально достойный. Рад, что в Новосибирске есть такое производство.',
];

// Демонстрационные отзывы: данные носят иллюстративный характер.
const reviews = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `${names[i % names.length]} ${i + 1}`,
  initials: names[i % names.length][0],
  text: texts[i % texts.length],
  rating: i % 3 === 0 ? 5 : 4,
  date: `${(i % 28) + 1} октября 2024`,
  likes: 3 + ((i * 7) % 40),
}));

const filters = [
  { value: 'Все', label: 'Все отзывы' },
  { value: '5', label: '5 звёзд' },
  { value: '4', label: '4 звезды' },
];

export default function Reviews() {
  const [filter, setFilter] = useState('Все');
  const [liked, setLiked] = useState([]);

  const filteredReviews = filter === 'Все' ? reviews : reviews.filter(r => String(r.rating) === filter);

  const toggleLike = (id) => {
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="fade-in">
      <section className="section container-narrow text-center">
        <span className="eyebrow">Голоса гостей</span>
        <h1>Отзывы</h1>
        <p className="muted" style={{ maxWidth: 620, margin: '16px auto 0' }}>
          Впечатления гостей о пиве, закусках и мерче. Ниже — демонстрационная подборка,
          иллюстрирующая оформление отзывов на сайте.
        </p>
        <span className="badge badge-accent" style={{ marginTop: 18 }}>демо-данные</span>
      </section>

      <section className="section-sm container">
        <div className="flex gap-2 wrap center" style={{ marginBottom: 30 }}>
          {filters.map(f => (
            <button
              key={f.value}
              className={`chip ${filter === f.value ? 'chip-active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="small dim">Показано: {filteredReviews.length}</span>

        <div className="grid grid-3" style={{ marginTop: 18 }}>
          {filteredReviews.map(rev => {
            const isLiked = liked.includes(rev.id);
            return (
              <article key={rev.id} className="card card-hover stack" style={{ borderLeft: '3px solid var(--accent)' }}>
                <div className="flex gap-2">
                  <span className="badge badge-accent" style={{ width: 44, height: 44, justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{rev.initials}</span>
                  <div>
                    <strong className="small">{rev.name}</strong>
                    <div className="tiny dim">{rev.date}</div>
                  </div>
                </div>
                <div className="flex gap-1" style={{ color: 'var(--accent)' }} aria-label={`${rev.rating} из 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={15} fill={i < rev.rating ? 'currentColor' : 'transparent'} />
                  ))}
                </div>
                <p className="small muted" style={{ fontStyle: 'italic', flex: 1, margin: 0 }}>«{rev.text}»</p>
                <div className="flex gap-2 wrap" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <button
                    className="text-button"
                    onClick={() => toggleLike(rev.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <ThumbsUp size={15} /> Полезно ({rev.likes + (isLiked ? 1 : 0)})
                  </button>
                  <span className="tiny dim flex gap-1"><MessageSquare size={14} /> Ответить</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
