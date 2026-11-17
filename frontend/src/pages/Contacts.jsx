import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  CalendarDays,
  Camera,
  Clock,
  Globe,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  PlayCircle,
  Send,
} from 'lucide-react';
import Modal from '../components/Modal';
import InfoModal from '../components/InfoModal';
import { useNotification } from '../context/NotificationContext';

const branches = [
  { id: 1, title: 'Главный филиал', address: 'ул. 2-я Воинская, 53', opened: 'Открыт в 2015 году', icon: '🏠', phone: '+7 (951) 624-01-61', hours: '11:00 - 23:00', map: 'https://yandex.ru/maps/?text=Новосибирск, 2-я Воинская 53' },
  { id: 2, title: 'Филиал на Ленина', address: 'ул. Ленина, 10', opened: 'Открыт в 2019 году', icon: '🏢', phone: '+7 (951) 624-01-62', hours: '12:00 - 00:00', map: 'https://yandex.ru/maps/?text=Новосибирск, Ленина 10' },
  { id: 3, title: 'Филиал на Красном', address: 'Красный проспект, 50', opened: 'Открыт в 2021 году', icon: '🏢', phone: '+7 (951) 624-01-63', hours: '12:00 - 02:00', map: 'https://yandex.ru/maps/?text=Новосибирск, Красный проспект 50' },
  { id: 4, title: 'Филиал на Кирова', address: 'ул. Кирова, 27', opened: 'Открыт в 2023 году', icon: '🏢', phone: '+7 (951) 624-01-64', hours: '11:00 - 23:00', map: 'https://yandex.ru/maps/?text=Новосибирск, Кирова 27' },
  { id: 5, title: 'Пивоварня (фабрика)', address: 'ул. Станционная, 60', opened: 'Запущена в 2018 году', icon: '🏭', phone: '+7 (951) 624-01-65', hours: 'Пн-Пт 09:00 - 18:00', map: 'https://yandex.ru/maps/?text=Новосибирск, Станционная 60' },
];

const contactButtons = [
  { id: 1, icon: <Mail size={22} />, text: 'Написать на почту', info: 'info@urechki.ru — отвечаем в течение рабочего дня.' },
  { id: 2, icon: <Send size={22} />, text: 'Telegram', info: 'Наш канал: @urechki_nsk. Новости и розыгрыши.' },
  { id: 3, icon: <MessageCircle size={22} />, text: 'WhatsApp', info: 'Пишите на +7 (951) 624-01-61, если нужно срочно оформить заказ.' },
  { id: 4, icon: <Camera size={22} />, text: 'Instagram', info: 'Фотографии новых сортов и жизни пивоварни.' },
  { id: 5, icon: <Globe size={22} />, text: 'ВКонтакте', info: 'Официальная группа: мероприятия, конкурсы и новости.' },
  { id: 6, icon: <PlayCircle size={22} />, text: 'YouTube', info: 'Видео о том, как варится пиво «У Речушки».' },
  { id: 7, icon: <Navigation size={22} />, text: 'Яндекс.Карты', info: 'Постройте маршрут до ближайшего филиала в один клик.' },
  { id: 8, icon: <CalendarDays size={22} />, text: 'Запись на экскурсию', info: 'Экскурсии на заводе проходят по субботам в 14:00. Запись по телефону.' },
  { id: 9, icon: <Briefcase size={22} />, text: 'Юридический адрес', info: 'ООО «Речушка», ИНН 5400000000, КПП 540001001. г. Новосибирск, ул. Станционная, 60.' },
  { id: 10, icon: <HelpCircle size={22} />, text: 'Отдел кадров', info: 'По вопросам трудоустройства пишите на hr@urechki.ru.' },
];

const emptyForm = { name: '', email: '', message: '' };

