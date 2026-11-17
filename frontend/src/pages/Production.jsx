import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, PackageOpen } from 'lucide-react';
import InfoModal from '../components/InfoModal';
import { categoryEmoji } from '../utils/product';

const prodButtonsData = [
  { id: 1, title: 'Наш завод', info: 'Фабрика расположена по адресу ул. Станционная, 60. Площадь 2500 кв.м. Оборудование из Германии и Чехии.' },
  { id: 2, title: 'Стандарты качества', info: 'Проходим сертификацию ISO 22000. Каждая партия проверяется в лаборатории на микробиологию.' },
  { id: 3, title: 'Безотходное производство', info: 'Пивная дробина отправляется на корм скоту местным фермерам, а CO₂ улавливается и используется повторно.' },
  { id: 4, title: 'Сырьё', info: 'Используем сибирский ячмень и хмель из Чувашии и Германии. Никаких порошковых концентратов.' },
  { id: 5, title: 'Лаборатория', info: 'В штате два технолога-пивовара, которые ежедневно контролируют плотность сусла и вкус.' },
  { id: 6, title: 'Контроль дрожжей', info: 'Ведём собственный банк чистых культур дрожжей. Каждый штамм хранится при температуре −80 °C.' },
  { id: 7, title: 'Розлив', info: 'Линия розлива в стекло и ПЭТ. Автоматическая мойка и наполнение под давлением, чтобы избежать окисления.' },
  { id: 8, title: 'Температурный режим', info: 'Брожение проходит при строго заданной температуре (от 8 до 20 °C в зависимости от сорта) в цилиндро-конических танках.' },
  { id: 9, title: 'Водоподготовка', info: 'Используем артезианскую воду из скважины глубиной 120 метров. Многоступенчатая фильтрация и УФ-обеззараживание.' },
  { id: 10, title: 'Автоматизация', info: 'Процессом варки управляет компьютер Siemens. Человеческий фактор сведён к минимуму.' },
];

const getComposition = (category) => {
  if (category === 'Пиво') return { ing: 'Вода, солод, хмель, дрожжи.', cond: 'Брожение в стальных танках при 18 °C.' };
  if (category === 'Закуски') return { ing: 'Натуральные специи, соль, мука, мясо/рыба.', cond: 'Обжарка при 180 °C, сушка 4 часа, вакуумная упаковка.' };
  if (category === 'Мерч') return { ing: '100% хлопок / металл / керамика.', cond: 'Дочернее производство в Шанхае. Ручная шелкография.' };
  return { ing: 'Смешанный состав.', cond: 'Соблюдение стандартов качества.' };
};

export default function Production() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);

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

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="fade-in">
      <section className="section container-narrow text-center">
        <span className="eyebrow">Производство</span>
        <h1>Как создаются наши продукты</h1>
        <p className="muted" style={{ maxWidth: 640, margin: '16px auto 0' }}>
          От артезианской воды до розлива в стекло — рассказываем, из чего и как мы варим пиво,
          делаем закуски и мерч.
        </p>
      </section>

      <section className="section-sm container">
        <div className="section-head">
          <span className="eyebrow">На заводе</span>
          <h2>Десять деталей, которые важны</h2>
          <p className="small">Нажмите на карточку, чтобы узнать подробности.</p>
        </div>
        <div className="grid grid-4">
          {prodButtonsData.map(item => (
            <button
              key={item.id}
              type="button"
              className="card card-hover text-center"
              onClick={() => setModalInfo(item)}
            >
              <span className="badge badge-accent" style={{ width: 40, height: 40, justifyContent: 'center', marginBottom: 12 }}>{String(item.id).padStart(2, '0')}</span>
              <h3 className="small bold">{item.title}</h3>
            </button>
          ))}
        </div>
      </section>

      <section className="section container-narrow">
        <div className="section-head">
          <span className="eyebrow">Состав и условия</span>
          <h2>Что внутри наших продуктов</h2>
        </div>

        {loading ? (
          <div className="stack" style={{ gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius)' }} />)}
          </div>
        ) : !categories.length ? (
          <div className="empty-state">
            <PackageOpen size={46} />
            <h3 style={{ margin: '12px 0 8px' }}>Данных пока нет</h3>
            <p>Загляните позже — мы обновляем информацию о составе.</p>
          </div>
        ) : (
          <div className="stack" style={{ gap: 36 }}>
            {categories.map(category => (
              <div key={category}>
                <div className="flex gap-2" style={{ marginBottom: 14 }}>
                  <span className="badge badge-accent" style={{ fontSize: '1.2rem' }} role="img" aria-label={category}>{categoryEmoji(category)}</span>
                  <h2 style={{ fontSize: '1.6rem' }}>{category}</h2>
                </div>
                <div className="stack" style={{ gap: 10 }}>
                  {products.filter(p => p.category === category).map(item => {
                    const isOpen = openId === item.id;
                    const composition = getComposition(item.category);
                    return (
                      <div key={item.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                        <button
                          className="flex between"
                          onClick={() => setOpenId(isOpen ? null : item.id)}
                          style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', color: 'var(--text)', gap: 16, textAlign: 'left' }}
                          aria-expanded={isOpen}
                        >
                          <strong className="small">{item.name}</strong>
                          {isOpen ? <ChevronUp size={18} className="text-accent" /> : <ChevronDown size={18} className="text-accent" />}
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                              <div className="grid grid-2" style={{ padding: '0 20px 20px', gap: 16 }}>
                                <div>
                                  <span className="eyebrow" style={{ marginBottom: 6 }}>Состав</span>
                                  <p className="small muted" style={{ margin: 0 }}>{composition.ing}</p>
                                </div>
                                <div>
                                  <span className="eyebrow" style={{ marginBottom: 6 }}>Условия производства</span>
                                  <p className="small muted" style={{ margin: 0 }}>{composition.cond}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <InfoModal
        isOpen={!!modalInfo}
        onClose={() => setModalInfo(null)}
        title={modalInfo?.title}
        text={modalInfo?.info}
      />
    </div>
  );
}
