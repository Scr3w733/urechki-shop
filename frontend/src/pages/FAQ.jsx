import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle, Phone, Search, X } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const faqData = [
  { category: 'Доставка', q: 'Как происходит доставка?', a: 'Мы доставляем заказы по Новосибирску курьерами в течение 1–2 часов. Доставка бесплатна при заказе от 2000 рублей, в остальных случаях — 300 рублей.' },
  { category: 'Оплата', q: 'Можно ли оплатить заказ бонусами?', a: 'Да, бонусами можно оплатить до 50% суммы заказа. Бонусы начисляются в размере 10% от каждой покупки.' },
  { category: 'Хранение', q: 'Как долго хранится пиво?', a: 'Нефильтрованное пиво рекомендуем употребить в течение 5–7 дней. Фильтрованное хранится до 6 месяцев при температуре от +2 до +8 °C.' },
  { category: 'Ассортимент', q: 'Есть ли у вас безалкогольное пиво?', a: 'Да, в ассортименте есть безалкогольное пиво «У Речушки» — вкус классического лагера без алкоголя.' },
  { category: 'Лояльность', q: 'Как работает программа лояльности?', a: 'При регистрации вы становитесь участником клуба: копите бонусы с покупок и получаете персональные промокоды на день рождения.' },
  { category: 'Бары', q: 'Где можно попробовать пиво в розлив?', a: 'В четырёх фирменных барах Новосибирска: на 2-й Воинской, Ленина, Красном проспекте и Кирова. Также проводим экскурсии на заводе.' },
];

const categories = ['Все', ...new Set(faqData.map(item => item.category))];

export default function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return faqData.filter(item => {
      const byCategory = activeCategory === 'Все' || item.category === activeCategory;
      const byQuery = !text || `${item.q} ${item.a}`.toLowerCase().includes(text);
      return byCategory && byQuery;
    });
  }, [query, activeCategory]);

  const resetFilters = () => {
    setQuery('');
    setActiveCategory('Все');
  };

  return (
    <div className="fade-in">
      <section className="section container-narrow text-center">
        <span className="eyebrow"><HelpCircle size={14} /> Помощь</span>
        <h1>Вопросы и ответы</h1>
        <p className="muted" style={{ maxWidth: 620, margin: '16px auto 0' }}>
          Всё, что вы хотели знать о доставке, оплате, хранении пива и нашей программе лояльности.
        </p>
      </section>

      <section className="section-sm container-narrow">
        <div className="glass-panel stack" style={{ padding: 20, marginBottom: 24 }}>
          <label className="form-label" htmlFor="faq-search">Поиск по вопросам</label>
          <div className="flex gap-2" style={{ alignItems: 'center' }}>
            <Search size={18} className="text-accent" style={{ flexShrink: 0 }} />
            <input
              id="faq-search"
              className="input"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Например: бонусы, доставка, хранение"
            />
            {query && (
              <button className="icon-btn" onClick={() => setQuery('')} aria-label="Очистить поиск" title="Очистить">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex gap-2 wrap" style={{ marginTop: 6 }}>
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
          <span className="tiny dim">
            {filtered.length === faqData.length
              ? `Все вопросы: ${faqData.length}`
              : `Найдено: ${filtered.length} из ${faqData.length}`}
          </span>
        </div>

        {filtered.length ? (
          <div className="stack" style={{ gap: 12 }}>
            {filtered.map(item => {
              const isOpen = openQuestion === item.q;
              return (
                <div key={item.q} className="glass-panel" style={{ overflow: 'hidden' }}>
                  <button
                    className="flex between"
                    onClick={() => setOpenQuestion(isOpen ? null : item.q)}
                    style={{ width: '100%', padding: '20px 22px', background: 'none', border: 'none', color: 'var(--text)', gap: 16, textAlign: 'left' }}
                    aria-expanded={isOpen}
                  >
                    <span>
                      <span className="badge badge-accent tiny" style={{ marginBottom: 8 }}>{item.category}</span>
                      <span className="bold" style={{ display: 'block' }}>{item.q}</span>
                    </span>
                    <ChevronDown size={19} className="text-accent" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                        <p className="small muted" style={{ padding: '0 22px 22px', margin: 0, lineHeight: 1.8 }}>{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Ничего не нашлось"
            description="Попробуйте другой запрос или сбросьте фильтры — возможно, ответ сформулирован иначе."
            action={<button className="btn btn-outline" onClick={resetFilters}>Сбросить фильтры</button>}
          />
        )}
      </section>

      <section className="section-sm container-narrow">
        <div className="glass-panel text-center stack" style={{ padding: '34px 26px', alignItems: 'center', borderColor: 'var(--border-accent)' }}>
          <MessageCircle size={28} className="text-accent" />
          <h2>Не нашли ответ?</h2>
          <p className="muted" style={{ maxWidth: 480, margin: 0 }}>Напишите нам или позвоните — подскажем по любому вопросу.</p>
          <div className="flex gap-2 wrap center">
            <Link to="/contacts" className="btn btn-primary">Написать нам</Link>
            <a href="tel:+79516240161" className="btn btn-outline"><Phone size={16} /> Позвонить</a>
          </div>
        </div>
      </section>
    </div>
  );
}
