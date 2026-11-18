import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bot, MessageCircle, Send, User, X } from 'lucide-react';

const QUICK_REPLIES = ['Доставка', 'Оплата', 'Бонусы', 'График работы', 'Состав пива'];

const RULES = [
  {
    match: /достав|привез|курьер/i,
    text: 'Доставка по Новосибирску занимает 1–2 часа. Бесплатно от 2 000 ₽, иначе 300 ₽. Курьеры работают с 11:00 до 23:00.',
  },
  {
    match: /оплат|карт|сбп|наличн/i,
    text: 'Принимаем банковские карты, СБП и наличные при получении. Чек приходит на почту после заказа.',
  },
  {
    match: /бонус|скидк|промокод/i,
    text: 'С каждой покупки начисляем 10% бонусами. Ими можно оплатить до 50% следующего заказа, а в Рулетке бывают промокоды.',
  },
  {
    match: /график|работаете|время|экскурс/i,
    text: 'Бары открыты ежедневно с 11:00 до 23:00. Экскурсии на заводе — по субботам в 14:00.',
  },
  {
    match: /состав|ингредиент|натуральн/i,
    text: 'Варим пиво из сибирской воды, ячменя, хмеля и дрожжей. Без порошков и концентратов.',
  },
  {
    match: /мерч|футболк|худи/i,
    text: 'В Конструкторе мерча можно выбрать цвет, принт и размер. Там же есть футболки и худи «У Речушки».',
  },
  {
    match: /адрес|находит|бар/i,
    text: 'Наши бары в Новосибирске: 2-я Воинская 53, Ленина 10, Красный проспект 50 и Кирова 27.',
  },
  {
    match: /привет|здравств|добрый/i,
    text: 'Здравствуйте! Рад вас видеть. О чём хотите узнать?',
  },
];

function getReply(text) {
  const rule = RULES.find((item) => item.match.test(text));
  return rule
    ? rule.text
    : 'Пока не знаю точного ответа. Помогут раздел «Вопросы и ответы» (FAQ) или звонок: +7 (951) 624-01-61.';
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 0,
      isBot: true,
      text: 'Здравствуйте! Я помощник «У Речушки». Спросите меня о доставке, оплате, бонусах или пиве.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const timersRef = useRef([]);
  const pendingRef = useRef(0);
  const nextIdRef = useRef(1);
  const reduceMotion = useReducedMotion();

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const send = (rawText) => {
    const text = rawText.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: nextIdRef.current++, isBot: false, text }]);
    setInput('');
    pendingRef.current += 1;
    setIsTyping(true);

    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextIdRef.current++, isBot: true, text: getReply(text) }]);
      pendingRef.current -= 1;
      setIsTyping(pendingRef.current > 0);
    }, 600);
    timersRef.current.push(timer);
  };

  const showQuickReplies = messages.length === 1 || messages[messages.length - 1]?.isBot;

  const panelAnimation = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 16, scale: 0.98 },
      };

  return (
    <>
      <motion.button
        type="button"
        className="btn btn-primary"
        onClick={() => setIsOpen((open) => !open)}
        whileHover={reduceMotion ? undefined : { scale: 1.04 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        aria-label={isOpen ? 'Закрыть чат' : 'Открыть чат'}
        aria-expanded={isOpen}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          width: 52,
          height: 52,
          padding: 0,
          borderRadius: '50%',
          zIndex: 9950,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        }}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            {...panelAnimation}
            aria-label="Чат с помощником"
            className="glass-panel"
            style={{
              position: 'fixed',
              right: 20,
              bottom: 84,
              width: 'min(380px, calc(100vw - 32px))',
              height: 'min(560px, calc(100dvh - 116px))',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 9949,
            }}
          >
            <header
              className="flex between gap-2"
              style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}
            >
              <div className="flex gap-2" style={{ minWidth: 0 }}>
                <span
                  className="flex"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 11,
                    flexShrink: 0,
                    background: 'rgba(var(--accent-rgb), .12)',
                    color: 'var(--accent)',
                  }}
                >
                  <Bot size={18} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="bold small" style={{ color: 'var(--text)' }}>Помощник «У Речушки»</div>
                  <div className="tiny dim flex gap-1" style={{ alignItems: 'center' }}>
                    <span className="status-dot" style={{ width: 6, height: 6, boxShadow: 'none' }} />
                    Отвечает сразу
                  </div>
                </div>
              </div>
              <button type="button" className="icon-btn" style={{ width: 32, height: 32, flexShrink: 0 }} onClick={() => setIsOpen(false)} aria-label="Закрыть чат">
                <X size={16} />
              </button>
            </header>

            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-label="Сообщения"
              style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {messages.map((message) => (
                <div key={message.id} style={{ display: 'flex', justifyContent: message.isBot ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: 8 }}>
                  <span
                    className="flex"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: message.isBot ? 'rgba(var(--accent-rgb), .12)' : 'rgba(255, 255, 255, .06)',
                      color: message.isBot ? 'var(--accent)' : 'var(--text-muted)',
                    }}
                    aria-hidden="true"
                  >
                    {message.isBot ? <Bot size={14} /> : <User size={14} />}
                  </span>
                  <div
                    style={{
                      maxWidth: '78%',
                      padding: '10px 14px',
                      borderRadius: 14,
                      borderBottomLeftRadius: message.isBot ? 4 : 14,
                      borderBottomRightRadius: message.isBot ? 14 : 4,
                      background: message.isBot ? 'rgba(255, 255, 255, .05)' : 'var(--accent)',
                      border: message.isBot ? '1px solid var(--border)' : 'none',
                      color: message.isBot ? 'var(--text)' : '#111',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} aria-label="Помощник печатает">
                  <span className="flex" style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(var(--accent-rgb), .12)', color: 'var(--accent)' }} aria-hidden="true">
                    <Bot size={14} />
                  </span>
                  <span className="flex gap-1" style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255, 255, 255, .05)', border: '1px solid var(--border)' }} aria-hidden="true">
                    {[0, 1, 2].map((index) => (
                      <motion.span
                        key={index}
                        animate={reduceMotion ? undefined : { opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.15, ease: 'easeInOut' }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}
                      />
                    ))}
                  </span>
                </div>
              )}
            </div>

            {showQuickReplies && (
              <div
                className="flex gap-1"
                style={{ padding: '0 14px 10px', overflowX: 'auto', flexShrink: 0 }}
                aria-label="Частые вопросы"
              >
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    className="chip"
                    onClick={() => send(reply)}
                    style={{ whiteSpace: 'nowrap', padding: '7px 12px', fontSize: '0.78rem' }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
              style={{ padding: 12, borderTop: '1px solid var(--border)', flexShrink: 0 }}
            >
              <input
                ref={inputRef}
                className="input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Напишите вопрос…"
                aria-label="Ваш вопрос"
                maxLength={300}
                style={{ flex: 1, minWidth: 0, padding: '10px 14px', borderRadius: 999 }}
              />
              <button type="submit" className="btn btn-primary icon-btn" style={{ width: 42, height: 42, padding: 0, flexShrink: 0 }} aria-label="Отправить сообщение" disabled={!input.trim()}>
                <Send size={17} />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
