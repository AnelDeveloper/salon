"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CancelContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [booking, setBooking] = useState<{
    name: string; phone: string; email: string;
    service: string; price: string; day: string; time: string;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "confirming" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    if (!token) return;
    try {
      const data = JSON.parse(atob(token.replace(/-/g, "+").replace(/_/g, "/")));
      setBooking(data);
    } catch {
      setBooking(null);
    }
  }, [token]);

  const handleCancel = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, reason: reason.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (!token || !booking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf5ff", fontFamily: "Arial, sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width={28} height={28} fill="none" stroke="#ef4444" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1f2937", marginBottom: 8 }}>Nevazeci link</h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>Ovaj link za otkazivanje nije validan ili je istekao.</p>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf5ff", fontFamily: "Arial, sans-serif" }}>
        <div style={{ maxWidth: 440, textAlign: "center", padding: 40 }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 24px rgba(34,197,94,0.3)" }}>
            <svg width={36} height={36} fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#15803d", marginBottom: 12 }}>Termin uspjesno otkazan</h1>
          <p style={{ color: "#16a34a", fontSize: 15, marginBottom: 8 }}>
            Vas termin za <strong>{booking.service}</strong> dana <strong>{booking.day}</strong> u <strong>{booking.time}</strong> je otkazan.
          </p>
          <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 28 }}>Potvrda otkazivanja je poslana na vas email.</p>
          <a href="/" style={{
            display: "inline-block", background: "linear-gradient(135deg, #9333ea, #7c3aed)", color: "#fff",
            padding: "14px 32px", borderRadius: 14, fontWeight: 700, fontSize: 15, textDecoration: "none",
            boxShadow: "0 6px 20px rgba(147,51,234,0.3)",
          }}>Nazad na stranicu</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf5ff", fontFamily: "Arial, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 480, width: "100%", background: "#fff", borderRadius: 28, padding: "40px 32px", boxShadow: "0 16px 48px rgba(0,0,0,0.08)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #fef3c7, #fde68a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 6px 20px rgba(251,191,36,0.25)" }}>
            <svg width={28} height={28} fill="none" stroke="#d97706" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1f2937", marginBottom: 8 }}>Otkazivanje termina</h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>Da li ste sigurni da zelite otkazati ovaj termin?</p>
        </div>

        {/* Booking details */}
        <div style={{ background: "#faf5ff", borderRadius: 16, padding: "18px 20px", marginBottom: 24, border: "1px solid #f3e8ff" }}>
          {[
            ["Klijent", booking.name],
            ["Usluga", booking.service],
            ["Cijena", booking.price],
            ["Dan", booking.day],
            ["Termin", booking.time],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
              <span style={{ color: "#9ca3af" }}>{l}</span>
              <span style={{ fontWeight: 700, color: l === "Cijena" ? "#9333ea" : "#374151" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <p style={{ color: "#92400e", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            <strong>Napomena:</strong> Ukoliko otkazujete manje od 24h prije termina, pri sljedecem zakazivanju bit ce potrebna avansna uplata.
          </p>
        </div>

        {/* Reason (optional) */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4b5563", marginBottom: 7 }}>
            Razlog otkazivanja <span style={{ color: "#d1d5db", fontSize: 11, fontWeight: 400 }}>(opcionalno)</span>
          </label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Npr. promjena planova, bolest..."
            rows={3}
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 13, fontSize: 14,
              border: "1.5px solid #e5e7eb", background: "#fafafa", outline: "none",
              boxSizing: "border-box", resize: "vertical", fontFamily: "inherit",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#c084fc"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(192,132,252,0.12)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {status === "error" && (
          <p style={{ color: "#ef4444", fontSize: 13, fontWeight: 600, marginBottom: 16, textAlign: "center" }}>
            Doslo je do greske. Pokusajte ponovo ili nas kontaktirajte na +387 62 123 701.
          </p>
        )}

        {/* Buttons */}
        {status === "confirming" ? (
          <div>
            <p style={{ textAlign: "center", color: "#ef4444", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
              Jeste li sigurni? Ova radnja se ne moze ponistiti.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStatus("idle")} style={{
                flex: 1, padding: "14px 0", borderRadius: 14, border: "2px solid #e5e7eb", background: "#fff",
                color: "#6b7280", fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>Ne, zadrzi termin</button>
              <button onClick={handleCancel} style={{
                flex: 1, padding: "14px 0", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                boxShadow: "0 6px 20px rgba(239,68,68,0.3)",
              }}>Da, otkazi</button>
            </div>
          </div>
        ) : status === "sending" ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <p style={{ color: "#9333ea", fontWeight: 600, fontSize: 15 }}>Otkazivanje u toku...</p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <a href="/" style={{
              flex: 1, padding: "14px 0", borderRadius: 14, border: "2px solid #e5e7eb", background: "#fff",
              color: "#6b7280", fontWeight: 700, fontSize: 14, textDecoration: "none", textAlign: "center",
              display: "block",
            }}>Nazad</a>
            <button onClick={() => setStatus("confirming")} style={{
              flex: 1, padding: "14px 0", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              boxShadow: "0 6px 20px rgba(239,68,68,0.3)",
            }}>Otkazi termin</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf5ff" }}>
        <p style={{ color: "#9ca3af", fontSize: 15 }}>Ucitavanje...</p>
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}
