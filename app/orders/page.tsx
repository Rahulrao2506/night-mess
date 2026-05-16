'use client';
import { useState, useEffect } from 'react';

const API = 'https://night-mess-api.onrender.com';

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  preparing: '#8b5cf6',
  ready: '#22c55e',
  completed: '#666',
  rejected: '#ef4444'
};

const statusEmoji: Record<string, string> = {
  pending: '⏳',
  accepted: '✅',
  preparing: '👨‍🍳',
  ready: '🎉',
  completed: '✔️',
  rejected: '❌'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!stored || !token) {
      // Don't logout — just show login prompt
      setLoading(false);
      return;
    }

    setUser(JSON.parse(stored));
    fetchOrders(token);

    const interval = setInterval(() => fetchOrders(token), 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (token: string) => {
    try {
      const res = await fetch(`${API}/api/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {}
    setLoading(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      Loading your orders...
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🍽️</div>
      <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>Please login to view orders</div>
      <button
        onClick={() => window.location.href = '/login'}
        style={{ background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        Go to Login
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', padding: '20px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#ff6b35', marginBottom: 4 }}>
        📋 My Orders
      </h1>
      <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>
        Auto-refreshes every 15 seconds
      </p>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
          <div style={{ color: '#666', fontSize: 15 }}>No orders yet</div>
          <button
            onClick={() => window.location.href = '/'}
            style={{ marginTop: 16, background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Browse Menu
          </button>
        </div>
      ) : (
        orders.map(order => (
          <div key={order._id} style={{
            background: '#1a1a1a', borderRadius: 16, padding: '16px 20px',
            marginBottom: 12, border: `1px solid ${statusColors[order.status]}44`
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#ff6b35' }}>
                  #{order.tokenNumber}
                </span>
                <span style={{ fontSize: 11, color: '#666', marginLeft: 10 }}>
                  {new Date(order.createdAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <span style={{
                background: statusColors[order.status] + '22',
                color: statusColors[order.status],
                padding: '4px 12px', borderRadius: 20,
                fontSize: 12, fontWeight: 700
              }}>
                {statusEmoji[order.status]} {order.status.toUpperCase()}
              </span>
            </div>

            {/* Order Timeline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14, overflowX: 'auto' }}>
              {['pending', 'accepted', 'preparing', 'ready', 'completed'].map((step, i) => {
                const steps = ['pending', 'accepted', 'preparing', 'ready', 'completed'];
                const currentIndex = steps.indexOf(order.status);
                const stepIndex = steps.indexOf(step);
                const isActive = stepIndex <= currentIndex;
                const isCurrent = step === order.status;
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <div style={{
                      width: isCurrent ? 32 : 24, height: isCurrent ? 32 : 24,
                      borderRadius: '50%',
                      background: isActive ? statusColors[order.status] : '#2a2a2a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: isCurrent ? 14 : 10,
                      transition: 'all 0.3s',
                      border: isCurrent ? `2px solid ${statusColors[order.status]}` : 'none'
                    }}>
                      {isActive ? statusEmoji[step] : '○'}
                    </div>
                    {i < 4 && (
                      <div style={{
                        width: 20, height: 2,
                        background: stepIndex < currentIndex ? statusColors[order.status] : '#2a2a2a'
                      }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Items */}
            <div style={{ marginBottom: 12 }}>
              {order.items?.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#ccc', marginBottom: 4 }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: 10 }}>
              <span style={{ fontSize: 13, color: '#888' }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#ff9a3c' }}>₹{order.totalAmount}</span>
            </div>

            {/* Ready banner */}
            {order.status === 'ready' && (
              <div style={{
                marginTop: 12, background: '#22c55e22', border: '1px solid #22c55e',
                borderRadius: 10, padding: '10px 14px', fontSize: 13,
                color: '#22c55e', fontWeight: 700, textAlign: 'center'
              }}>
                🎉 Your order is ready! Show token #{order.tokenNumber} at counter
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}