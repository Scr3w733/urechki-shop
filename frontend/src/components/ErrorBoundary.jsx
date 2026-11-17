import { Component } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="container section text-center">
        <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <AlertTriangle size={48} color="var(--accent)" />
          <h2 style={{ margin: '18px 0 10px' }}>Что-то пошло не так</h2>
          <p>Страница не смогла загрузиться. Попробуйте обновить её.</p>
          <button className="btn btn-primary" style={{ marginTop: 22 }} onClick={() => window.location.reload()}>
            <RefreshCcw size={17} /> Обновить страницу
          </button>
        </div>
      </div>
    );
  }
}
