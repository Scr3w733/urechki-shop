import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';

const articlesData = {
  '1': { title: "История сибирского пивоварения", img: "🏭", date: "12 Ноября 2026", read: "5 мин", content: `История пивоварения в Сибири уходит корнями в глубокое прошлое. Еще в XIX веке в Ново-Николаевске начали открываться первые частные пивоварни. Местные купцы быстро поняли, что сибирская вода и отборный ячмень дают невероятный вкус. Мы решили возродить традиции честного, ручного пивоварения.` },
  '2': { title: "Как правильно дегустировать пиво", img: "🍺", date: "10 Ноября 2026", read: "7 мин", content: `Многие пьют пиво, даже не задумываясь о его букете. 1. Температура. Лагеры пьют охлажденными (4-8°C), а стауты раскрываются при 10-14°C. 2. Бокал. Форма влияет на аромат. 3. Аромат. Понюхай перед глотком. 4. Вкус. Оцени горечь и послевкусие.` },
  '3': { title: "С чем сочетать разные сорта пива", img: "🍽️", date: "05 Ноября 2026", read: "10 мин", content: `Гастрономические сочетания — это наука. Лагер идеально идет с вяленой рыбой. Темный стаут отлично сочетается с десертами и мясом. Пшеничное пиво подчеркнет вкус салатов. Приходите в наши бары за специальными сетами!` },
  '4': { title: "Наш путь к идеальному IPA", img: "🌿", date: "01 Ноября 2026", read: "4 мин", content: `IPA — один из самых популярных стилей. Мы экспериментировали с 5 сортами хмеля. В итоге остановились на комбинации, которая дает яркий цитрусовый аромат и мягкую горечь. Попробуйте "Сибирский IPA" в нашем баре!` }
};

export default function BlogPost() {
  const { id } = useParams();
  const article = articlesData[id];

  if (!article) return <div style={{ padding: '100px', textAlign: 'center', color: '#fff' }}>Статья не найдена</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '80px 10%', maxWidth: '900px', margin: '0 auto', minHeight: '80vh' }}>
      <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--accent)', marginBottom: '40px', fontWeight: 'bold' }}>
        <ArrowLeft size={20} /> Назад ко всем статьям
      </Link>
      <div style={{ fontSize: '8rem', textAlign: 'center', marginBottom: '20px' }}>{article.img}</div>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#fff', marginBottom: '20px', lineHeight: '1.2' }}>{article.title}</h1>
      <div style={{ display: 'flex', gap: '20px', color: '#888', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={16}/> {article.date}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={16}/> {article.read}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginLeft: 'auto', color: 'var(--accent)' }}><Share2 size={16}/> Поделиться</span>
      </div>
      <div style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{article.content}</div>
    </motion.div>
  );
}