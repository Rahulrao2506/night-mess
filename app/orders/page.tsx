"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Clock, QrCode, ArrowLeft } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { id: 1, label: "Order Placed",  desc: "Your order has been received",       icon: "📱" },
  { id: 2, label: "Accepted",      desc: "Mess has accepted your order",        icon: "✅" },
  { id: 3, label: "Preparing",     desc: "Your food is being prepared",         icon: "👨‍🍳" },
  { id: 4, label: "Ready",         desc: "Come to counter and scan QR",         icon: "🔔" },
  { id: 5, label: "Completed",     desc: "Enjoy your meal!",                    icon: "🎉" },
];

export default function OrderTracking() {
  const [currentStep, setCurrentStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(12 * 60); // 12 minutes in seconds

  // Auto-advance for demo
  useEffect(() => {
    if (currentStep >= 5) return;
    const t = setTimeout(() => setCurrentStep(s => s + 1), 6000);
    return () => clearTimeout(t);
  }, [currentStep]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || currentStep >= 4) return;
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, currentStep]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid #1a1a1a" }}>
        <Link href="/" style={{ color: "#888", display: "flex" }}><ArrowLeft size={20} /></Link>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>Order #NM042</div>
          <div style={{ fontSize: 12, color: "#555" }}>Placed at 12:40 PM</div>
        </div>
      </header>

      <div style={{ maxWidth: 420, margin: "0 auto", padding: "24px 20px" }}>

        {/* Timer */}
        {currentStep < 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: "linear-gradient(135deg, #1a0a00, #2a1200)", border: "1px solid #3a2000", borderRadius: 20, padding: "20px", textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Estimated wait time</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 48, fontWeight: 800, color: "#ff6b35", lineHeight: 1 }}>
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 8 }}>minutes remaining</div>
          </motion.div>
        )}

        {/* QR Code shown when Ready */}
        {currentStep >= 4 && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ background: "#fff", borderRadius: 20, padding: "24px", textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 80, marginBottom: 8 }}>
              <QrCode size={120} color="#0a0a0a" style={{ margin: "0 auto" }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0a0a0a" }}>Scan at Counter</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Token: NM042 · Valid once only</div>
          </motion.div>
        )}

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {STEPS.map((step, i) => {
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <div key={step.id} style={{ display: "flex", gap: 16, marginBottom: i < STEPS.length - 1 ? 0 : 0, position: "relative" }}>
                {/* Line */}
                {i < STEPS.length - 1 && (
                  <div style={{ position: "absolute", left: 16, top: 36, width: 2, height: 52, background: done ? "#ff6b35" : "#1a1a1a", transition: "background 0.5s" }} />
                )}

                {/* Icon */}
                <div style={{ flexShrink: 0, width: 34, height: 34, borderRadius: "50%", border: `2px solid ${done || active ? "#ff6b35" : "#222"}`, background: done ? "#ff6b35" : active ? "#2a1200" : "#111", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.5s", zIndex: 1 }}>
                  {done ? <CheckCircle size={16} color="#fff" fill="#ff6b35" /> : active ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}><Circle size={12} color="#ff6b35" /></motion.div> : <Circle size={12} color="#333" />}
                </div>

                {/* Content */}
                <div style={{ paddingBottom: 28, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: done || active ? 700 : 400, color: done || active ? "#fff" : "#444" }}>{step.label}</span>
                    <span style={{ fontSize: 16 }}>{step.icon}</span>
                  </div>
                  <div style={{ fontSize: 12, color: active ? "#888" : "#444" }}>{step.desc}</div>
                  {active && <div style={{ fontSize: 11, color: "#ff6b35", marginTop: 4, fontWeight: 600 }}>● In progress</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 18, padding: "16px 18px", marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#888" }}>ORDER SUMMARY</div>
          {[{ name: "Chicken Biryani", qty: 1, price: 120 }, { name: "Cold Coffee", qty: 1, price: 50 }].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #161616", color: "#ccc" }}>
              <span>{item.name} × {item.qty}</span>
              <span>₹{item.price}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, marginTop: 10, color: "#ff9a3c" }}>
            <span>Total Paid</span><span>₹170</span>
          </div>
        </div>

        <Link href="/" style={{ display: "block", textAlign: "center", marginTop: 20, color: "#555", fontSize: 13, textDecoration: "none" }}>
          ← Back to Menu
        </Link>
      </div>
    </div>
  );
}
