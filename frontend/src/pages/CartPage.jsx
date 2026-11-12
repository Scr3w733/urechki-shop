// В компоненте CartSidebar.jsx (или CartPage.jsx) добавь этот блок перед списком товаров:
{/* ПРОГРЕСС-БАР */}
{cart.length > 0 && (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '0.85rem', marginBottom: '8px' }}>
      <span>Оформление заказа</span>
      <span style={{ color: 'var(--accent)' }}>{Math.round((total / 2000) * 100)}%</span>
    </div>
    <div style={{ width: '100%', height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min((total / 2000) * 100, 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
    </div>
    <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '5px', textAlign: 'right' }}>
      До бесплатной доставки: {Math.max(0, 2000 - total)} ₽
    </div>
  </div>
)}