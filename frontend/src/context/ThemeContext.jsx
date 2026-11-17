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

export const DENSITIES = {
  comfortable: 'Комфортно',
  compact: 'Компактно'
};

export const FONT_SCALES = {
  small: 0.9,
  normal: 1,
  large: 1.12
};

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(e);
    return null;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(e);
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = read('urechki_theme');
    if (savedTheme && THEMES[savedTheme]) return THEMES[savedTheme];
    return THEMES.gold;
  });

  // Раньше «неоновый» курсор был значением по умолчанию и скрывал системный.
  // Один раз мигрируем старое сохранённое значение на стандартный курсор.
  const [cursorStyle, setCursorStyle] = useState(() => {
    try {
      const migrated = localStorage.getItem('urechki_cursor_migrated');
      const saved = localStorage.getItem('urechki_cursor_style');
      if (!migrated) {
        localStorage.setItem('urechki_cursor_migrated', '1');
        if (!saved || saved === 'neon') {
          localStorage.setItem('urechki_cursor_style', 'default');
          return 'default';
        }
      }
      if (saved && CURSORS[saved]) return saved;
    } catch (e) {
      console.warn(e);
    }
    return 'default';
  });

  const [density, setDensity] = useState(() => {
    const saved = read('urechki_density');
    return saved === 'compact' || saved === 'comfortable' ? saved : 'comfortable';
  });

  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const saved = read('urechki_animations');
    return saved === null ? true : saved === '1';
  });

  const [fontScale, setFontScale] = useState(() => {
    const saved = read('urechki_font_scale');
    return saved && Object.prototype.hasOwnProperty.call(FONT_SCALES, saved) ? saved : 'normal';
  });

  const [socialProofEnabled, setSocialProofEnabled] = useState(() => {
    const saved = read('urechki_social_proof_enabled');
    return saved === null ? true : saved === '1';
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', theme.color);
    document.documentElement.style.setProperty('--accent-rgb', theme.rgb);
    write('urechki_theme', Object.keys(THEMES).find(key => THEMES[key].color === theme.color));
  }, [theme]);

  useEffect(() => {
    // Если выбран стандартный курсор, убираем класс, чтобы вернуть мышку Windows
    document.body.classList.toggle('cursor-custom', cursorStyle !== 'default');
    write('urechki_cursor_style', cursorStyle);
  }, [cursorStyle]);

  useEffect(() => {
    document.body.classList.toggle('density-compact', density === 'compact');
    write('urechki_density', density);
  }, [density]);

  useEffect(() => {
    document.body.classList.toggle('no-animations', !animationsEnabled);
    write('urechki_animations', animationsEnabled ? '1' : '0');
  }, [animationsEnabled]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(FONT_SCALES[fontScale]));
    write('urechki_font_scale', fontScale);
  }, [fontScale]);

  useEffect(() => {
    write('urechki_social_proof_enabled', socialProofEnabled ? '1' : '0');
  }, [socialProofEnabled]);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      THEMES,
      cursorStyle,
      setCursorStyle,
      CURSORS,
      density,
      setDensity,
      DENSITIES,
      animationsEnabled,
      setAnimationsEnabled,
      fontScale,
      setFontScale,
      FONT_SCALES,
      socialProofEnabled,
      setSocialProofEnabled
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
