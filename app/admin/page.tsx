"use client";
import { useState } from "react";
import { Check, X, Clock, TrendingUp, ShoppingBag, IndianRupee, ChefHat, Bell, RefreshCw, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type OrderStatus = "Pending" | "Preparing" | "Ready" | "Completed";

type Order = {
  id: string;
  student: string;
  rollNo: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  time: string;
  status: OrderStatus;
};

const INITIAL_ORDERS: Order[] = [
  { id: "NM041", student: "Arjun Sharma", rollNo: "21BCE1234", items: [{ name: "Chicken Biryani", qty: 1, price: 120 }, { name: "Cold Coffee", qty: 1, price: 50 }], total: 170, time: "12:38 PM", status: "Pending" },
  { id: "NM040", student: "Priya Singh", rollNo: "21BCE5678", items: [{ name: "Paneer Butter Masala", qty: 2, price: 90 }], total: 180, time: "12:35 PM", status: "Preparing" },
  { id: "NM039", student: "Rahul Verma", rollNo: "21BCE9012", items: [{ name: "Masala Dosa", qty: 1, price: 60 }, { name: "Gulab Jamun", qty: 1, price: 40 }], total: 100, time: "12:30 PM", status: "Ready" },
  { id: "NM038", student: "Sneha Patel", rollNo: "21BCE3456", items: [{ name: "Veg Fried Rice", qty: 2, price: 70 }], total: 140, time: "12:22 PM", status: "Completed" },
];

const STATUS_FLOW: OrderStatus[] = ["Pending", "Preparing", "Ready", "Completed"];

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  Pending:   { bg: "#2a1a00", text: "#f59e0b", border: "#3a2800" },
  Preparing: { bg: "#001a2a", text: "#38bdf8", border: "#002a3a" },
  Ready:     { bg: "#001a00", text: "#22c55e", border: "#002a00" },
  Completed: { bg: "#1a1a1a", text: "#666",    border: "#222" },
};

