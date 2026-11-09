import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Загружаем пользователя из памяти браузера при старте
  useEffect(() => {
    const savedUser = localStorage.getItem('urechki_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (email, password) => {
    // Имитация входа: если пароль верный, создаем профиль
    const role = email.includes('admin') ? 'Владелец' : email.includes('dev') ? 'Разработчик' : email.includes('manager') ? 'Менеджер' : 'Клиент';
    const newUser = { email, name: email.split('@')[0], role, status: 'VIP' };
    
    setUser(newUser);
    localStorage.setItem('urechki_user', JSON.stringify(newUser));
    return { success: true };
  };

  const register = (name, email, password, role = 'Клиент') => {
    const newUser = { email, name, role, status: 'Новичок' };
    setUser(newUser);
    localStorage.setItem('urechki_user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('urechki_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);