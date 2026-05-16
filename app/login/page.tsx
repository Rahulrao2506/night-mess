"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Utensils } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", rollNo: "", password: "" });
  const [error, setError] = useState("");

  const handle = async () => {
    if (!form.email || !form.password) { setError("Please fill all fields"); return; }
    if (!isLogin && !form.rollNo) { setError("Roll number is required"); return; }
    setLoading(true);
    setError("");
    // Simulate auth — replace with real API later
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    // Store basic user info
    localStorage.setItem("nm_user", JSON.stringify({ name: form.name || "Rahul Yadav", email: form.email, rollNo: form.rollNo || "21BCE1234" }));
    router.push("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #ff6b35, #ff9a3c)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Utensils size={28} color="#fff" />
        </div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, background: "linear-gradient(135deg, #ff6b35, #ff9a3c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Night Mess
        </div>
        <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>VIT Hostel Food Ordering</div>
      </motion.div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ width: "100%", maxWidth: 380, background: "#111", border: "1px solid #1a1a1a", borderRadius: 24, padding: "28px 24px" }}>

        {/* Toggle */}
        <div style={{ display: "flex", background: "#0a0a0a", borderRadius: 14, padding: 4, marginBottom: 24 }}>
          {["Login", "Register"].map(t => (
            <button key={t} onClick={() => { setIsLogin(t === "Login"); setError(""); }}
              style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                background: (isLogin ? "Login" : "Register") === t ? "#ff6b35" : "transparent",
                color: (isLogin ? "Login" : "Register") === t ? "#fff" : "#555" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {!isLogin && (
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Full Name" style={inputStyle} />
          )}
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="Email or Roll Number" type="email" style={inputStyle} />
          {!isLogin && (
            <input value={form.rollNo} onChange={e => setForm({ ...form, rollNo: e.target.value })}
              placeholder="Roll Number (e.g. 21BCE1234)" style={inputStyle} />
          )}
          <div style={{ position: "relative" }}>
            <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Password" type={showPass ? "text" : "password"} style={{ ...inputStyle, paddingRight: 44 }} />
            <button onClick={() => setShowPass(!showPass)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer" }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 10, textAlign: "center" }}>{error}</div>}

        <button onClick={handle} disabled={loading}
          style={{ width: "100%", marginTop: 20, background: loading ? "#333" : "linear-gradient(135deg, #ff6b35, #ff9a3c)", border: "none", borderRadius: 14, padding: "15px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
          {loading ? "Please wait..." : isLogin ? "Login →" : "Create Account →"}
        </button>

        {isLogin && (
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#555" }}>
            Demo: use any email + password
          </div>
        )}
      </motion.div>

      {/* Admin link */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{ marginTop: 24, fontSize: 13, color: "#444" }}>
        Mess staff?{" "}
        <a href="/admin" style={{ color: "#ff6b35", textDecoration: "none", fontWeight: 600 }}>Admin Login →</a>
      </motion.div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0a0a0a",
  border: "1px solid #222",
  borderRadius: 12,
  padding: "13px 14px",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};
