import { Accessibility, Check, LayoutGrid, MousePointer2, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Modal from './Modal';

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <section className="settings-section">
      <h3 className="settings-title">
        <Icon size={17} className="text-accent" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function ChoiceChips({ options, value, onChange, label }) {
  return (
    <div className="settings-chip-row" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`chip ${value === option.value ? 'chip-active' : ''}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({ checked, onChange, label, hint }) {
  return (
    <label className="toggle-row">
      <span className="toggle-copy">
        <span className="toggle-label">{label}</span>
        {hint && <span className="settings-hint">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

const DENSITY_OPTIONS = [
  { value: 'comfortable', label: 'Комфортно' },
  { value: 'compact', label: 'Компактно' }
];

const FONT_SCALE_OPTIONS = [
  { value: 'small', label: 'Маленький' },
  { value: 'normal', label: 'Обычный' },
  { value: 'large', label: 'Крупный' }
];

export default function SettingsModal({ isOpen, onClose }) {
  const {
    theme, setTheme, THEMES,
    cursorStyle, setCursorStyle, CURSORS,
    density, setDensity,
    animationsEnabled, setAnimationsEnabled,
    fontScale, setFontScale,
    socialProofEnabled, setSocialProofEnabled
  } = useTheme();

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Настройки"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>Готово</button>}
    >
      <div className="stack">
        <SettingsSection icon={Palette} title="Тема">
          <div className="settings-grid">
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
        </SettingsSection>

        <div className="divider" style={{ margin: '2px 0' }} />

        <SettingsSection icon={MousePointer2} title="Курсор">
          <ChoiceChips
            label="Стиль курсора"
            options={Object.entries(CURSORS).map(([value, label]) => ({ value, label }))}
            value={cursorStyle}
            onChange={setCursorStyle}
          />
          <p className="settings-hint">
            При выборе «Стандартный» остаётся обычный системный курсор.
          </p>
        </SettingsSection>

        <div className="divider" style={{ margin: '2px 0' }} />

        <SettingsSection icon={LayoutGrid} title="Интерфейс">
          <div className="settings-field">
            <span className="settings-field-label">Плотность интерфейса</span>
            <ChoiceChips
              label="Плотность интерфейса"
              options={DENSITY_OPTIONS}
              value={density}
              onChange={setDensity}
            />
          </div>
          <div className="settings-field">
            <span className="settings-field-label">Размер шрифта</span>
            <ChoiceChips
              label="Размер шрифта"
              options={FONT_SCALE_OPTIONS}
              value={fontScale}
              onChange={setFontScale}
            />
          </div>
        </SettingsSection>

        <div className="divider" style={{ margin: '2px 0' }} />

        <SettingsSection icon={Accessibility} title="Доступность">
          <ToggleRow
            label="Анимации интерфейса"
            hint="Отключение убирает переходы и движение. Индикатор загрузки остаётся активным."
            checked={animationsEnabled}
            onChange={setAnimationsEnabled}
          />
          <ToggleRow
            label="Уведомления о покупках"
            hint="Всплывающие сообщения о недавних заказах других покупателей."
            checked={socialProofEnabled}
            onChange={setSocialProofEnabled}
          />
          <p className="settings-hint">
            Системная настройка «Уменьшить движение» дополнительно смягчает анимации автоматически.
          </p>
        </SettingsSection>
      </div>
    </Modal>
  );
}
