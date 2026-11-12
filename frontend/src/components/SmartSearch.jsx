import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search } from 'lucide-react';

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/api/products').then(res => setProducts(res.data));
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, products]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/catalog?search=${query}`);
      setQuery('');
      setResults([]);
    }
  };

  return (
    <div style={{ position: 'relative', width: '250px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', background: '#111', border: '1px solid #333', borderRadius: '20px', padding: '5px 15px' }}>
        <Search size={16} color="#888" />
        <input 
          type="text" 
          placeholder="Поиск..." 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          style={{ background: 'transparent', border: 'none', color: '#fff', marginLeft: '10px', outline: 'none', width: '100%', fontSize: '0.9rem' }} 
        />
      </form>

      {results.length > 0 && (
        <div style={{ position: 'absolute', top: '45px', left: 0, width: '100%', background: '#151515', border: '1px solid #333', borderRadius: '10px', overflow: 'hidden', zIndex: 1000 }}>
          {results.map(p => (
            <div key={p.id} onClick={() => { navigate(`/product/${p.id}`); setQuery(''); setResults([]); }} style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderBottom: '1px solid #222', hover: { background: '#222' } }}>
              <div style={{ fontSize: '1.5rem' }}>{p.category === 'Пиво' ? '🍻' : '🍟'}</div>
              <div>
                <div style={{ color: '#fff', fontSize: '0.9rem' }}>{p.name}</div>
                <div style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>{p.price} ₽</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}