'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    password: ''
  });

  const API = 'https://night-mess-api.onrender.com';

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, rollNumber: form.rollNumber, password: form.password };

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      console.log('Response:', data);

      if (!data.success) {
        setError(data.message || 'Something went wrong');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }

    } catch (err: any) {
      console.error(err);
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #2a2a2a'
      }}>
        <h1 style={{ color: '#ff6b35', textAlign: 'center', marginBottom: '8px' }}>
          🍽️ Night Mess
        </h1>
        <p style={{ color: '#888', textAlign: 'center', marginBottom: '32px' }}>
          {isLogin ? 'Sign in to order food' : 'Create your account'}
        </p>

        {error && (
          <div style={{
            background: '#ff000022',
            border: '1px solid #ff0000',
            color: '#ff6b6b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {!isLogin && (
          <>
            <label style={{ color: '#888', fontSize: '13px' }}>Full Name</label>
            <input
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              style={inputStyle}
            />
            <label style={{ color: '#888', fontSize: '13px' }}>Roll Number</label>
            <input
              type="text"
              placeholder="24BCE1234"
              value={form.rollNumber}
              onChange={e => setForm({...form, rollNumber: e.target.value})}
              style={inputStyle}
            />
          </>
        )}

        <label style={{ color: '#888', fontSize: '13px' }}>Email</label>
        <input
          type="email"
          placeholder="yourname@vit.ac.in"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          style={inputStyle}
        />

        <label style={{ color: '#888', fontSize: '13px' }}>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          style={inputStyle}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#555' : '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '8px'
          }}
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <p style={{ color: '#888', textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ color: '#ff6b35', cursor: 'pointer', marginLeft: '6px' }}
          >
            {isLogin ? 'Register' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  background: '#2a2a2a',
  border: '1px solid #333',
  borderRadius: '8px',
  color: 'white',
  fontSize: '15px',
  marginBottom: '16px',
  marginTop: '4px',
  boxSizing: 'border-box' as const
};