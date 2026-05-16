"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Star, Clock, Flame, Search, X, Plus, Minus, Bell, ChevronRight, Zap, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MENU_ITEMS = [
  { id: 1, name: "Chicken Biryani", price: 120, rating: 4.8, time: 15, category: "Main Course", popular: true, stock: true, emoji: "🍛", desc: "Aromatic basmati rice with tender chicken and exotic spices" },
  { id: 2, name: "Paneer Butter Masala", price: 90, rating: 4.6, time: 12, category: "Main Course", popular: true, stock: true, emoji: "🧆", desc: "Rich and creamy paneer curry with butter and tomatoes" },
  { id: 3, name: "Veg Fried Rice", price: 70, rating: 4.4, time: 10, category: "Main Course", popular: false, stock: true, emoji: "🍚", desc: "Stir-fried rice with mixed vegetables and soy sauce" },
  { id: 4, name: "Masala Dosa", price: 60, rating: 4.7, time: 8, category: "Starters", popular: true, stock: true, emoji: "🫓", desc: "Crispy rice crepe stuffed with spiced potato filling" },
  { id: 5, name: "Samosa (2pcs)", price: 30, rating: 4.3, time: 5, category: "Snacks", popular: false, stock: true, emoji: "🥟", desc: "Golden fried pastry filled with spiced potatoes and peas" },
  { id: 6, name: "Gulab Jamun", price: 40, rating: 4.9, time: 3, category: "Desserts", popular: true, stock: true, emoji: "🍮", desc: "Soft milk dumplings soaked in rose-flavoured sugar syrup" },
  { id: 7, name: "Chole Bhature", price: 80, rating: 4.5, time: 12, category: "Main Course", popular: false, stock: false, emoji: "🫔", desc: "Spicy chickpea curry served with deep-fried bread" },
  { id: 8, name: "Cold Coffee", price: 50, rating: 4.6, time: 4, category: "Snacks", popular: false, stock: true, emoji: "☕", desc: "Chilled blended coffee with milk and ice cream" },
];

const CATEGORIES = ["All", "Main Course", "Starters", "Snacks", "Desserts"];

type CartItem = { id: number; name: string; price: number; emoji: string; qty: number };

