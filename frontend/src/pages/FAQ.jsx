import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  { q: "Как происходит доставка?", a: "Мы доставляем заказы по Новосибирску курьерами в течение 1-2 часов. Доставка бесплатна при заказе от 2000 рублей. В остальных случаях — 300 рублей." },
  { q: "Можно ли оплатить заказ бонусами?", a: "Да, вы можете оплатить бонусами до 50% от суммы заказа. Бонусы начисляются в размере 10% от каждой покупки." },
  { q: "Как долго хранится пиво?", a: "Наше нефильтрованное пиво рекомендуется употребить в течение 5-7 дней. Фильтрованное хранится до 6 месяцев при температуре от +2 до +8 °C." },
  { q: "Есть ли у вас безалкогольное пиво?", a: "Да, в нашем ассортименте есть безалкогольное пиво 'У Речушки'. Оно сохраняет вкус классического лагера, но не содержит алкоголя." },
  { q: "Как работает программа лояльности?", a: "При регистрации вы становитесь участником клуба. С каждой покупки копите бонусы, а также получаете персональные промокоды на День Рождения." },
  { q: "Где можно попробовать ваше пиво в розлив?", a: "У нас 4 фирменных бара в Новосибирске: на 2-й Воинской, Ленина, Красном проспекте и Кирова. Также мы проводим экскурсии на заводе." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '80px 10%', minHeight: '80vh', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#d4af37', textAlign: 'center', marginBottom: '20px' }}>Вопросы и Ответы</h1>
      <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '50px', fontSize: '1.1rem' }}>Всё, что вы хотели знать о нашей пивоварне</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {faqData.map((item, index) => (
          <div key={index} className="glass-panel" style={{ overflow: 'hidden' }}>
            <button 
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              style={{ width: '100%', padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left' }}
            >
              {item.q}
              {openIndex === index ? <ChevronUp color="#d4af37" /> : <ChevronDown color="#d4af37" />}
            </button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '0 25px 25px', color: '#aaa', lineHeight: '1.8', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}