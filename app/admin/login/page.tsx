"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

const ADMIN_CREDENTIALS = [
  { username: "admin", password: "nightmess@2024", name: "Head Admin" },
  { username: "mess_owner", password: "owner@vit2024", name: "Mess Owner" },
  { username: "counter1", password: "counter@123", name: "Counter Staff" },
];

export default function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.username || !form.password) { setError("Both fields are required"); return; }
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    const match = ADMIN_CREDENTIALS.find(c => c.username === form.username && c.password === form.password);
    if (match) {
      localStorage.setItem("nm_admin", JSON.stringify({
        username: match.username,
        name: match.name,
        role: "admin",
        loginTime: new Date().toISOString(),
      }));
      window.location.href = "/admin";
    } else {
      setError("Invalid username or password");
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "1px solid #333", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <ShieldCheck size={28} color="#ff6b35" />
        </div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #ff6b35, #ff9a3c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Admin Panel</div>
        <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>Night Mess — Staff Access Only</div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ width: "100%", maxWidth: 380, background: "#111", border: "1px solid #1a1a1a", borderRadius: 24, padding: "28px 24px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>Username</div>
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} onKeyDown={handleKeyDown} placeholder="Enter admin username"
            style={{ width: "100%", background: "#0a0a0a", border: "1px solid #222", borderRadius: 12, padding: "13px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>Password</div>
          <div style={{ position: "relative" }}>
            <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={handleKeyDown} placeholder="Enter admin password" type={showPass ? "text" : "password"}
              style={{ width: "100%", background: "#0a0a0a", border: "1px solid #222", borderRadius: 12, padding: "13px 44px 13px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer" }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        {error && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ fontSize: 13, color: "#ef4444", background: "#1a0000", border: "1px solid #3a0000", borderRadius: 10, padding: "10px 14px", marginTop: 12 }}>{error}</motion.div>}
        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", marginTop: 20, background: loading ? "#1a1a1a" : "linear-gradient(135deg, #ff6b35, #ff9a3c)", border: loading ? "1px solid #333" : "none", borderRadius: 14, padding: "15px", color: loading ? "#555" : "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <ShieldCheck size={17} />
          {loading ? "Verifying..." : "Login to Admin Panel"}
        </button>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#333", background: "#0d0d0d", borderRadius: 10, padding: "10px 14px" }}>
          Students go to <a href="/login" style={{ color: "#ff6b35", textDecoration: "none" }}>/login</a>
        </div>
      </motion.div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder { color: #333; }`}</style>
    </div>
  );
}