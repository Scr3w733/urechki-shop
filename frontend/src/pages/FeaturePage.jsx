import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Beer } from 'lucide-react';
import { featuresData } from '../data/features';

export default function FeaturePage() {
  const { id } = useParams();
  const feature = featuresData.find(f => f.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!feature) return <div style={{ padding: '100px', textAlign: 'center' }}>Страница не найдена</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '80px 10%', minHeight: '80vh', maxWidth: '1200px', margin: '0 auto' }}>
      
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#d4af37', marginBottom: '40px', fontWeight: 'bold' }}>
        <ArrowLeft size={20} /> Назад на главную
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <Beer size={40} color="#000" />
        </div>
        <h1 style={{ fontSize: '4rem', color: '#d4af37' }}>{feature.title}</h1>
      </div>

      <div className="glass-panel" style={{ padding: '50px', fontSize: '1.2rem', lineHeight: '2', color: '#ccc' }}>
        <p style={{ marginBottom: '20px' }}>{feature.desc}</p>
        
        <p style={{ marginBottom: '20px' }}>Мы очень трепетно относимся к качеству наших услуг. Каждый клиент для нас — это часть большой семьи «У Речушки». Если у вас возникнут любые вопросы, связанные с этим разделом, вы всегда можете обратиться в нашу службу поддержки по телефону <span style={{color: '#d4af37', fontWeight: 'bold'}}>+7 (951) 624-01-61</span>.</p>

        <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(212,175,55,0.1)', borderLeft: '4px solid #d4af37', borderRadius: '5px' }}>
          <h3 style={{ color: '#fff', marginBottom: '10px' }}>Особенности раздела «{feature.title}»:</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Индивидуальный подход к каждому гостю.</li>
            <li>Только проверенная информация и актуальные данные.</li>
            <li>Постоянные обновления и улучшения сервиса.</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}