export default function NightMess() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [user, setUser] = useState<any>(null);
  const [crowdLevel, setCrowdLevel] = useState<"Low" | "Medium" | "High">("Low");
  const [waitTime, setWaitTime] = useState(12);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [orderToken, setOrderToken] = useState("");

  const API = 'https://night-mess-api.onrender.com';

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      // AI Rush Predictor — based on time of day
      const hour = now.getHours();
      if ((hour >= 20 && hour <= 22) || (hour >= 7 && hour <= 9)) {
        setCrowdLevel("High");
        setWaitTime(25);
      } else if ((hour >= 19 && hour < 20) || (hour >= 9 && hour <= 11)) {
        setCrowdLevel("Medium");
        setWaitTime(15);
      } else {
        setCrowdLevel("Low");
        setWaitTime(8);
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Poll for order status notifications every 15 seconds
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const checkOrders = async () => {
      try {
        const res = await fetch(`${API}/api/orders/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.orders) {
          data.orders.forEach((order: any) => {
            if (order.status === 'ready') {
              const msg = `🎉 Token #${order.tokenNumber} is READY for pickup!`;
              setNotifications(prev =>
                prev.includes(msg) ? prev : [msg, ...prev]
              );
            }
          });
        }
      } catch (err) {}
    };

    checkOrders();
    const interval = setInterval(checkOrders, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const filtered = MENU_ITEMS.filter(item =>
    (category === "All" || item.category === category) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item: typeof MENU_ITEMS[0]) => {
    if (!item.stock) return;
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, emoji: item.emoji, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing && existing.qty > 1) return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
      return prev.filter(c => c.id !== id);
    });
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const crowdColor = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" }[crowdLevel];

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const items = cart.map(c => ({
        name: c.name,
        price: c.price,
        quantity: c.qty,
        prepTime: MENU_ITEMS.find(m => m.id === c.id)?.time || 10
      }));

      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items, totalAmount: cartTotal })
      });

      const data = await res.json();

      if (data.success) {
        setOrderToken(`#NM${data.order.tokenNumber}`);
        setOrderPlaced(true);
        setCart([]);
        setCartOpen(false);
        setTimeout(() => setOrderPlaced(false), 5000);
      } else {
        alert('Order failed: ' + data.message);
      }
    } catch (err) {
      alert('Network error placing order');
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header — no logout icon here, it's in the navbar from layout.tsx */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,10,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1a1a1a", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg, #ff6b35, #ff9a3c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🍽️ Night Mess
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 1 }}>
            Welcome back, {user?.name || 'Guest'} 👋
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 13, color: "#888", background: "#111", padding: "6px 12px", borderRadius: 20, border: "1px solid #222" }}>{currentTime}</div>
          
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ background: "none", border: "none", color: notifications.length > 0 ? "#ff6b35" : "#666", cursor: "pointer", position: 'relative' }}>
              <Bell size={20} />
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: '#ff6b35', borderRadius: '50%',
                  width: 16, height: 16, fontSize: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 'bold'
                }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute', right: 0, top: 32,
                background: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: 12, padding: 12, minWidth: 260,
                zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ff6b35', marginBottom: 8 }}>
                  Notifications
                </div>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: 12, color: '#666', padding: '8px 0' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} style={{
                      fontSize: 12, color: '#fff', padding: '8px 0',
                      borderBottom: i < notifications.length - 1 ? '1px solid #2a2a2a' : 'none'
                    }}>
                      {n}
                    </div>
                  ))
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    style={{ fontSize: 11, color: '#666', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }}>
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px 100px" }}>

        {/* Order Placed Toast */}
        <AnimatePresence>
          {orderPlaced && (
            <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
              style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "#22c55e", color: "#fff", padding: "14px 24px", borderRadius: 16, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(34,197,94,0.4)", whiteSpace: "nowrap" }}>
              🎉 Order placed! Your token is {orderToken}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Rush Predictor */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ margin: "20px 0 16px", background: "linear-gradient(135deg, #1a0a00, #2a1200)", border: "1px solid #3a2000", borderRadius: 18, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,107,53,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendingUp size={22} color="#ff6b35" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ff9a3c", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={12} /> AI Rush Predictor
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>
              Crowd level: <span style={{ color: crowdColor, fontWeight: 700 }}>{crowdLevel}</span>
              <span style={{ margin: "0 8px", color: "#333" }}>|</span>
              Wait: <span style={{ color: "#fff", fontWeight: 600 }}>~{waitTime} mins</span>
            </div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: crowdColor, boxShadow: `0 0 8px ${crowdColor}`, animation: "pulse 2s infinite" }} />
        </motion.div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#555" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for food items..."
            style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 14, padding: "12px 14px 12px 40px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer" }}><X size={14} /></button>}
        </div>

        {/* Categories */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 20, scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "1px solid", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                background: category === cat ? "#ff6b35" : "transparent",
                borderColor: category === cat ? "#ff6b35" : "#222",
                color: category === cat ? "#fff" : "#888" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <AnimatePresence>
            {filtered.map((item, i) => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 18, overflow: "hidden", position: "relative", opacity: item.stock ? 1 : 0.5 }}>
                  <div style={{ background: "#161616", height: 90, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, position: "relative" }}>
                    {item.emoji}
                    {item.popular && (
                      <div style={{ position: "absolute", top: 8, right: 8, background: "#ff6b35", borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 3 }}>
                        <Flame size={8} /> HOT
                      </div>
                    )}
                    {!item.stock && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#ef4444" }}>OUT OF STOCK</div>
                    )}
                  </div>
                  <div style={{ padding: "12px 12px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#f59e0b" }}>
                        <Star size={10} fill="#f59e0b" /> {item.rating}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#666" }}>
                        <Clock size={10} /> {item.time}m
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#ff9a3c" }}>₹{item.price}</span>
                      {item.stock && (
                        inCart ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#1a1a1a", borderRadius: 10, padding: "4px 8px" }}>
                            <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "#ff6b35", cursor: "pointer", display: "flex" }}><Minus size={12} /></button>
                            <span style={{ fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: "center" }}>{inCart.qty}</span>
                            <button onClick={() => addToCart(item)} style={{ background: "none", border: "none", color: "#ff6b35", cursor: "pointer", display: "flex" }}><Plus size={12} /></button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(item)}
                            style={{ background: "#ff6b35", border: "none", borderRadius: 10, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                            <Plus size={14} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#444", padding: "60px 0", fontSize: 14 }}>
            No items found for "{search}"
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.button initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            onClick={() => setCartOpen(true)}
            style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #ff6b35, #ff9a3c)", border: "none", borderRadius: 20, padding: "14px 28px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(255,107,53,0.5)", zIndex: 40, whiteSpace: "nowrap" }}>
            <ShoppingCart size={18} />
            {cartCount} item{cartCount > 1 ? "s" : ""} · ₹{cartTotal}
            <ChevronRight size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, backdropFilter: "blur(4px)" }} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#111", borderRadius: "24px 24px 0 0", zIndex: 60, padding: "24px 20px 40px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800 }}>Your Order</div>
                <button onClick={() => setCartOpen(false)} style={{ background: "#1a1a1a", border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#888" }}><X size={16} /></button>
              </div>

              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, background: "#161616", borderRadius: 14, padding: "12px 14px" }}>
                  <span style={{ fontSize: 28 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "#ff9a3c", marginTop: 2 }}>₹{item.price} each</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: "#222", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ff6b35" }}><Minus size={12} /></button>
                    <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => addToCart(MENU_ITEMS.find(m => m.id === item.id)!)} style={{ background: "#ff6b35", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><Plus size={12} /></button>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, minWidth: 50, textAlign: "right" }}>₹{item.price * item.qty}</div>
                </div>
              ))}

              <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 8, paddingTop: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 8 }}>
                  <span>Subtotal</span><span>₹{cartTotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700 }}>
                  <span>Total</span><span style={{ color: "#ff9a3c" }}>₹{cartTotal}</span>
                </div>
              </div>

              <button onClick={placeOrder}
                style={{ width: "100%", background: "linear-gradient(135deg, #ff6b35, #ff9a3c)", border: "none", borderRadius: 16, padding: "16px", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                Place Order · ₹{cartTotal} <ChevronRight size={18} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        input::placeholder { color: #444; }
      `}</style>
    </div>
  );
}