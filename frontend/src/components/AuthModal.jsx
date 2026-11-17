import { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setError('');
  };

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setErrors({});
    setError('');
    setForm((prev) => ({ ...prev, password: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!isLogin && form.name.trim().length < 2) {
      nextErrors.name = 'Укажите имя (минимум 2 символа)';
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      nextErrors.email = 'Введите корректный email';
    }
    if (form.password.length < 4) {
      nextErrors.password = 'Пароль должен быть не короче 4 символов';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Роль определяет сервер (админ — по email), селектор роли в форме не нужен.
      const result = isLogin
        ? await login(form.email.trim(), form.password)
        : await register(form.name.trim(), form.email.trim(), form.password);

      if (result.success) {
        setForm({ name: '', email: '', password: '' });
        setErrors({});
        onClose?.();
      } else {
        setError(result.message || 'Не удалось выполнить запрос. Попробуйте ещё раз.');
      }
    } catch {
      setError('Ошибка соединения с сервером. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={isLogin ? 'Вход в аккаунт' : 'Регистрация'}
      footer={
        <button
          type="submit"
          form="auth-form"
          className="btn btn-primary btn-block btn-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? <><span className="spinner" /> Подождите…</> : isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>
      }
    >
      <div className="tabs" role="tablist" aria-label="Режим авторизации">
        <button
          type="button"
          role="tab"
          aria-selected={isLogin}
          className={`tab ${isLogin ? 'tab-active' : ''}`}
          onClick={() => switchMode(true)}
        >
          Вход
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isLogin}
          className={`tab ${!isLogin ? 'tab-active' : ''}`}
          onClick={() => switchMode(false)}
        >
          Регистрация
        </button>
      </div>

      {error && (
        <div className="card" role="alert" style={{ borderColor: 'var(--danger)', marginBottom: 16 }}>
          <span className="form-error">{error}</span>
        </div>
      )}

      <form id="auth-form" className="stack" onSubmit={handleSubmit} noValidate>
        {!isLogin && (
          <div className="form-group">
            <label className="form-label" htmlFor="auth-name">Имя</label>
            <input
              id="auth-name"
              className="input"
              type="text"
              autoComplete="name"
              placeholder="Как к вам обращаться"
              value={form.name}
              onChange={setField('name')}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'auth-name-error' : undefined}
            />
            {errors.name && <span className="form-error" id="auth-name-error" role="alert">{errors.name}</span>}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            className="input"
            type="email"
            autoComplete="email"
            placeholder="ivan@mail.ru"
            value={form.email}
            onChange={setField('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'auth-email-error' : undefined}
          />
          {errors.email && <span className="form-error" id="auth-email-error" role="alert">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="auth-password">Пароль</label>
          <input
            id="auth-password"
            className="input"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            placeholder="Не менее 4 символов"
            value={form.password}
            onChange={setField('password')}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'auth-password-error' : undefined}
          />
          {errors.password && <span className="form-error" id="auth-password-error" role="alert">{errors.password}</span>}
        </div>
      </form>

      <p className="muted small text-center" style={{ marginTop: 18 }}>
        {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
        <button type="button" className="text-button" onClick={() => switchMode(!isLogin)}>
          {isLogin ? 'Зарегистрируйтесь' : 'Войдите'}
        </button>
      </p>
      {!isLogin && (
        <p className="dim tiny text-center">
          Роль назначается автоматически: доступ владельца определяется по email.
        </p>
      )}
    </Modal>
  );
}