export default function Contacts() {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [modalInfo, setModalInfo] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { addNotification } = useNotification();

  const sendMessage = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      addNotification('Заполните имя и сообщение', 'error');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      addNotification('Введите корректный email', 'error');
      return;
    }
    addNotification('Сообщение отправлено — мы скоро ответим', 'success');
    setForm(emptyForm);
  };

  const updateField = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="fade-in">
      <section className="section container-narrow text-center">
        <span className="eyebrow">Контакты</span>
        <h1>Мы на связи</h1>
        <p className="muted" style={{ maxWidth: 620, margin: '16px auto 0' }}>
          Вопрос по заказу, экскурсия на завод или просто хочется поздороваться — выбирайте удобный способ связи.
        </p>
        <div className="flex gap-2 wrap center" style={{ marginTop: 24 }}>
          <a className="btn btn-primary" href="tel:+79516240161"><Phone size={17} /> +7 (951) 624-01-61</a>
          <a className="btn btn-outline" href="mailto:info@urechki.ru"><Mail size={17} /> info@urechki.ru</a>
        </div>
      </section>

      <section className="section-sm container">
        <div className="section-head">
          <span className="eyebrow">Способы связи</span>
          <h2>Напишите или позвоните</h2>
        </div>
        <div className="grid grid-4">
          {contactButtons.map(btn => (
            <button key={btn.id} type="button" className="card card-hover flex gap-2" onClick={() => setModalInfo(btn)}>
              <span className="text-accent">{btn.icon}</span>
              <span className="small bold">{btn.text}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section-sm container">
        <div className="section-head center">
          <span className="eyebrow">Филиалы</span>
          <h2>Пять адресов в Новосибирске</h2>
          <p className="small">Четыре бара и собственная пивоварня.</p>
        </div>
        <div className="grid grid-3">
          {branches.map(branch => (
            <article key={branch.id} className="card card-hover stack">
              <span className="badge badge-accent" style={{ fontSize: '1.8rem', alignSelf: 'flex-start' }} role="img" aria-label={branch.title}>{branch.icon}</span>
              <h3 className="small bold">{branch.title}</h3>
              <p className="small muted flex gap-2" style={{ alignItems: 'flex-start', margin: 0 }}><MapPin size={15} className="text-accent" /> {branch.address}</p>
              <p className="small muted flex gap-2" style={{ margin: 0 }}><Clock size={15} className="text-accent" /> {branch.hours}</p>
              <p className="tiny dim" style={{ margin: 0 }}>{branch.opened}</p>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedBranch(branch)}>Подробнее</button>
            </article>
          ))}
        </div>
      </section>

      <section className="section-sm container-narrow">
        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div className="stack">
            <span className="eyebrow">Обратная связь</span>
            <h2>Напишите нам</h2>
            <p className="small muted">Заполните форму — мы вернёмся с ответом в течение рабочего дня.</p>
            <div className="glass-panel stack" style={{ padding: 20 }}>
              <p className="small muted" style={{ margin: 0 }}><strong className="text-accent">Адрес:</strong> Новосибирск, ул. 2-я Воинская, 53</p>
              <p className="small muted" style={{ margin: 0 }}><strong className="text-accent">Режим работы:</strong> ежедневно, 11:00–23:00</p>
              <Link to="/faq" className="small nav-link text-accent">Сначала загляните в FAQ →</Link>
            </div>
          </div>
          <form className="glass-panel" style={{ padding: 24 }} onSubmit={sendMessage}>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-name">Ваше имя</label>
              <input id="contact-name" className="input" value={form.name} onChange={updateField('name')} placeholder="Как к вам обращаться" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-email">Email</label>
              <input id="contact-email" className="input" type="email" value={form.email} onChange={updateField('email')} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-message">Сообщение</label>
              <textarea id="contact-message" className="textarea" value={form.message} onChange={updateField('message')} placeholder="Чем можем помочь?" />
            </div>
            <button type="submit" className="btn btn-primary btn-block"><Send size={17} /> Отправить</button>
          </form>
        </div>
      </section>

      <Modal
        open={!!selectedBranch}
        onClose={() => setSelectedBranch(null)}
        title={selectedBranch?.title || 'Филиал'}
        footer={<a className="btn btn-primary btn-block" href={selectedBranch?.map} target="_blank" rel="noreferrer">Открыть на карте</a>}
      >
        {selectedBranch && (
          <div className="stack">
            <p className="small muted" style={{ margin: 0 }}><strong>Адрес:</strong> {selectedBranch.address}</p>
            <p className="small muted" style={{ margin: 0 }}><strong>Телефон:</strong> {selectedBranch.phone}</p>
            <p className="small muted" style={{ margin: 0 }}><strong>Часы работы:</strong> {selectedBranch.hours}</p>
            <p className="small muted" style={{ margin: 0 }}><strong>Статус:</strong> {selectedBranch.opened}</p>
          </div>
        )}
      </Modal>

      <InfoModal
        isOpen={!!modalInfo}
        onClose={() => setModalInfo(null)}
        title={modalInfo?.text}
        text={modalInfo?.info}
      />
    </div>
  );
}
