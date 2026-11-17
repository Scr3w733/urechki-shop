import { Check, MousePointer2, Palette, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Modal from './Modal';

export default function SettingsModal({ isOpen, onClose }) {
  const { theme, setTheme, THEMES, cursorStyle, setCursorStyle, CURSORS } = useTheme();

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Настройки"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>Готово</button>}
    >
      <div className="stack">
        <section>
          <h3 className="flex gap-2" style={{ fontSize: '1rem', marginBottom: 12 }}>
            <Palette size={17} className="text-accent" aria-hidden="true" />
            Акцентный цвет
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {Object.entries(THEMES).map(([key, option]) => {
              const selected = theme.color === option.color;
              return (
                <button
                  key={key}
                  type="button"
                  className={`btn ${selected ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setTheme(option)}
                  aria-pressed={selected}
                  style={{ justifyContent: 'flex-start', gap: 10 }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: option.color,
                      border: '1px solid rgba(255, 255, 255, .35)',
                    }}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{option.name}</span>
                  {selected && <Check size={15} style={{ marginLeft: 'auto' }} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </section>

        <div className="divider" style={{ margin: '2px 0' }} />

        <section>
          <h3 className="flex gap-2" style={{ fontSize: '1rem', marginBottom: 12 }}>
            <MousePointer2 size={17} className="text-accent" aria-hidden="true" />
            Курсор
          </h3>
          <div className="flex wrap gap-1">
            {Object.entries(CURSORS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`chip ${cursorStyle === key ? 'chip-active' : ''}`}
                aria-pressed={cursorStyle === key}
                onClick={() => setCursorStyle(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="tiny dim" style={{ marginTop: 10 }}>
            При выборе «Стандартный» остаётся обычный системный курсор.
          </p>
        </section>

        <div className="divider" style={{ margin: '2px 0' }} />

        <section>
          <h3 className="flex gap-2" style={{ fontSize: '1rem', marginBottom: 8 }}>
            <Sparkles size={17} className="text-accent" aria-hidden="true" />
            Уменьшение анимации
          </h3>
          <p className="small muted">
            Анимации становятся короче и спокойнее автоматически, если в системе включено
            «Уменьшить движение» (prefers-reduced-motion).
          </p>
        </section>
      </div>
    </Modal>
  );
}
