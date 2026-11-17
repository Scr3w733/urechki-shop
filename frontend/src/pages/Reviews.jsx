import { useState } from 'react';
import { Info, MessageSquare, PenLine, Star, ThumbsUp } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const demoReviews = [
  { id: 'demo-1', name: 'Алексей', initials: 'А', text: 'Пиво свежее, доставили быстро. Стало моим любимым магазином.', rating: 5, date: 'ноябрь 2026', likes: 4, demo: true },
  { id: 'demo-2', name: 'Мария', initials: 'М', text: 'Заказывала набор в подарок — красивая упаковка и отличный состав.', rating: 5, date: 'ноябрь 2026', likes: 3, demo: true },
  { id: 'demo-3', name: 'Дмитрий', initials: 'Д', text: 'Нравится, что можно собрать свою футболку. Качество ткани порадовало.', rating: 4, date: 'октябрь 2026', likes: 2, demo: true },
  { id: 'demo-4', name: 'Ольга', initials: 'О', text: 'Брала сухарики и лагер на вечер — всё приехало охлаждённым.', rating: 5, date: 'октябрь 2026', likes: 5, demo: true },
];

const REVIEWS_KEY = 'urechki_reviews';
const emptyForm = { name: '', rating: 5, text: '' };
const filters = [
  { value: 'Все', label: 'Все отзывы' },
  { value: '5', label: '5 звёзд' },
  { value: '4', label: '4 звезды' },
  { value: '3', label: '3 звезды' },
];

