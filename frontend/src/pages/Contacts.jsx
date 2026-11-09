import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Clock, X, Mail, Send, MessageCircle, Globe, Camera, PlayCircle, Navigation, CalendarDays, Briefcase, HelpCircle } from 'lucide-react';
import InfoModal from '../components/InfoModal';

const branches = [
  { id: 1, title: "Главный филиал", address: "ул. 2-я Воинская, 53", opened: "Открыт в 2015 году", icon: "🏠", phone: "+7 (951) 624-01-61", hours: "11:00 - 23:00", map: "https://yandex.ru/maps/?text=Новосибирск, 2-я Воинская 53" },
  { id: 2, title: "Филиал на Ленина", address: "ул. Ленина, 10", opened: "Открыт в 2019 году", icon: "🏢", phone: "+7 (951) 624-01-62", hours: "12:00 - 00:00", map: "https://yandex.ru/maps/?text=Новосибирск, Ленина 10" },
  { id: 3, title: "Филиал на Красном", address: "Красный проспект, 50", opened: "Открыт в 2021 году", icon: "🏢", phone: "+7 (951) 624-01-63", hours: "12:00 - 02:00", map: "https://yandex.ru/maps/?text=Новосибирск, Красный проспект 50" },
  { id: 4, title: "Филиал на Кирова", address: "ул. Кирова, 27", opened: "Открыт в 2023 году", icon: "🏢", phone: "+7 (951) 624-01-64", hours: "11:00 - 23:00", map: "https://yandex.ru/maps/?text=Новосибирск, Кирова 27" },
  { id: 5, title: "Пивоварня (Фабрика)", address: "ул. Станционная, 60", opened: "Запущена в 2018 году", icon: "🏭", phone: "+7 (951) 624-01-65", hours: "Пн-Пт 09:00 - 18:00", map: "https://yandex.ru/maps/?text=Новосибирск, Станционная 60" }
];

const contactButtons = [
  { id: 1, icon: <Mail size={24}/>, text: "Написать на почту", info: "info@urechki.ru - отвечаем в течение рабочего дня." },
  { id: 2, icon: <Send size={24}/>, text: "Telegram", info: "Наш канал в Telegram: @urechki_nsk. Там все новости и розыгрыши." },
  { id: 3, icon: <MessageCircle size={24}/>, text: "WhatsApp", info: "Пишите на номер +7(951)624-01-61, если нужно срочно сделать заказ." },
  { id: 4, icon: <Camera size={24}/>, text: "Instagram", info: "Подписывайтесь на наш Instagram, чтобы смотреть фото новых сортов пива." },
  { id: 5, icon: <Globe size={24}/>, text: "ВКонтакте", info: "Наша официальная группа ВК. Мероприятия, конкурсы и мемы." },
  { id: 6, icon: <PlayCircle size={24}/>, text: "YouTube", info: "Смотрим наши видеоролики о том, как варится пиво 'У Речушки'." },
  { id: 7, icon: <Navigation size={24}/>, text: "Яндекс.Карты", info: "Постройте маршрут до ближайшего филиала в один клик." },
  { id: 8, icon: <CalendarDays size={24}/>, text: "Запись на экскурсию", info: "Экскурсии на заводе проходят по субботам в 14:00. Запись по телефону." },
  { id: 9, icon: <Briefcase size={24}/>, text: "Юридический адрес", info: "ООО 'Речушка', ИНН 5400000000, КПП 540001001. Юридический адрес: г. Новосибирск, ул. Станционная, 60." },
  { id: 10, icon: <HelpCircle size={24}/>, text: "Отдел кадров", info: "По вопросам трудоустройства пишите на hr@urechki.ru" },
];

export default function Contacts() {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '80px 10%', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '4rem', color: '#d4af37', textAlign: 'center', marginBottom: '40px' }}>Контакты</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '60px', flexWrap: 'wrap' }}>
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1.5rem' }}>
          <Phone color="#d4af37" size={30} /> <span>+7 (951) 624-01-61</span>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '60px' }}>
        {contactButtons.map((btn) => (
          <motion.div key={btn.id} onClick={() => setModalInfo(btn)} whileHover={{ y: -5, background: 'rgba(212,175,55,0.15)' }} className="glass-panel" style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', color: '#d4af37' }}>
            {btn.icon}
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>{btn.text}</span>
          </motion.div>
        ))}
      </div>

      <InfoModal isOpen={!!modalInfo} onClose={() => setModalInfo(null)} title={modalInfo?.text} text={modalInfo?.info} />

      <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '30px', textAlign: 'center' }}>Наши Филиалы</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {branches.map((branch, i) => (
          <motion.div key={i} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-panel" style={{ padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '15px' }}>{branch.icon}</div>
            <h3 style={{ color: '#d4af37', marginBottom: '10px', fontSize: '1.3rem' }}>{branch.title}</h3>
            <p style={{ color: '#ccc', fontSize: '1.1rem', marginBottom: '10px' }}><MapPin size={16} style={{ display: 'inline', marginRight: '5px' }}/> {branch.address}</p>
            <p style={{ color: '#888', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '20px' }}>{branch.opened}</p>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setSelectedBranch(branch)} style={{ background: '#d4af37', color: '#000', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Подробнее</motion.button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedBranch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }} onClick={() => setSelectedBranch(null)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={e => e.stopPropagation()} className="glass-panel" style={{ padding: '40px', width: '90%', maxWidth: '400px', position: 'relative' }}>
              <X onClick={() => setSelectedBranch(null)} style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', color: '#d4af37' }} />
              <h2 style={{ color: '#d4af37', marginBottom: '20px', fontSize: '2rem' }}>{selectedBranch.title}</h2>
              <p style={{ color: '#ccc', marginBottom: '10px' }}><strong>Адрес:</strong> {selectedBranch.address}</p>
              <p style={{ color: '#ccc', marginBottom: '10px' }}><strong>Телефон:</strong> {selectedBranch.phone}</p>
              <p style={{ color: '#ccc', marginBottom: '10px' }}><strong>Часы работы:</strong> {selectedBranch.hours}</p>
              <p style={{ color: '#ccc', marginBottom: '30px' }}><strong>Статус:</strong> {selectedBranch.opened}</p>
              <a href={selectedBranch.map} target="_blank" rel="noreferrer">
                <motion.button whileHover={{ scale: 1.05 }} style={{ width: '100%', background: '#d4af37', color: '#000', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>Открыть на карте</motion.button>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}