const STATUS_ICONS: Record<OrderStatus, string> = {
  Pending: "⏳", Preparing: "👨‍🍳", Ready: "✅", Completed: "🎉",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<"orders" | "analytics">("orders");
  const [filter, setFilter] = useState<OrderStatus | "All">("All");

  const advance = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const idx = STATUS_FLOW.indexOf(o.status);
      if (idx < STATUS_FLOW.length - 1) return { ...o, status: STATUS_FLOW[idx + 1] };
      return o;
    }));
  };

  const reject = (id: string) => setOrders(prev => prev.filter(o => o.id !== id));

  const filtered = orders.filter(o => filter === "All" || o.status === filter);
  const todayEarnings = orders.filter(o => o.status === "Completed").reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const preparingCount = orders.filter(o => o.status === "Preparing").length;
  const readyCount = orders.filter(o => o.status === "Ready").length;

  const nextAction: Record<OrderStatus, string> = {
    Pending: "Accept", Preparing: "Mark Ready", Ready: "Complete", Completed: ""
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1a1a1a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg, #ff6b35, #ff9a3c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Night Mess — Admin
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 1 }}>Mess Counter Dashboard</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {pendingCount > 0 && (
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ background: "#f59e0b", color: "#000", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <Bell size={12} /> {pendingCount} New
            </motion.div>
          )}
          <button style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: "8px 14px", color: "#888", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 16px" }}>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Today's Revenue", value: `₹${todayEarnings}`, icon: <IndianRupee size={16} />, color: "#22c55e" },
            { label: "Pending", value: pendingCount, icon: <Clock size={16} />, color: "#f59e0b" },
            { label: "Preparing", value: preparingCount, icon: <ChefHat size={16} />, color: "#38bdf8" },
            { label: "Ready", value: readyCount, icon: <ShoppingBag size={16} />, color: "#a78bfa" },
          ].map((stat, i) => (
            <div key={i} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, padding: "14px 12px" }}>
              <div style={{ color: stat.color, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "#555" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#111", borderRadius: 14, padding: 4, marginBottom: 20, border: "1px solid #1a1a1a" }}>
          {(["orders", "analytics"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize", transition: "all 0.2s",
                background: activeTab === tab ? "#ff6b35" : "transparent",
                color: activeTab === tab ? "#fff" : "#666" }}>
              {tab === "orders" ? "📋 Live Orders" : "📊 Analytics"}
            </button>
          ))}
        </div>

        {activeTab === "orders" && (
          <>
            {/* Filter Pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              {(["All", ...STATUS_FLOW] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "1px solid", fontSize: 12, fontWeight: 500, cursor: "pointer",
                    background: filter === s ? "#ff6b35" : "transparent",
                    borderColor: filter === s ? "#ff6b35" : "#222",
                    color: filter === s ? "#fff" : "#666" }}>
                  {s === "All" ? "All Orders" : `${STATUS_ICONS[s]} ${s}`}
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <AnimatePresence>
                {filtered.map(order => {
                  const sc = STATUS_COLORS[order.status];
                  return (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                      style={{ background: "#111", border: `1px solid ${sc.border}`, borderRadius: 18, padding: "16px 18px" }}>
                      {/* Order Header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "6px 10px", fontSize: 13, fontWeight: 700, color: "#ff9a3c" }}>#{order.id}</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>{order.student}</div>
                            <div style={{ fontSize: 11, color: "#555" }}>{order.rollNo} · {order.time}</div>
                          </div>
                        </div>
                        <div style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 10, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: sc.text }}>
                          {STATUS_ICONS[order.status]} {order.status}
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ background: "#0d0d0d", borderRadius: 12, padding: "10px 12px", marginBottom: 12 }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", padding: "3px 0" }}>
                            <span>{item.name} × {item.qty}</span>
                            <span>₹{item.price * item.qty}</span>
                          </div>
                        ))}
                        <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                          <span>Total</span><span style={{ color: "#ff9a3c" }}>₹{order.total}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {order.status !== "Completed" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => advance(order.id)}
                            style={{ flex: 1, background: "linear-gradient(135deg, #ff6b35, #ff9a3c)", border: "none", borderRadius: 12, padding: "11px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <Check size={15} /> {nextAction[order.status]}
                          </button>
                          {order.status === "Pending" && (
                            <button onClick={() => reject(order.id)}
                              style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: 12, padding: "11px 16px", color: "#ef4444", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                              <X size={15} /> Reject
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filtered.length === 0 && (
                <div style={{ textAlign: "center", color: "#333", padding: "60px 0", fontSize: 14 }}>
                  No {filter === "All" ? "" : filter.toLowerCase()} orders right now
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Peak Hours */}
            <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 18, padding: "18px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp size={16} color="#ff6b35" /> Peak Hours Today
              </div>
              {[
                { hour: "8 PM", orders: 42, pct: 100 },
                { hour: "9 PM", orders: 38, pct: 90 },
                { hour: "7 PM", orders: 28, pct: 67 },
                { hour: "10 PM", orders: 18, pct: 43 },
                { hour: "11 PM", orders: 8, pct: 19 },
              ].map((h, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 5 }}>
                    <span>{h.hour}</span><span>{h.orders} orders</span>
                  </div>
                  <div style={{ background: "#1a1a1a", borderRadius: 6, height: 8, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${h.pct}%` }} transition={{ delay: i * 0.1, duration: 0.6 }}
                      style={{ height: "100%", background: "linear-gradient(90deg, #ff6b35, #ff9a3c)", borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Most Ordered */}
            <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 18, padding: "18px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Flame size={16} color="#ff6b35" /> Most Ordered Today
              </div>
              {[
                { name: "Chicken Biryani", count: 34, emoji: "🍛" },
                { name: "Paneer Butter Masala", count: 28, emoji: "🧆" },
                { name: "Masala Dosa", count: 22, emoji: "🫓" },
                { name: "Gulab Jamun", count: 19, emoji: "🍮" },
                { name: "Cold Coffee", count: 15, emoji: "☕" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 4 ? "1px solid #141414" : "none" }}>
                  <span style={{ fontSize: 24 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#555" }}>{item.count} orders</div>
                  </div>
                  <div style={{ background: i === 0 ? "#ff6b35" : "#1a1a1a", color: i === 0 ? "#fff" : "#666", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
                    #{i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}
