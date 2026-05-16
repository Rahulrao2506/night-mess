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

const statusNext: Record<string, string> = {
  pending: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
  ready: 'completed'
};

const statusLabel: Record<string, string> = {
  pending: 'Accept',
  accepted: 'Start Preparing',
  preparing: 'Mark Ready',
  ready: 'Complete'
};

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lastCount, setLastCount] = useState(0);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    try {
      const res = await fetch(`${API}/api/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // New order notification
        if (data.orders.length > lastCount && lastCount > 0) {
          const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-09a.mp3');
          audio.play().catch(() => {});
        }
        setLastCount(data.orders.length);
        setOrders(data.orders);
      }
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const rejectOrder = async (orderId: string) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      fetchOrders();
    } catch (err) {}
  };

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const counts = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'accepted' || o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  const todayTotal = orders
    .filter(o => o.status !== 'rejected')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      Loading orders...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', padding: '20px' }}>

      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ff6b35', marginBottom: 4 }}>
        🍽️ Admin Dashboard
      </h1>
      <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>
        Auto-refreshes every 10 seconds
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Pending', value: counts.pending, color: '#f59e0b' },
          { label: 'Preparing', value: counts.preparing, color: '#8b5cf6' },
          { label: 'Ready', value: counts.ready, color: '#22c55e' },
          { label: "Today's Revenue", value: `₹${todayTotal}`, color: '#ff6b35' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#1a1a1a', borderRadius: 12, padding: '16px 12px', textAlign: 'center', border: '1px solid #2a2a2a' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
        {['all', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '8px 14px', borderRadius: 20, border: '1px solid',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0,
              background: filter === f ? '#ff6b35' : 'transparent',
              borderColor: filter === f ? '#ff6b35' : '#333',
              color: filter === f ? '#fff' : '#888',
              textTransform: 'capitalize'
            }}>
            {f} {f === 'pending' && counts.pending > 0 ? `(${counts.pending})` : ''}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#444', padding: '60px 0', fontSize: 14 }}>
          No orders found
        </div>
      ) : (
        filtered.map(order => (
          <div key={order._id} style={{
            background: '#1a1a1a', borderRadius: 16, padding: '16px 20px',
            marginBottom: 12, border: `1px solid ${order.status === 'pending' ? '#f59e0b44' : '#2a2a2a'}`
          }}>
            {/* Order Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#ff6b35' }}>
                  #{order.tokenNumber}
                </span>
                <span style={{ fontSize: 12, color: '#666', marginLeft: 10 }}>
                  {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <span style={{
                background: statusColors[order.status] + '22',
                color: statusColors[order.status],
                padding: '4px 10px', borderRadius: 20,
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
              }}>
                {order.status}
              </span>
            </div>

            {/* Student Info */}
            <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
              👤 {order.student?.name || 'Student'} • {order.student?.rollNumber || order.student?.email || ''}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: '#888' }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#ff9a3c' }}>₹{order.totalAmount}</span>
            </div>

            {/* Action Buttons */}
            {order.status !== 'completed' && order.status !== 'rejected' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => updateStatus(order._id, statusNext[order.status])}
                  style={{
                    flex: 1, padding: '10px', background: '#ff6b35',
                    border: 'none', borderRadius: 10, color: '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer'
                  }}>
                  ✅ {statusLabel[order.status]}
                </button>
                {order.status === 'pending' && (
                  <button
                    onClick={() => rejectOrder(order._id)}
                    style={{
                      padding: '10px 16px', background: '#1a1a1a',
                      border: '1px solid #ef4444', borderRadius: 10,
                      color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                    }}>
                    ❌ Reject
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}