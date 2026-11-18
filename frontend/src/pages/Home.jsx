import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Beer,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock,
  Gift,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView';
import { ProductGridSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { categoryEmoji, categoryGradient, heroImage, productImage } from '../utils/product';

const categories = [
  { name: 'Пиво', desc: 'Классика и смелой крафт', to: '/catalog?search=Пиво' },
  { name: 'Закуски', desc: 'Проверенное к пиву', to: '/catalog?search=Закуски' },
  { name: 'Наборы', desc: 'Готовый подарок', to: '/catalog?search=Наборы' },
  { name: 'Мерч', desc: 'Своя футболка', to: '/merch' },
  { name: 'Сертификаты', desc: 'Подарок на любой вкус', to: '/catalog?search=Сертификаты' },
];

const tasteFilters = [
  { id: 'light', label: 'Лёгкое', emoji: '🌾', keywords: ['легк', 'лагер', 'лайт', 'light', 'светл', 'пилс', 'блонд'] },
  { id: 'bitter', label: 'Горькое', emoji: '🌿', keywords: ['горьк', 'ipa', 'айпа', 'хмел', 'индиа', 'биттер'] },
  { id: 'sour', label: 'Кислое', emoji: '🍋', keywords: ['кисл', 'сауэр', 'sour', 'лабик', 'ламбик'] },
  { id: 'dark', label: 'Тёмное', emoji: '☕', keywords: ['тёмн', 'темн', 'стаут', 'портер', 'шоколад', 'кофе', 'dark'] },
  { id: 'free', label: 'Безалкогольное', emoji: '🚫', keywords: ['безалкоголь', 'б/а', 'zero', '0.0', '0,0'] },
];

const advantages = [
  { icon: Truck, title: 'Доставка 1–2 часа', desc: 'Привезём свежим и охлаждённым по Новосибирску' },
  { icon: ShieldCheck, title: 'Своя пивоварня', desc: 'Варим сами, без посредников, с 2015 года' },
  { icon: Gift, title: 'Бонусы за покупки', desc: 'Копите бонусы и оплачивайте ими до 50% заказа' },
  { icon: Award, title: 'Проверенное качество', desc: 'Каждая партия проходит контроль на производстве' },
];

const stats = [
  { value: '2015', label: 'год основания' },
  { value: '5', label: 'адресов в городе' },
  { value: '2018', label: 'своя пивоварня' },
  { value: '1–2 ч', label: 'доставка по городу' },
];

const reviewHighlights = [
  { name: 'Алексей', initials: 'А', text: 'Пиво свежее, доставили быстро. Стало моим любимым магазином.', date: 'ноябрь 2026' },
  { name: 'Мария', initials: 'М', text: 'Заказывала набор в подарок — красивая упаковка и отличный состав.', date: 'ноябрь 2026' },
  { name: 'Дмитрий', initials: 'Д', text: 'Нравится, что можно собрать свою футболку. Качество ткани порадовало.', date: 'октябрь 2026' },
];

const faqTeaser = [
  { q: 'Как быстро привезут заказ?', a: 'По Новосибирску — в течение 1–2 часов. Доставка бесплатна от 2000 ₽.' },
  { q: 'Можно ли оплатить бонусами?', a: 'Да, бонусами можно покрыть до 50% суммы заказа.' },
  { q: 'Где попробовать пиво в розлив?', a: 'В четырёх фирменных барах Новосибирска и на экскурсиях завода.' },
  { q: 'Есть ли безалкогольное пиво?', a: 'Да, в ассортименте есть безалкогольная версия классического лагера.' },
];

const blogPreviews = [
  { id: 1, title: 'История сибирского пивоварения', desc: 'Как Новосибирск стал столицей крафта за Уралом.', emoji: '🏭', date: '12 ноября' },
  { id: 2, title: 'Как правильно дегустировать пиво', desc: 'Температура, бокалы, аромат и вкус — короткий гид.', emoji: '🍺', date: '10 ноября' },
  { id: 3, title: 'С чем сочетать разные сорта', desc: 'От вяленого леща к лагеру до шоколада к стауту.', emoji: '🍽️', date: '5 ноября' },
];

const pairings = [
  {
    id: 'light', label: 'Светлое и лёгкое', emoji: '🌾',
    keywords: ['лагер', 'пилс', 'вайс', 'светл', 'медовух'],
    food: 'Вяленый лещ, солёные огурцы, молодой сыр',
    note: 'Чистый и свежий вкус не перебивает закуску — он её подсвечивает.',
  },
  {
    id: 'hoppy', label: 'Горькое и хмельное', emoji: '🌿',
    keywords: ['ipa', 'айпа', 'апа', 'apa', 'хмел', 'горьк'],
    food: 'Гамбургер, острые крылышки, выдержанный чеддер',
    note: 'Хмелевая горчинка срезает жир и делает каждый кусок интереснее.',
  },
  {
    id: 'dark', label: 'Тёмное и плотное', emoji: '☕',
    keywords: ['портер', 'стаут', 'тёмн', 'темн', 'шоколад'],
    food: 'Шоколадный десерт, тушёное мясо, кофе',
    note: 'Карамель и кофе в эли подробно звучат с сладким и плотным.',
  },
  {
    id: 'fruit', label: 'Кислое и фруктовое', emoji: '🍋',
    keywords: ['сауэр', 'кисл', 'сидр', 'яблоч', 'фрукт'],
    food: 'Козлий сыр, устрицы, фруктовый салат',
    note: 'Кислинка освежает и хорошо работает с солёным и сливочным.',
  },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTaste, setActiveTaste] = useState(null);
  const [activePairing, setActivePairing] = useState(pairings[0].id);
  const [email, setEmail] = useState('');
  const { addToCart } = useCart();
  const { addNotification } = useNotification();

  useEffect(() => {
    let cancelled = false;
    axios.get('/api/products')
      .then(res => {
        if (!cancelled) setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const featured = products.slice(0, 4);

  const tasteProducts = useMemo(() => {
    const taste = tasteFilters.find(item => item.id === activeTaste);
    if (!taste) return products;
    return products.filter(product => {
      const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();
      return taste.keywords.some(keyword => text.includes(keyword));
    });
  }, [products, activeTaste]);

  const pairing = pairings.find(item => item.id === activePairing) || pairings[0];
  const pairingProduct = useMemo(() => products.find(product => {
    const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();
    return pairing.keywords.some(keyword => text.includes(keyword));
  }) || products[0], [products, pairing]);

  const subscribe = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      addNotification('Введите корректный email', 'error');
      return;
    }
    localStorage.setItem('urechki_newsletter', email);
    addNotification('Готово! Расскажем о новых сортах первыми', 'success');
    setEmail('');
  };

  return (
    <div className="fade-in">
      {/* ================= HERO ================= */}
      <section
        className="hero container"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(11,11,13,.94) 0%, rgba(11,11,13,.74) 55%, rgba(11,11,13,.88) 100%), url("${heroImage()}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: 'var(--radius)',
          paddingInline: 32,
        }}
      >
        <div className="hero-content">
          <span className="eyebrow">Сибирский крафт с 2015 года</span>
          <h1>Пиво, сваренное <span className="text-accent">у речушки</span></h1>
          <p className="muted">
            Собственная пивоварня в Новосибирске, честные ингредиенты и закуски,
            которые созданы друг для друга. Соберите свой набор или загляните в бар.
          </p>
          <div className="flex gap-2 wrap">
            <Link to="/catalog" className="btn btn-primary btn-lg">
              Смотреть каталог <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn btn-outline btn-lg">Наша история</Link>
          </div>
          <div className="hero-stats">
            <div><strong>2015</strong><span>год основания</span></div>
            <div><strong>4</strong><span>фирменных бара</span></div>
            <div><strong>1–2 ч</strong><span>доставка по городу</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <span className="hero-emoji" role="img" aria-label="Кружка пива">🍺</span>
          <div className="flex gap-2 wrap center" style={{ maxWidth: 420, marginTop: 24 }}>
            <span className="badge badge-accent"><Beer size={14} /> своё производство</span>
            <span className="badge badge-accent"><Award size={14} /> крафт Сибири</span>
            <span className="badge badge-accent"><Truck size={14} /> доставка 1–2 ч</span>
          </div>
        </div>
      </section>

      <div className="marquee-container" aria-hidden="true">
        <div className="marquee-content">
          <span>СВАРЕНО В НОВОСИБИРСКЕ • НАТУРАЛЬНЫЕ ИНГРЕДИЕНТЫ • У РЕЧУШКИ • ДОСТАВКА ПО ГОРОДУ • СВОЯ ПИВОВАРНЯ • </span>
          <span>СВАРЕНО В НОВОСИБИРСКЕ • НАТУРАЛЬНЫЕ ИНГРЕДИЕНТЫ • У РЕЧУШКИ • ДОСТАВКА ПО ГОРОДУ • СВОЯ ПИВОВАРНЯ • </span>
        </div>
      </div>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="section container">
        <div className="section-head flex between wrap gap-2">
          <div>
            <span className="eyebrow"><Sparkles size={14} /> Витрина</span>
            <h2>Популярное сейчас</h2>
            <p>Товары из нашего каталога — от классического лагера до крафтовых новинок.</p>
          </div>
          <Link to="/catalog" className="btn btn-outline">Весь каталог <ArrowRight size={17} /></Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : featured.length ? (
          <div className="grid grid-4">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} onQuickView={setQuickView} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Каталог пока пуст"
            description="Мы обновляем витрину. Загляните чуть позже или напишите нам."
            action={<Link to="/contacts" className="btn btn-outline">Связаться с нами</Link>}
          />
        )}
      </section>

      {/* ================= TASTE PICKER ================= */}
      <section className="section-sm container">
        <div className="section-head">
          <span className="eyebrow"><SlidersHorizontal size={14} /> Подбор по вкусу</span>
          <h2>Найдите своё пиво</h2>
          <p>
            Выберите вкус — покажем товары, в названии или описании которых есть подходящие
            слова. Это подсказка по ассортименту, а не дегустационная оценка.
          </p>
        </div>

        <div className="flex gap-2 wrap" style={{ marginBottom: 18 }}>
          <button
            className={`chip ${activeTaste === null ? 'chip-active' : ''}`}
            onClick={() => setActiveTaste(null)}
            aria-pressed={activeTaste === null}
          >
            Все товары
          </button>
          {tasteFilters.map(taste => (
            <button
              key={taste.id}
              className={`chip ${activeTaste === taste.id ? 'chip-active' : ''}`}
              onClick={() => setActiveTaste(taste.id)}
              aria-pressed={activeTaste === taste.id}
            >
              <span role="img" aria-hidden="true">{taste.emoji}</span> {taste.label}
            </button>
          ))}
        </div>

        <div className="flex between wrap gap-2" style={{ marginBottom: 18 }}>
          <span className="small muted">
            {loading ? 'Загружаем каталог…' : `Найдено ${tasteProducts.length} из ${products.length} товаров`}
          </span>
          {activeTaste && (
            <button className="text-button small text-accent" onClick={() => setActiveTaste(null)}>
              Сбросить вкус
            </button>
          )}
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : tasteProducts.length ? (
          <>
            <div className="flex gap-2 wrap" style={{ marginBottom: 18 }}>
              {tasteProducts.slice(0, 4).map(product => (
                <div
                  key={`preview-${product.id}`}
                  style={{ position: 'relative', flex: '1 1 150px', maxWidth: 220, minHeight: 104, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}
                >
                  <img
                    src={productImage(product)}
                    alt=""
                    aria-hidden="true"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,10,.12), rgba(8,8,10,.8))' }} />
                  <span className="tiny bold" style={{ position: 'absolute', left: 10, right: 10, bottom: 8, color: '#fff' }}>
                    {product.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-4">
              {tasteProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} onQuickView={setQuickView} />
              ))}
            </div>
            {tasteProducts.length > 4 && (
              <p className="tiny dim" style={{ marginTop: 12 }}>
                Показаны первые 4 совпадения — остальные смотрите в каталоге.
              </p>
            )}
          </>
        ) : (
          <EmptyState
            title="Совпадений пока нет"
            description="Попробуйте другой вкус или посмотрите весь каталог — ассортимент обновляется."
            action={<Link to="/catalog" className="btn btn-outline">Открыть каталог</Link>}
          />
        )}

        <div className="glass-panel flex between wrap gap-2" style={{ padding: '22px 24px', marginTop: 24 }}>
          <div>
            <strong className="small">Не нашли подходящий вкус?</strong>
            <p className="small muted" style={{ margin: '6px 0 0' }}>
              Подскажем по составу и поможем собрать набор — напишите нам или листайте каталог.
            </p>
          </div>
          <div className="flex gap-2 wrap">
            <Link to="/catalog" className="btn btn-primary btn-sm">Весь каталог <ArrowRight size={16} /></Link>
            <Link to="/contacts" className="btn btn-outline btn-sm">Спросить нас</Link>
          </div>
        </div>
      </section>

      {/* ================= FOOD PAIRINGS ================= */}
      <section className="section-sm container">
        <div className="section-head">
          <span className="eyebrow"><Sparkles size={14} /> Всё о пиве</span>
          <h2>Гастрономические сочетания</h2>
          <p>Выберите стиль — подскажем, с чем его пить, и сразу найдём подходящий сорт в каталоге.</p>
        </div>

        <div className="glass-panel pairing-shell">
          <div className="pairing-tabs" role="tablist" aria-label="Стили пива">
            {pairings.map(item => (
              <button
                key={item.id}
                type="button"
                role="tab"
                className="pairing-tab"
                aria-selected={activePairing === item.id}
                onClick={() => setActivePairing(item.id)}
              >
                <span role="img" aria-hidden="true">{item.emoji}</span> {item.label}
              </button>
            ))}
          </div>

          <div className="pairing-body">
            <div>
              <span className="eyebrow">{pairing.label}</span>
              <h3 style={{ fontSize: '1.5rem', margin: '10px 0' }}>{pairing.food}</h3>
              <p className="muted small" style={{ maxWidth: 520 }}>{pairing.note}</p>
              <Link to="/blog/3" className="text-button small text-accent">Подробнее о сочетаниях <ArrowRight size={14} /></Link>
            </div>

            {pairingProduct && (
              <div className="pairing-product">
                <img src={productImage(pairingProduct)} alt="" aria-hidden="true" />
                <div style={{ minWidth: 0 }}>
                  <strong className="small" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pairingProduct.name}
                  </strong>
                  <span className="tiny muted">{Number(pairingProduct.price).toLocaleString('ru-RU')} ₽</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={() => addToCart(pairingProduct)}
                  >
                    В корзину
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="section-sm container">
        <div className="section-head">
          <span className="eyebrow">Ассортимент</span>
          <h2>Выберите категорию</h2>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          {categories.map(cat => (
            <Link key={cat.name} to={cat.to} className="card card-hover text-center">
              <div className="product-media" style={{ background: categoryGradient(cat.name), minHeight: 116, borderRadius: 'var(--radius-sm)', fontSize: '3rem' }}>
                <span role="img" aria-label={cat.name}>{categoryEmoji(cat.name)}</span>
              </div>
              <h3 className="small bold" style={{ marginTop: 16 }}>{cat.name}</h3>
              <p className="tiny muted">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= VALUE PROPOSITIONS ================= */}
      <section className="section-sm container">
        <div className="grid grid-4">
          {advantages.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-hover text-center stack" style={{ alignItems: 'center' }}>
              <span className="icon-btn text-accent"><Icon size={22} /></span>
              <h3 className="small bold">{title}</h3>
              <p className="small muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PRODUCTION STORY ================= */}
      <section className="section container">
        <div className="grid grid-2" style={{ alignItems: 'center' }}>
          <div className="stack">
            <span className="eyebrow">Как мы варим</span>
            <h2>От сибирского ячменя до вашей кружки</h2>
            <p>
              Всё началось в 2015 году с арендованного подвала на 2-й Воинской. Сегодня у нас
              собственное производство на Станционной, 60, где каждую партию контролируют технологи.
            </p>
            <p className="small muted">
              Никаких порошковых концентратов: вода, солод, хмель и дрожжи. Остатки производства
              мы отдаём местным фермерам, а CO₂ используем повторно.
            </p>
            <Link to="/production" className="btn btn-outline">Подробнее о производстве <ArrowRight size={17} /></Link>
          </div>
          <div className="glass-panel stack" style={{ padding: 28 }}>
            {[
              { icon: CheckCircle, title: 'Сырьё', text: 'Сибирский ячмень и хмель из Чувашии и Германии' },
              { icon: ShieldCheck, title: 'Контроль', text: 'Лабораторные проверки каждой партии' },
              { icon: Truck, title: 'Розлив', text: 'Стекло и ПЭТ, наполнение под давлением' },
            ].map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="flex gap-2" style={{ alignItems: 'flex-start' }}>
                <span className="badge badge-accent">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className="flex gap-2"><Icon size={17} className="text-accent" /><strong className="small">{title}</strong></div>
                  <p className="small muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="section-sm container">
        <div className="section-head center">
          <span className="eyebrow">О нас цифрами</span>
          <h2>Небольшая пивоварня с характером</h2>
          <p className="small">Цифры по данным пивоварни на ноябрь 2026 года.</p>
        </div>
        <div className="grid grid-4">
          {stats.map(stat => (
            <div key={stat.label} className="card card-hover text-center">
              <strong className="text-accent" style={{ fontSize: '2rem', display: 'block', lineHeight: 1.2 }}>{stat.value}</strong>
              <span className="small muted">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= REVIEWS HIGHLIGHTS ================= */}
      <section className="section container">
        <div className="section-head flex between wrap gap-2">
          <div>
            <span className="eyebrow">Голоса гостей</span>
            <h2>Что говорят о нас</h2>
            <p className="small">Примеры отзывов гостей — демонстрационные тексты для витрины.</p>
          </div>
          <Link to="/reviews" className="btn btn-outline">Все отзывы <ArrowRight size={17} /></Link>
        </div>
        <div className="grid grid-3">
          {reviewHighlights.map(rev => (
            <figure key={rev.name} className="card card-hover" style={{ borderLeft: '3px solid var(--accent)', margin: 0 }}>
              <div className="flex gap-2" style={{ marginBottom: 14 }}>
                <span className="badge badge-accent" style={{ width: 42, height: 42, justifyContent: 'center', fontSize: '1rem' }}>{rev.initials}</span>
                <div>
                  <figcaption className="bold small">{rev.name}</figcaption>
                  <span className="tiny dim">{rev.date}</span>
                </div>
              </div>
              <div className="flex gap-1" style={{ color: 'var(--accent)', marginBottom: 10 }}>
                {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <blockquote className="small muted" style={{ fontStyle: 'italic', flex: 1 }}>«{rev.text}»</blockquote>
            </figure>
          ))}
        </div>
      </section>

      {/* ================= FAQ TEASER ================= */}
      <section className="section-sm container-narrow">
        <div className="section-head center">
          <span className="eyebrow">FAQ</span>
          <h2>Частые вопросы</h2>
        </div>
        <div className="stack" style={{ gap: 10 }}>
          {faqTeaser.map((item, i) => (
            <div key={item.q} className="glass-panel" style={{ overflow: 'hidden' }}>
              <button
                className="flex between"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', color: 'var(--text)', textAlign: 'left', gap: 16 }}
                aria-expanded={activeFaq === i}
              >
                <span className="bold small">{item.q}</span>
                <ChevronRight size={18} className="text-accent" style={{ transform: activeFaq === i ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              <AnimatePresence initial={false}>
                {activeFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <p className="small muted" style={{ padding: '0 20px 18px', margin: 0 }}>{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <div className="text-center" style={{ marginTop: 24 }}>
          <Link to="/faq" className="btn btn-outline">Все вопросы и ответы <ArrowRight size={17} /></Link>
        </div>
      </section>

      {/* ================= BLOG TEASER ================= */}
      <section className="section container">
        <div className="section-head flex between wrap gap-2">
          <div>
            <span className="eyebrow"><MessageSquare size={14} /> Блог</span>
            <h2>Читайте о пивной культуре</h2>
          </div>
          <Link to="/blog" className="btn btn-outline">Все статьи <ArrowRight size={17} /></Link>
        </div>
        <div className="grid grid-3">
          {blogPreviews.map(post => (
            <Link key={post.id} to={`/blog/${post.id}`} className="card card-hover stack">
              <div className="product-media" style={{ background: categoryGradient('Пиво'), minHeight: 120, borderRadius: 'var(--radius-sm)', fontSize: '2.8rem' }}>
                <span role="img" aria-label={post.title}>{post.emoji}</span>
              </div>
              <div>
                <h3 className="small bold">{post.title}</h3>
                <p className="small muted">{post.desc}</p>
                <span className="tiny dim"><CalendarDays size={12} /> {post.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="section-sm container">
        <div className="glass-panel stack" style={{ padding: '40px 28px', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(var(--accent-rgb),.12), transparent)', borderColor: 'var(--border-accent)' }}>
          <span className="badge badge-accent"><Mail size={15} /> Рассылка</span>
          <h2>Будьте в курсе новых сортов</h2>
          <p className="muted" style={{ maxWidth: 520 }}>Рассказываем о новинках, дегустациях и акциях. Без лишнего шума — только пивное.</p>
          <form onSubmit={subscribe} className="flex gap-2 wrap center" style={{ width: '100%', maxWidth: 520 }}>
            <input
              className="input"
              style={{ flex: '1 1 240px' }}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Ваш email"
              aria-label="Email для подписки"
            />
            <button type="submit" className="btn btn-primary"><Send size={17} /> Подписаться</button>
          </form>
        </div>
      </section>

      {/* ================= APP TEASER ================= */}
      <section className="section-sm container">
        <div className="glass-panel grid grid-2" style={{ padding: 32, alignItems: 'center', gap: 28 }}>
          <div className="stack">
            <span className="eyebrow"><Smartphone size={14} /> Скоро</span>
            <h2>Магазин в вашем кармане</h2>
            <p className="small muted">Заказ в пару касаний, история покупок и персональные предложения. Мы готовим приложение — следите за обновлениями.</p>
            <Link to="/app" className="btn btn-outline">Узнать подробнее <ArrowRight size={17} /></Link>
          </div>
          <div className="flex center">
            <div
              aria-hidden="true"
              style={{ width: 170, padding: 10, borderRadius: 28, border: '2px solid var(--border-accent)', background: '#0c0c0f', boxShadow: 'var(--shadow)' }}
            >
              <div className="stack" style={{ height: 300, padding: 14, borderRadius: 20, background: 'linear-gradient(160deg, rgba(var(--accent-rgb),.10), transparent 60%)' }}>
                <span className="badge badge-accent" style={{ alignSelf: 'flex-start' }}>URECHKI</span>
                <div className="skeleton" style={{ height: 92, borderRadius: 12 }} />
                <div className="skeleton" style={{ height: 14, width: '70%' }} />
                <div className="skeleton" style={{ height: 14, width: '45%' }} />
                <div className="skeleton" style={{ height: 36, borderRadius: 10, marginTop: 'auto' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTACTS ================= */}
      <section className="section-sm container">
        <div className="section-head center">
          <span className="eyebrow">На связи</span>
          <h2>Найти нас просто</h2>
        </div>
        <div className="grid grid-3">
          <div className="card text-center stack" style={{ alignItems: 'center' }}>
            <MapPin size={26} className="text-accent" />
            <strong className="small">Адрес</strong>
            <span className="small muted">Новосибирск, ул. 2-я Воинская, 53</span>
          </div>
          <div className="card text-center stack" style={{ alignItems: 'center' }}>
            <Phone size={26} className="text-accent" />
            <strong className="small">Телефон</strong>
            <a className="small muted" href="tel:+79516240161">+7 (951) 624-01-61</a>
          </div>
          <div className="card text-center stack" style={{ alignItems: 'center' }}>
            <Clock size={26} className="text-accent" />
            <strong className="small">Режим работы</strong>
            <span className="small muted">Ежедневно, 11:00–23:00</span>
          </div>
        </div>
        <div className="text-center" style={{ marginTop: 24 }}>
          <Link to="/contacts" className="btn btn-outline">Все контакты и филиалы <ArrowRight size={17} /></Link>
        </div>
      </section>

      <QuickView product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}
