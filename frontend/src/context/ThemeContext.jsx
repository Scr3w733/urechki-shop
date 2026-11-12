import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  gold: { name: 'Золото', color: '#d4af37', rgb: '212, 175, 55' },
  pink: { name: 'Киберпанк', color: '#ff007f', rgb: '255, 0, 127' },
  green: { name: 'Неон', color: '#00ff41', rgb: '0, 255, 65' },
  blue: { name: 'Океан', color: '#00d2ff', rgb: '0, 210, 255' }
};

export const CURSORS = {
  neon: 'Неоновый круг',
  dot: 'Точка',
  crosshair: 'Прицел',
  default: 'Стандартный'
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(THEMES.gold);
  const [cursorStyle, setCursorStyle] = useState('neon');

  useEffect(() => {
    const savedTheme = localStorage.getItem('urechki_theme');
    if (savedTheme && THEMES[savedTheme]) setTheme(THEMES[savedTheme]);
    
    const savedCursor = localStorage.getItem('urechki_cursor_style');
    if (savedCursor && CURSORS[savedCursor]) setCursorStyle(savedCursor);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', theme.color);
    document.documentElement.style.setProperty('--accent-rgb', theme.rgb);
    localStorage.setItem('urechki_theme', Object.keys(THEMES).find(key => THEMES[key].color === theme.color));
  }, [theme]);

  useEffect(() => {
    // Если выбран стандартный курсор, убираем класс, чтобы вернуть мышку Windows
    if (cursorStyle === 'default') {
      document.body.classList.remove('cursor-custom');
    } else {
      document.body.classList.add('cursor-custom');
    }
    localStorage.setItem('urechki_cursor_style', cursorStyle);
  }, [cursorStyle]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, THEMES, cursorStyle, setCursorStyle, CURSORS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);