import { createContext, useState, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      
      <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 999999, display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none' }}>
        <AnimatePresence>
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              style={{
                background: 'rgba(20,20,20,0.95)', border: `1px solid ${notif.type === 'error' ? '#ff4444' : 'var(--accent)'}`,
                padding: '15px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', pointerEvents: 'auto', minWidth: '300px'
              }}
            >
              {notif.type === 'success' && <CheckCircle color="var(--accent)" size={24} />}
              {notif.type === 'error' && <AlertTriangle color="#ff4444" size={24} />}
              {notif.type === 'info' && <Info color="#00d2ff" size={24} />}
              
              <span style={{ color: '#fff', flex: 1, fontSize: '0.95rem' }}>{notif.message}</span>
              <X size={18} color="#888" style={{ cursor: 'pointer' }} onClick={() => removeNotification(notif.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);