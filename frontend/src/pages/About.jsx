import { Link } from 'react-router-dom';
import { ArrowRight, Beer, Compass, Heart, MapPin, ShieldCheck, Users } from 'lucide-react';

const timeline = [
  {
    year: '2015',
    title: 'Три друга и одна идея',
    text: 'Мы устали от одинакового пива на полках и решили доказать, что Новосибирск может гордиться своим крафтом. Первые котлы появились в арендованном подвале на 2-й Воинской, 53.',
  },
  {
    year: 'Первые партии',
    title: 'Эксперименты и сарафанное радио',
    text: 'Бессонные ночи, десятки рецептур, сибирский хмель и контроль температуры до градуса. Наш лагер, разлитый в обычные бутылки и подаренный друзьям, получил неожиданно тёплый отклик.',
  },
  {
    year: '2018',
    title: 'Своё производство',
    text: 'Переехали в промзону на Станционную, 60: увеличили объёмы и добавили смелые сорта — шоколадные стауты, цитрусовые IPA и пшеничные вайсбиры. Запустили линию закусок: ржаные сухарики и вяленого леща.',
  },
  {
    year: 'Сегодня',
    title: 'Четыре бара и мерч',
    text: 'Сеть фирменных баров в разных районах города, современный завод и линейка мерча. Мы не стоим на месте и продолжаем искать новые вкусы.',
  },
];

const values = [
  { icon: Beer, title: 'Варим сами', desc: 'Собственное производство без посредников' },
  { icon: ShieldCheck, title: 'Честное сырьё', desc: 'Вода, солод, хмель и дрожжи — без концентратов' },
  { icon: Users, title: 'Команда', desc: 'Пивовары, технологи и бармены, которые любят своё дело' },
  { icon: Heart, title: 'Культура общения', desc: 'Пиво — повод собраться вместе' },
];

export default function About() {
  return (
    <div className="fade-in">
      <section className="section container-narrow text-center">
        <span className="eyebrow">О нас</span>
        <h1>Наша история</h1>
        <p className="muted" style={{ maxWidth: 660, margin: '16px auto 0' }}>
          «У Речушки» — это сага о сибирском характере, любви к пивоварению и бесконечном
          поиске идеального вкуса. Началось всё с маленькой, но амбициозной идеи.
        </p>
      </section>

      <section className="section-sm container">
        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div className="glass-panel stack" style={{ padding: 30 }}>
            <span className="badge badge-accent" style={{ alignSelf: 'flex-start' }}><Compass size={14} /> Наш путь</span>
            <h2>От подвала до завода</h2>
            <p>
              В 2015 году трое друзей-энтузиастов устали от безликого пива и решили варить своё.
              Арендованный подвал на 2-й Воинской, 53 стал первой площадкой: старые трубы,
              бетонные стены и первые, ещё несовершенные варочные котлы.
            </p>
            <p className="small muted">
              Мы перепробовали десятки рецептур, закупали хмель у сибирских фермеров и учились
              контролировать температуру с точностью до градуса. Главная цель не менялась —
              создавать продукт, который сами с гордостью поставим на стол.
            </p>
          </div>
          <div className="stack" style={{ gap: 14 }}>
            {timeline.map(item => (
              <div key={item.year} className="card card-hover">
                <div className="flex gap-2" style={{ alignItems: 'baseline' }}>
                  <span className="badge badge-accent">{item.year}</span>
                  <h3 className="small bold">{item.title}</h3>
                </div>
                <p className="small muted" style={{ marginTop: 10 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm container">
        <div className="section-head center">
          <span className="eyebrow">Что мы бережём</span>
          <h2>Наши принципы</h2>
        </div>
        <div className="grid grid-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-hover text-center stack" style={{ alignItems: 'center' }}>
              <span className="icon-btn text-accent"><Icon size={21} /></span>
              <strong className="small">{title}</strong>
              <p className="small muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-sm container-narrow text-center">
        <div className="glass-panel stack" style={{ padding: '36px 28px', alignItems: 'center', borderColor: 'var(--border-accent)' }}>
          <MapPin size={28} className="text-accent" />
          <h2>Загляните к нам</h2>
          <p className="muted" style={{ maxWidth: 520 }}>
            Четыре фирменных бара в Новосибирске и экскурсии на заводе — лучший способ
            познакомиться с пивоварней лично.
          </p>
          <div className="flex gap-2 wrap center">
            <Link to="/contacts" className="btn btn-primary">Адреса и контакты <ArrowRight size={17} /></Link>
            <Link to="/production" className="btn btn-outline">Как мы варим</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