const readReviews = () => {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function Reviews() {
  const [filter, setFilter] = useState('Все');
  const [liked, setLiked] = useState([]);
  const [userReviews, setUserReviews] = useState(readReviews);
  const [form, setForm] = useState(emptyForm);
  const { addNotification } = useNotification();

  const allReviews = [...userReviews, ...demoReviews];
  const filteredReviews = filter === 'Все' ? allReviews : allReviews.filter(r => String(r.rating) === filter);

  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const count = allReviews.filter(review => Number(review.rating) === stars).length;
    return { stars, count, percent: allReviews.length ? Math.round((count / allReviews.length) * 100) : 0 };
  });
  const average = allReviews.length
    ? (allReviews.reduce((sum, review) => sum + Number(review.rating), 0) / allReviews.length).toFixed(1)
    : '—';

  const toggleLike = (id) => {
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      addNotification('Укажите имя и текст отзыва', 'error');
      return;
    }
    const entry = {
      id: `user-${Date.now()}`,
      name: form.name.trim(),
      initials: form.name.trim()[0].toUpperCase(),
      text: form.text.trim(),
      rating: Number(form.rating),
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
      likes: 0,
      local: true,
    };
    try {
      const next = [entry, ...userReviews].slice(0, 30);
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(next));
      setUserReviews(next);
      setForm(emptyForm);
      addNotification('Отзыв сохранён в этом браузере', 'success');
    } catch {
      addNotification('Не удалось сохранить отзыв — попробуйте ещё раз', 'error');
    }
  };

  return (
    <div className="fade-in">
      <section className="section container-narrow text-center">
        <span className="eyebrow">Голоса гостей</span>
        <h1>Отзывы</h1>
        <p className="muted" style={{ maxWidth: 640, margin: '16px auto 0' }}>
          Впечатления гостей о пиве, закусках и мерче. Демонстрационные тексты помечены как
          «пример»; отзывы, которые вы оставите здесь, сохраняются только в этом браузере.
        </p>
      </section>

      <section className="section-sm container">
        <div className="glass-panel grid grid-2" style={{ padding: 28, gap: 32, alignItems: 'center' }}>
          <div className="stack" style={{ alignItems: 'center', textAlign: 'center' }}>
            <span style={{ fontSize: '3.4rem', fontWeight: 800, lineHeight: 1 }} className="text-accent">{average}</span>
            <div className="flex gap-1" style={{ color: 'var(--accent)' }} aria-label={`Средняя оценка ${average} из 5`}>
              {Array.from({ length: 5 }, (_, i) => <Star key={i} size={20} fill={i < Math.round(Number(average) || 0) ? 'currentColor' : 'transparent'} />)}
            </div>
            <span className="small muted">Средняя оценка по {allReviews.length} отзывам на странице</span>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {distribution.map(({ stars, count, percent }) => (
              <div key={stars} className="flex gap-2" style={{ alignItems: 'center' }}>
                <span className="small" style={{ width: 46, color: 'var(--accent)', display: 'flex', gap: 3, alignItems: 'center' }}>
                  {stars} <Star size={13} fill="currentColor" />
                </span>
                <div style={{ flex: 1, height: 9, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, height: '100%', borderRadius: 99, background: 'var(--accent)', transition: 'width .3s' }} />
                </div>
                <span className="tiny dim" style={{ width: 34, textAlign: 'right' }}>{count} · {percent}%</span>
              </div>
            ))}
            <p className="tiny dim" style={{ margin: '4px 0 0' }}>
              Распределение считается по отзывам, показанным на странице: примеры и локальные записи.
            </p>
          </div>
        </div>
      </section>

      <section className="section-sm container-narrow">
        <form className="glass-panel stack" style={{ padding: 24 }} onSubmit={submitReview}>
          <div className="flex gap-2" style={{ alignItems: 'center' }}>
            <PenLine size={20} className="text-accent" />
            <div>
              <h2 style={{ margin: 0 }}>Оставить отзыв</h2>
              <p className="tiny dim" style={{ margin: 0 }}>Локально: запись сохранится только в этом браузере.</p>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="review-name">Ваше имя</label>
            <input
              id="review-name"
              className="input"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Как вас зовут"
            />
          </div>
          <div className="form-group">
            <span className="form-label">Оценка</span>
            <div className="flex gap-1" style={{ alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  type="button"
                  className="icon-btn"
                  onClick={() => setForm(prev => ({ ...prev, rating: value }))}
                  aria-label={`${value} ${value === 1 ? 'звезда' : value < 5 ? 'звезды' : 'звёзд'}`}
                  aria-pressed={form.rating === value}
                  style={{ color: value <= form.rating ? 'var(--accent)' : 'var(--text-dim)' }}
                >
                  <Star size={22} fill={value <= form.rating ? 'currentColor' : 'transparent'} />
                </button>
              ))}
              <span className="small muted" style={{ marginLeft: 8 }}>{form.rating} из 5</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="review-text">Текст отзыва</label>
            <textarea
              id="review-text"
              className="textarea"
              value={form.text}
              onChange={e => setForm(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Что понравилось, что можно улучшить?"
            />
          </div>
          <button type="submit" className="btn btn-primary">Сохранить отзыв</button>
        </form>
      </section>

      <section className="section-sm container">
        <div className="flex gap-2 wrap center" style={{ marginBottom: 24 }}>
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
        <div className="flex between wrap gap-2" style={{ marginBottom: 18 }}>
          <span className="small dim">Показано: {filteredReviews.length}</span>
          <span className="tiny dim flex gap-1"><Info size={13} /> Лайки также работают только в этой сессии</span>
        </div>

        <div className="grid grid-3">
          {filteredReviews.map(rev => {
            const isLiked = liked.includes(rev.id);
            return (
              <article key={rev.id} className="card card-hover stack" style={{ borderLeft: '3px solid var(--accent)' }}>
                <div className="flex between gap-2">
                  <div className="flex gap-2">
                    <span className="badge badge-accent" style={{ width: 44, height: 44, justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{rev.initials}</span>
                    <div>
                      <strong className="small">{rev.name}</strong>
                      <div className="tiny dim">{rev.date}</div>
                    </div>
                  </div>
                  <span className="badge tiny">{rev.demo ? 'пример' : 'вы оставили'}</span>
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
                  <span className="tiny dim flex gap-1"><MessageSquare size={14} /> Спасибо за отзыв</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
