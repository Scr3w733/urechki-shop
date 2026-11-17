import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle, Phone } from 'lucide-react';

const faqData = [
  { q: 'Как происходит доставка?', a: 'Мы доставляем заказы по Новосибирску курьерами в течение 1–2 часов. Доставка бесплатна при заказе от 2000 рублей, в остальных случаях — 300 рублей.' },
  { q: 'Можно ли оплатить заказ бонусами?', a: 'Да, бонусами можно оплатить до 50% суммы заказа. Бонусы начисляются в размере 10% от каждой покупки.' },
  { q: 'Как долго хранится пиво?', a: 'Нефильтрованное пиво рекомендуем употребить в течение 5–7 дней. Фильтрованное хранится до 6 месяцев при температуре от +2 до +8 °C.' },
  { q: 'Есть ли у вас безалкогольное пиво?', a: 'Да, в ассортименте есть безалкогольное пиво «У Речушки» — вкус классического лагера без алкоголя.' },
  { q: 'Как работает программа лояльности?', a: 'При регистрации вы становитесь участником клуба: копите бонусы с покупок и получаете персональные промокоды на день рождения.' },
  { q: 'Где можно попробовать пиво в розлив?', a: 'В четырёх фирменных барах Новосибирска: на 2-й Воинской, Ленина, Красном проспекте и Кирова. Также проводим экскурсии на заводе.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

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
        <div className="stack" style={{ gap: 12 }}>
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.q} className="glass-panel" style={{ overflow: 'hidden' }}>
                <button
                  className="flex between"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  style={{ width: '100%', padding: '20px 22px', background: 'none', border: 'none', color: 'var(--text)', gap: 16, textAlign: 'left' }}
                  aria-expanded={isOpen}
                >
                  <span className="bold">{item.q}</span>
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
