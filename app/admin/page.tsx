'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

function toDateString(date: Date) {
  return date.toISOString().split('T')[0];
}

function isSameDay(dateStr: string, selected: string) {
  return dateStr.startsWith(selected);
}

export default function AdminPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [lastCount, setLastCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(toDateString(new Date()).slice(0, 7));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(user);
    if (parsed.role !== 'admin') {
      router.push('/');
      return;
    }
    setAdminName(parsed.name);
    setAuthChecked(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const fetchOrders = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/api/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (data.orders.length > lastCount && lastCount > 0) {
          const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-09a.mp3');
          audio.play().catch(() => {});
        }
        setLastCount(data.orders.length);
        setOrders(data.orders);
      }
    } catch (err) {}
    setLoading(false);
    if (showRefreshing) setTimeout(() => setRefreshing(false), 600);
  };

  useEffect(() => {
    if (!authChecked) return;
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 10000);
    return () => clearInterval(interval);
  }, [authChecked]);

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

  const ordersForDate = orders.filter(o => isSameDay(o.createdAt, selectedDate));
  const isToday = selectedDate === toDateString(new Date());

  const counts = {
    pending: ordersForDate.filter(o => o.status === 'pending').length,
    preparing: ordersForDate.filter(o => o.status === 'accepted' || o.status === 'preparing').length,
    ready: ordersForDate.filter(o => o.status === 'ready').length,
    completed: ordersForDate.filter(o => o.status === 'completed').length,
  };

  const revenueForDate = ordersForDate
    .filter(o => o.status !== 'rejected')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const filtered = filter === 'all'
    ? ordersForDate
    : ordersForDate.filter(o => o.status === filter);

  if (!authChecked) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b35', fontSize: 14, fontFamily: 'sans-serif' }}>
      Verifying access...
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      Loading orders...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', padding: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ff6b35' }}>🍽️ Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => fetchOrders(true)}
            style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, padding: '8px 16px', color: refreshing ? '#ff6b35' : '#888', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
          <button onClick={handleLogout}
            style={{ background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 10, padding: '8px 16px', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
        Welcome, {adminName} · Auto-refreshes every 10 seconds
      </p>

      {/* Date Picker */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' as const, position: 'relative' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#888' }}>📅 Viewing:</span>
          <button onClick={() => setShowCalendar(!showCalendar)}
            style={{ background: '#0a0a0a', border: '1px solid #ff6b3566', borderRadius: 10, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            📅 {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            <span style={{ color: '#ff6b35', fontSize: 10 }}>▼</span>
          </button>
        </div>

        {!isToday && (
          <button onClick={() => { setSelectedDate(toDateString(new Date())); setFilter('all'); setShowCalendar(false); }}
            style={{ background: '#ff6b3522', border: '1px solid #ff6b3544', borderRadius: 8, padding: '6px 12px', color: '#ff6b35', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Back to Today
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#555', background: '#111', borderRadius: 8, padding: '4px 10px' }}>
          {ordersForDate.length} orders on this day
        </span>

        {showCalendar && (
          <div style={{ position: 'absolute' as const, top: '100%', left: 0, marginTop: 8, background: '#1a1a1a', border: '1px solid #333', borderRadius: 16, padding: '16px', zIndex: 200, width: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <button
                onClick={() => { const d = new Date(calendarMonth + '-01'); d.setMonth(d.getMonth() - 1); setCalendarMonth(toDateString(d).slice(0,7)); }}
                style={{ background: '#111', border: '1px solid #333', borderRadius: 8, width: 32, height: 32, color: '#fff', fontSize: 16, cursor: 'pointer' }}>‹</button>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                {new Date(calendarMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => { const d = new Date(calendarMonth + '-01'); d.setMonth(d.getMonth() + 1); const next = toDateString(d).slice(0,7); if (next <= toDateString(new Date()).slice(0,7)) setCalendarMonth(next); }}
                style={{ background: '#111', border: '1px solid #333', borderRadius: 8, width: 32, height: 32, color: '#fff', fontSize: 16, cursor: 'pointer' }}>›</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#555', fontWeight: 600, padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {(() => {
                const year = parseInt(calendarMonth.split('-')[0]);
                const month = parseInt(calendarMonth.split('-')[1]) - 1;
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const today = toDateString(new Date());
                const cells = [];
                for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);
                for (let d = 1; d <= daysInMonth; d++) {
                  const dateStr = `${calendarMonth}-${String(d).padStart(2,'0')}`;
                  const isSelected = dateStr === selectedDate;
                  const isTodayCell = dateStr === today;
                  const isFuture = dateStr > today;
                  const hasOrders = orders.some(o => isSameDay(o.createdAt, dateStr));
                  cells.push(
                    <button key={d} disabled={isFuture}
                      onClick={() => { if (!isFuture) { setSelectedDate(dateStr); setFilter('all'); setShowCalendar(false); } }}
                      style={{ width: '100%', aspectRatio: '1', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: isSelected || isTodayCell ? 700 : 400, cursor: isFuture ? 'not-allowed' : 'pointer', position: 'relative' as const, background: isSelected ? '#ff6b35' : isTodayCell ? '#2a1500' : 'transparent', color: isSelected ? '#fff' : isFuture ? '#333' : '#ccc', outline: isTodayCell && !isSelected ? '1px solid #ff6b3566' : 'none' }}>
                      {d}
                      {hasOrders && !isSelected && (
                        <div style={{ position: 'absolute' as const, bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#ff6b35' }} />
                      )}
                    </button>
                  );
                }
                return cells;
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Pending', value: counts.pending, color: '#f59e0b' },
          { label: 'Preparing', value: counts.preparing, color: '#8b5cf6' },
          { label: 'Ready', value: counts.ready, color: '#22c55e' },
          { label: isToday ? "Today's Revenue" : "Day's Revenue", value: `₹${revenueForDate}`, color: '#ff6b35' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#1a1a1a', borderRadius: 12, padding: '16px 12px', textAlign: 'center', border: '1px solid #2a2a2a' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' as const }}>
        {['all', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0, background: filter === f ? '#ff6b35' : 'transparent', borderColor: filter === f ? '#ff6b35' : '#333', color: filter === f ? '#fff' : '#888', textTransform: 'capitalize' as const }}>
            {f} {f === 'pending' && counts.pending > 0 ? `(${counts.pending})` : ''}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#444', padding: '60px 0', fontSize: 14 }}>
          {ordersForDate.length === 0 ? `No orders on ${selectedDate}` : 'No orders for this filter'}
        </div>
      ) : (
        filtered.map(order => (
          <div key={order._id} style={{ background: '#1a1a1a', borderRadius: 16, padding: '16px 20px', marginBottom: 12, border: `1px solid ${order.status === 'pending' ? '#f59e0b44' : '#2a2a2a'}` }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#ff6b35' }}>#{order.tokenNumber}</span>
                <span style={{ fontSize: 12, color: '#666', marginLeft: 10 }}>
                  {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <span style={{ background: statusColors[order.status] + '22', color: statusColors[order.status], padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const }}>
                {order.status}
              </span>
            </div>

            <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
              👤 {order.student?.name || 'Student'} • {order.student?.rollNumber || order.student?.email || ''}
            </div>

            <div style={{ marginBottom: 12 }}>
              {order.items?.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#ccc', marginBottom: 4 }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: '#888' }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#ff9a3c' }}>₹{order.totalAmount}</span>
            </div>

            {isToday && order.status !== 'completed' && order.status !== 'rejected' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => updateStatus(order._id, statusNext[order.status])}
                  style={{ flex: 1, padding: '10px', background: '#ff6b35', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  ✅ {statusLabel[order.status]}
                </button>
                {order.status === 'pending' && (
                  <button onClick={() => rejectOrder(order._id)}
                    style={{ padding: '10px 16px', background: '#1a1a1a', border: '1px solid #ef4444', borderRadius: 10, color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    ❌ Reject
                  </button>
                )}
              </div>
            )}

            {!isToday && (
              <div style={{ fontSize: 11, color: '#444', textAlign: 'center', padding: '6px', background: '#111', borderRadius: 8 }}>
                Past order — view only
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}