import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';

const names = ["Алексей", "Мария", "Дмитрий", "Ольга", "Сергей", "Анна", "Иван", "Елена", "Максим", "Татьяна"];
const texts = [
  "Отличное место! Пиво всегда свежее, закуски вкусные.", 
  "Беру мерч уже второй раз, качество на высоте. Шанхайская компания не подвела!",
  "Лучший стаут в городе, однозначно рекомендую.",
  "Приятная атмосфера, вежливый персонал. Жигулевское как в детстве!",
  "Сухарики просто огонь, беру с собой всегда.",
  "Крафт реально достойный. Рад, что в Новосибирске есть такое производство."
];

const reviews = Array.from({ length: 100 }).map((_, i) => ({
  id: i,
  name: names[i % names.length] + " " + (i + 1),
  text: texts[i % texts.length],
  rating: Math.floor(Math.random() * 2) + 4, // 4 или 5 звезд
  date: `1${i % 9} октября 2024`,
  likes: Math.floor(Math.random() * 50)
}));

export default function Reviews() {
  const [filter, setFilter] = useState('Все');

  const filteredReviews = filter === 'Все' ? reviews : reviews.filter(r => 
    filter === '5' ? r.rating === 5 : r.rating === 4
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '80px 10%' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '4rem', color: '#d4af37', marginBottom: '20px' }}>Отзывы</h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', fontSize: '2rem', marginBottom: '10px' }}>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>4.8</span>
          <div style={{ display: 'flex', color: '#d4af37' }}>
            <Star fill="#d4af37" /><Star fill="#d4af37" /><Star fill="#d4af37" /><Star fill="#d4af37" /><Star fill="#d4af37" />
          </div>
        </div>
        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>На основе 124 отзывов наших клиентов</p>
      </div>

      {/* Фильтры */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
        {['Все', '5', '4'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 20px', borderRadius: '20px', background: filter === f ? '#d4af37' : 'transparent', color: filter === f ? '#000' : '#d4af37', border: '1px solid #d4af37', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
            {f === 'Все' ? 'Все отзывы' : `${f} Звезды`}
          </button>
        ))}
      </div>

      {/* Сетка отзывов */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
        {filteredReviews.map((rev, i) => (
          <motion.div key={rev.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 10) * 0.05 }} className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              {/* Аватарка-заглушка */}
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #d4af37, #8b0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {rev.name[0]}
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>{rev.name}</h3>
                <span style={{ color: '#666', fontSize: '0.8rem' }}>{rev.date}</span>
              </div>
            </div>

            <div style={{ display: 'flex', color: '#d4af37', marginBottom: '15px' }}>
              {[...Array(5)].map((_, starIndex) => (
                <Star key={starIndex} size={16} fill={starIndex < rev.rating ? '#d4af37' : 'transparent'} />
              ))}
            </div>

            <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: '1rem', flex: 1, lineHeight: '1.6' }}>"{rev.text}"</p>
            
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#888', fontSize: '0.9rem', cursor: 'pointer' }}><ThumbsUp size={16} /> Полезно ({rev.likes})</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#888', fontSize: '0.9rem', cursor: 'pointer' }}><MessageSquare size={16} /> Ответить</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}