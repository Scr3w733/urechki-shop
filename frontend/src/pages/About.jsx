import { Link } from 'react-router-dom';
import { ArrowRight, Beer, Compass, Heart, MapPin, ShieldCheck, Users } from 'lucide-react';

const timeline = [
  {
    year: '2015',
    title: 'Первый подвал на 2-й Воинской',
    text: 'Трое друзей сняли помещение на 2-й Воинской, 53 и варили первые партии для знакомых. Так появилась «У Речушки» — с небольшого котла и сарафанного радио.',
  },
  {
    year: '2018',
    title: 'Своя пивоварня',
    text: 'Переехали на Станционную, 60: увеличили объёмы и добавили смелые сорта — шоколадные стауты, цитрусовые IPA и пшеничные вайсбиры. Запустили линию закусок: ржаные сухарики и вяленого леща.',
  },
  {
    year: '2021',
    title: 'Третий бар в городе',
    text: 'Открыли филиал на Красном проспекте, 50. К тому моменту работали точки на 2-й Воинской и Ленина (с 2019 года).',
  },
  {
    year: '2024',
    title: 'Четыре бара и мерч',
    text: 'После открытия бара на Кирова (2023) наших баров стало четыре. Добавили мерч и подарочные наборы — часть из них можно собрать прямо на сайте.',
  },
  {
    year: '2026',
    title: 'Сегодня и в планах',
    text: 'Варим на своей пивоварне, доставляем по Новосибирску и развиваем сайт. Приложение пока в разработке — это планы, а не запущенный сервис.',
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
            <Link to="/production" className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>Как устроено производство <ArrowRight size={17} /></Link>
          </div>

          <div className="stack">
            <div className="flex between wrap gap-2" style={{ alignItems: 'baseline' }}>
              <span className="eyebrow">Хронология</span>
              <span className="tiny dim">2015 — 2026</span>
            </div>
            <div style={{ position: 'relative', paddingLeft: 26, borderLeft: '1px solid var(--border)' }}>
              {timeline.map(item => (
                <div key={item.year} style={{ position: 'relative', marginBottom: 18 }}>
                  <span
                    aria-hidden="true"
                    style={{ position: 'absolute', left: -33, top: 8, width: 13, height: 13, borderRadius: '50%', background: 'var(--accent)', border: '3px solid var(--bg)' }}
                  />
                  <div className="card card-hover">
                    <div className="flex gap-2" style={{ alignItems: 'baseline' }}>
                      <span className="badge badge-accent">{item.year}</span>
                      <h3 className="small bold">{item.title}</h3>
                    </div>
                    <p className="small muted" style={{ marginTop: 10 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="tiny dim" style={{ margin: 0 }}>
              Даты приведены по данным пивоварни; всё, что ещё не запущено, помечено как планы.
            </p>
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
