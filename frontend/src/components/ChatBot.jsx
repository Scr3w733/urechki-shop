import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

const quickReplies = ["Доставка", "Оплата", "Бонусы", "График работы", "Состав пива"];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Здравствуйте! Я нейро-помощник пивоварни 'У Речушки'. Чем могу помочь?", isBot: true }]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processMessage = (text) => {
    const lower = text.toLowerCase();
    
    if (lower.includes('доставка') || lower.includes('привез')) return "Доставка по Новосибирску занимает 1-2 часа. Бесплатно от 2000 рублей. В остальных случаях — 300 рублей. Курьеры работают с 11:00 до 23:00.";
    if (lower.includes('оплат') || lower.includes('карт') || lower.includes('сбп')) return "Мы принимаем банковские карты (Visa, MIR), СБП, наличные при получении и даже криптовалюту. Все чеки приходят на почту.";
    if (lower.includes('бонус') || lower.includes('скидк')) return "С каждой покупки мы начисляем 10% бонусами! Ими можно оплатить до 50% следующего заказа. А еще у нас есть рулетка, где можно выиграть промокод!";
    if (lower.includes('график') || lower.includes('работаете') || lower.includes('время')) return "Наши бары работают ежедневно с 11:00 до 23:00. Завод (экскурсии) — по субботам в 14:00.";
    if (lower.includes('состав') || lower.includes('ингредиент')) return "Мы варим пиво только из натуральных ингредиентов: сибирская вода, отборный ячмень, хмель и дрожжи. Никаких порошков и концентратов!";
    if (lower.includes('мерч') || lower.includes('футболк')) return "Наш мерч производится в дочерней компании в Шанхае. На сайте есть 'Конструктор', где можно выбрать цвет, принт и размер футболки!";
    if (lower.includes('привет') || lower.includes('здравств')) return "Привет-привет! 🍻 Рад вас видеть. Что вас интересует?";
    if (lower.includes('адрес') || lower.includes('находит')) return "У нас 4 бара в Новосибирске: ул. 2-я Воинская 53, ул. Ленина 10, Красный проспект 50, ул. Кирова 27. Приходите в гости!";
    
    return "Интересный вопрос! Я передал его нашему менеджеру. А пока вы можете посмотреть наш каталог или позвонить по номеру +7 (951) 624-01-61.";
  };

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Сообщение пользователя
    const userMsg = { text: text, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Имитация задержки и ответ бота
    setTimeout(() => {
      const botMsg = { text: processMessage(text), isBot: true };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  return (
    <>
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(212,175,55,0.8)' }} whileTap={{ scale: 0.9 }}
        style={{ position: 'fixed', bottom: '30px', right: '30px', width: '65px', height: '65px', borderRadius: '50%', background: 'linear-gradient(135deg, #d4af37, #ffdf00)', border: 'none', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 9999, boxShadow: '0 5px 20px rgba(0,0,0,0.5)' }}
      >
        {isOpen ? <X size={30} /> : <MessageCircle size={30} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{ position: 'fixed', bottom: '110px', right: '30px', width: '380px', height: '550px', background: '#0a0a0a', border: '1px solid #d4af37', borderRadius: '20px', display: 'flex', flexDirection: 'column', zIndex: 9998, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }}
          >
            <div style={{ background: 'linear-gradient(90deg, #d4af37, #ffdf00)', padding: '20px', color: '#000', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <Bot size={24} /> Нейро-помощник
            </div>
            
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexDirection: msg.isBot ? 'row' : 'row-reverse' }}>
                  <div style={{ background: msg.isBot ? '#d4af37' : '#333', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {msg.isBot ? <Bot size={16} color="#000"/> : <User size={16} color="#fff"/>}
                  </div>
                  <div style={{ background: msg.isBot ? '#1a1a1a' : '#d4af37', color: msg.isBot ? '#fff' : '#000', padding: '12px 16px', borderRadius: '15px', maxWidth: '75%', fontSize: '0.9rem', lineHeight: '1.5', borderBottomLeftRadius: msg.isBot ? 0 : '15px', borderBottomRightRadius: msg.isBot ? '15px' : 0, border: msg.isBot ? '1px solid #333' : 'none' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Быстрые ответы */}
            <div style={{ padding: '10px', display: 'flex', gap: '8px', overflowX: 'auto', background: '#111', borderTop: '1px solid #333' }}>
              {quickReplies.map((reply, i) => (
                <button key={i} onClick={() => handleSend(reply)} style={{ background: 'transparent', border: '1px solid #d4af37', color: '#d4af37', padding: '8px 12px', borderRadius: '20px', fontSize: '0.8rem', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                  {reply}
                </button>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} style={{ display: 'flex', padding: '15px', borderTop: '1px solid #222', background: '#0a0a0a' }}>
              <input type="text" placeholder="Ваш вопрос..." value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1, background: '#111', border: '1px solid #333', color: '#fff', outline: 'none', padding: '12px 15px', borderRadius: '25px', fontSize: '0.9rem' }} />
              <button type="submit" style={{ background: '#d4af37', border: 'none', color: '#000', cursor: 'pointer', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px' }}>
                <Send size={20}/>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}