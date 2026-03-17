"use client";

import { useState, useEffect } from "react";

/* ───────── TYPES ───────── */
interface TimeSlot {
  time: string;
  booked: boolean;
}

interface DaySchedule {
  date: string;
  label: string;
  dayName: string;
  dayNum: string;
  month: string;
  slots: TimeSlot[];
}

/* ───────── DATA ───────── */
const MONTHS = [
  "januar","februar","mart","april","maj","juni",
  "juli","august","septembar","oktobar","novembar","decembar",
];
const DAYS = ["Ned","Pon","Uto","Sri","Čet","Pet","Sub"];
const DAYS_FULL = ["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"];

function generateSchedule(): DaySchedule[] {
  const days: DaySchedule[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() === 0) continue;

    const slots: TimeSlot[] = [];
    const end = d.getDay() === 6 ? 15 : 18;
    for (let h = 9; h < end; h++) {
      slots.push({ time: `${h.toString().padStart(2,"0")}:00`, booked: Math.random() < 0.35 });
      slots.push({ time: `${h.toString().padStart(2,"0")}:30`, booked: Math.random() < 0.3 });
    }

    const num = d.getDate().toString();
    const mon = MONTHS[d.getMonth()];
    days.push({
      date: d.toISOString().split("T")[0],
      label: `${DAYS_FULL[d.getDay()]}, ${num}. ${mon}`,
      dayName: DAYS[d.getDay()],
      dayNum: num,
      month: mon.substring(0, 3),
      slots,
    });
  }
  return days;
}

const services = [
  { name: "Muško šišanje", price: "15 KM", duration: "30 min", icon: "✂️" },
  { name: "Žensko šišanje", price: "25 KM", duration: "45 min", icon: "💇‍♀️" },
  { name: "Farbanje kose", price: "40 KM", duration: "90 min", icon: "🎨" },
  { name: "Pranje i feniranje", price: "15 KM", duration: "30 min", icon: "💆‍♀️" },
  { name: "Šišanje + brada", price: "20 KM", duration: "45 min", icon: "🪒" },
  { name: "Styling / frizura", price: "30 KM", duration: "60 min", icon: "💅" },
];

/* ───────── COMPONENT ───────── */
export default function Home() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => { setSchedule(generateSchedule()); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Ime je obavezno";
    if (!phone.trim()) errs.phone = "Broj telefona je obavezan";
    else if (!/^\+387\d{8,9}$/.test(phone.replace(/\s/g, "")))
      errs.phone = "Unesite validan +387 broj (npr. +387 61 123 456)";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Unesite validnu email adresu";
    if (!selectedService) errs.service = "Odaberite uslugu";
    if (!selectedSlot) errs.slot = "Odaberite termin";
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* ═══════ NAVBAR ═══════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #f3e8ff",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
            <a href="#hero" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{
                width: 36, height: 36, background: "#9333ea", borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 18,
              }}>A</div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#1f1f1f" }}>
                Salon <span style={{ color: "#9333ea" }}>Anel</span>
              </span>
            </a>
            {/* Desktop nav */}
            <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {[["Početna","#hero"],["Usluge","#usluge"],["O nama","#onama"],["Zakazivanje","#booking"],["Kontakt","#kontakt"]].map(([l,h]) => (
                <a key={l} href={h} style={{
                  padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                  color: "#6b7280", textDecoration: "none", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#faf5ff"; e.currentTarget.style.color = "#9333ea"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                >{l}</a>
              ))}
              <a href="#booking" style={{
                marginLeft: 12, background: "#9333ea", color: "#fff", padding: "8px 20px",
                borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none",
              }}>Zakaži termin</a>
            </div>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="mobile-menu-btn"
              style={{
                display: "none", background: "none", border: "none", cursor: "pointer",
                padding: 8, color: "#6b7280",
              }}
            >
              <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenu
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
          {mobileMenu && (
            <div style={{ paddingBottom: 16 }}>
              {[["Početna","#hero"],["Usluge","#usluge"],["O nama","#onama"],["Zakazivanje","#booking"],["Kontakt","#kontakt"]].map(([l,h]) => (
                <a key={l} href={h} onClick={() => setMobileMenu(false)} style={{
                  display: "block", padding: "10px 12px", color: "#6b7280",
                  textDecoration: "none", fontSize: 14, fontWeight: 500,
                }}>{l}</a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ═══════ RESPONSIVE STYLES ═══════ */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-card { display: none !important; }
          .services-grid { grid-template-columns: 1fr 1fr !important; }
          .about-grid { grid-template-columns: 1fr !important; }
          .booking-grid { grid-template-columns: 1fr !important; }
          .days-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .slots-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .service-pick-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .stats-flex { flex-wrap: wrap; gap: 20px !important; }
        }
        @media (max-width: 480px) {
          .services-grid { grid-template-columns: 1fr !important; }
          .service-pick-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ═══════ HERO ═══════ */}
      <section id="hero" style={{
        paddingTop: 64, background: "linear-gradient(135deg, #faf5ff 0%, #ffffff 40%, #f3e8ff 100%)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 100px" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            {/* Left */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#f3e8ff", color: "#7e22ce", padding: "6px 16px",
                borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24,
              }}>
                <span style={{ width: 8, height: 8, background: "#9333ea", borderRadius: "50%", display: "inline-block" }} />
                Zakazivanje termina dostupno
              </div>

              <h1 style={{ fontSize: 52, fontWeight: 800, color: "#111827", lineHeight: 1.1, marginBottom: 20 }}>
                Frizerski Salon<br />
                <span style={{ color: "#9333ea" }}>Anel</span>
              </h1>

              <p style={{ fontSize: 17, color: "#6b7280", lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
                Profesionalne frizerske usluge u ugodnom ambijentu. Vaša ljepota
                je naš prioritet. Zakazite termin online brzo i jednostavno.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
                <a href="#booking" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#9333ea", color: "#fff", padding: "14px 28px",
                  borderRadius: 12, fontWeight: 600, fontSize: 15, textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(147,51,234,0.3)",
                }}>
                  Zakaži termin
                  <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a href="#usluge" style={{
                  display: "inline-flex", alignItems: "center",
                  border: "2px solid #e9d5ff", color: "#7e22ce", padding: "14px 28px",
                  borderRadius: 12, fontWeight: 600, fontSize: 15, textDecoration: "none",
                }}>
                  Naše usluge
                </a>
              </div>

              <div className="stats-flex" style={{ display: "flex", gap: 40 }}>
                {[["500+","Klijenata"],["5+","God. iskustva"],["4.9","Ocjena"]].map(([n,l]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "#9333ea" }}>{n}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Card */}
            <div className="hero-card" style={{ display: "flex", justifyContent: "center" }}>
              <div style={{
                width: "100%", maxWidth: 380, background: "#fff",
                borderRadius: 20, overflow: "hidden",
                boxShadow: "0 20px 60px rgba(147,51,234,0.15)",
              }}>
                <div style={{
                  background: "linear-gradient(135deg, #9333ea, #7e22ce)",
                  padding: 24, color: "#fff",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 48, height: 48, background: "rgba(255,255,255,0.2)",
                      borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 24,
                    }}>✂️</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 18 }}>Salon Anel</p>
                      <p style={{ fontSize: 13, opacity: 0.8 }}>Profesionalna njega kose</p>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  {[["Pon - Pet","09:00 - 18:00","#9333ea"],["Subota","09:00 - 15:00","#9333ea"],["Nedjelja","Zatvoreno","#ef4444"]].map(([d,t,c]) => (
                    <div key={d} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 0", borderBottom: "1px solid #f9fafb",
                    }}>
                      <span style={{ color: "#6b7280", fontSize: 14 }}>{d}</span>
                      <span style={{ color: c, fontWeight: 600, fontSize: 14 }}>{t}</span>
                    </div>
                  ))}
                  <div style={{
                    marginTop: 16, background: "#faf5ff", borderRadius: 14, padding: 16,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} width={18} height={18} viewBox="0 0 20 20" fill="#facc15">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span style={{ fontSize: 14, color: "#6b7280", marginLeft: 8, fontWeight: 500 }}>4.9/5</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>Bazirano na recenzijama klijenata</p>
                  </div>
                  <a href="#booking" style={{
                    display: "block", textAlign: "center", marginTop: 16,
                    background: "#9333ea", color: "#fff", padding: "12px 0",
                    borderRadius: 12, fontWeight: 600, fontSize: 14, textDecoration: "none",
                  }}>Zakaži termin online</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ USLUGE ═══════ */}
      <section id="usluge" style={{ padding: "80px 0", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: "#9333ea", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: 3, marginBottom: 8 }}>
              Šta nudimo
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", marginBottom: 12 }}>Naše usluge</h2>
            <div style={{ width: 60, height: 4, background: "#9333ea", borderRadius: 2, margin: "0 auto 16px" }} />
            <p style={{ color: "#9ca3af", maxWidth: 500, margin: "0 auto", fontSize: 15, lineHeight: 1.6 }}>
              Širok spektar profesionalnih frizerskih usluga za muškarce i žene uz kvalitetne proizvode.
            </p>
          </div>

          <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {services.map(s => (
              <div key={s.name} style={{
                background: "#fff", border: "1px solid #f3f4f6", borderRadius: 16,
                padding: 24, transition: "all 0.3s",
                cursor: "default",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#e9d5ff";
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(147,51,234,0.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#f3f4f6";
                e.currentTarget.style.boxShadow = "none";
              }}
              >
                <div style={{
                  width: 56, height: 56, background: "#faf5ff", borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 16,
                }}>{s.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1f2937", marginBottom: 4 }}>{s.name}</h3>
                <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>Trajanje: {s.duration}</p>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingTop: 16, borderTop: "1px solid #f9fafb",
                }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#9333ea" }}>{s.price}</span>
                  <a href="#booking" style={{
                    fontSize: 13, color: "#a855f7", fontWeight: 600, textDecoration: "none",
                  }}>Zakaži →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ O NAMA ═══════ */}
      <section id="onama" style={{ padding: "80px 0", background: "#faf5ff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { n: "5+", l: "Godina iskustva", bg: "#fff", c: "#9333ea", lc: "#6b7280" },
                { n: "500+", l: "Zadovoljnih klijenata", bg: "#9333ea", c: "#fff", lc: "rgba(255,255,255,0.8)" },
                { n: "100%", l: "Posvećenost kvaliteti", bg: "#9333ea", c: "#fff", lc: "rgba(255,255,255,0.8)" },
                { n: "6", l: "Vrsta usluga", bg: "#fff", c: "#9333ea", lc: "#6b7280" },
              ].map(item => (
                <div key={item.l} style={{
                  background: item.bg, borderRadius: 20, padding: 32,
                  textAlign: "center",
                  border: item.bg === "#fff" ? "1px solid #f3e8ff" : "none",
                  boxShadow: item.bg !== "#fff" ? "0 8px 24px rgba(147,51,234,0.2)" : "none",
                }}>
                  <p style={{ fontSize: 36, fontWeight: 800, color: item.c, marginBottom: 4 }}>{item.n}</p>
                  <p style={{ fontSize: 13, color: item.lc }}>{item.l}</p>
                </div>
              ))}
            </div>

            {/* Text */}
            <div>
              <p style={{ color: "#9333ea", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: 3, marginBottom: 8 }}>
                O nama
              </p>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Vaša ljepota, naša strast</h2>
              <div style={{ width: 60, height: 4, background: "#9333ea", borderRadius: 2, marginBottom: 24 }} />
              <p style={{ color: "#6b7280", lineHeight: 1.7, marginBottom: 16, fontSize: 15 }}>
                Frizerski salon Anel je mjesto gdje se tradicija spaja sa
                modernim trendovima. Naš tim profesionalaca posvećen je tome da
                svaki klijent izađe sa osmijehom na licu.
              </p>
              <p style={{ color: "#6b7280", lineHeight: 1.7, marginBottom: 24, fontSize: 15 }}>
                Koristimo vrhunske proizvode i najnovije tehnike kako bismo vam
                pružili najbolji mogući rezultat.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Kvalitetni profesionalni proizvodi","Iskusni i certificirani frizeri","Ugodna i prijatna atmosfera","Online zakazivanje termina"].map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 24, height: 24, background: "#f3e8ff", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <svg width={14} height={14} fill="none" stroke="#9333ea" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span style={{ color: "#4b5563", fontSize: 14 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BOOKING ═══════ */}
      <section id="booking" style={{ padding: "80px 0", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: "#9333ea", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: 3, marginBottom: 8 }}>
              Rezervacija
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", marginBottom: 12 }}>Zakazite svoj termin</h2>
            <div style={{ width: 60, height: 4, background: "#9333ea", borderRadius: 2, margin: "0 auto 16px" }} />
            <p style={{ color: "#9ca3af", maxWidth: 500, margin: "0 auto", fontSize: 15 }}>
              Odaberite dan, termin i uslugu, te unesite vaše podatke. Kontaktirat ćemo vas za potvrdu.
            </p>
          </div>

          {submitted ? (
            <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: 48,
              }}>
                <div style={{
                  width: 64, height: 64, background: "#dcfce7", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <svg width={32} height={32} fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#15803d", marginBottom: 12 }}>
                  Termin je uspješno zakazan!
                </h3>
                <p style={{ color: "#16a34a", fontSize: 14, marginBottom: 4 }}>
                  <strong>{name}</strong>, vaš termin za <strong>{selectedService}</strong>
                </p>
                <p style={{ color: "#16a34a", fontSize: 14, marginBottom: 16 }}>
                  zakazan je za <strong>{schedule[selectedDay]?.label}</strong> u <strong>{selectedSlot}</strong>.
                </p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 24 }}>
                  Kontaktirat ćemo vas na {phone} za potvrdu.
                </p>
                <button onClick={() => { setSubmitted(false); setSelectedSlot(null); setSelectedService(""); setName(""); setPhone(""); setEmail(""); }}
                  style={{
                    background: "#9333ea", color: "#fff", padding: "10px 24px",
                    borderRadius: 12, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer",
                  }}>
                  Zakaži novi termin
                </button>
              </div>
            </div>
          ) : schedule.length > 0 ? (
            <div className="booking-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
              {/* Left */}
              <div>
                {/* Step 1 */}
                <StepHeader num={1} text="Odaberite dan" />
                <div className="days-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 32 }}>
                  {schedule.map((day, idx) => (
                    <button key={day.date}
                      onClick={() => { setSelectedDay(idx); setSelectedSlot(null); }}
                      style={{
                        padding: 12, borderRadius: 14, textAlign: "center", border: "none", cursor: "pointer",
                        transition: "all 0.2s",
                        background: selectedDay === idx ? "#9333ea" : "#fff",
                        color: selectedDay === idx ? "#fff" : "#4b5563",
                        boxShadow: selectedDay === idx ? "0 6px 20px rgba(147,51,234,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
                      }}>
                      <p style={{ fontSize: 11, fontWeight: 500, opacity: 0.7 }}>{day.dayName}</p>
                      <p style={{ fontSize: 22, fontWeight: 800, margin: "2px 0" }}>{day.dayNum}</p>
                      <p style={{ fontSize: 11, opacity: 0.7 }}>{day.month}</p>
                    </button>
                  ))}
                </div>

                {/* Step 2 */}
                <StepHeader num={2} text="Odaberite termin" />
                <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12, color: "#9ca3af" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 4, background: "#fff", border: "1px solid #e5e7eb", display: "inline-block" }} /> Slobodan
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 4, background: "#fef2f2", border: "1px solid #fecaca", display: "inline-block" }} /> Zauzet
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 4, background: "#9333ea", display: "inline-block" }} /> Odabran
                  </span>
                </div>
                {errors.slot && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>{errors.slot}</p>}
                <div className="slots-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 32 }}>
                  {schedule[selectedDay]?.slots.map(slot => (
                    <button key={slot.time} disabled={slot.booked}
                      onClick={() => setSelectedSlot(slot.time)}
                      style={{
                        padding: "10px 0", borderRadius: 12, fontSize: 14, fontWeight: 600,
                        border: "none", cursor: slot.booked ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        background: slot.booked ? "#fef2f2" : selectedSlot === slot.time ? "#9333ea" : "#fff",
                        color: slot.booked ? "#fca5a5" : selectedSlot === slot.time ? "#fff" : "#4b5563",
                        textDecoration: slot.booked ? "line-through" : "none",
                        boxShadow: selectedSlot === slot.time ? "0 4px 12px rgba(147,51,234,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
                      }}>
                      {slot.time}
                    </button>
                  ))}
                </div>

                {/* Step 3 */}
                <StepHeader num={3} text="Odaberite uslugu" />
                {errors.service && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>{errors.service}</p>}
                <div className="service-pick-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {services.map(s => (
                    <button key={s.name}
                      onClick={() => setSelectedService(s.name)}
                      style={{
                        padding: 16, borderRadius: 14, textAlign: "left", border: "none", cursor: "pointer",
                        transition: "all 0.2s",
                        background: selectedService === s.name ? "#9333ea" : "#fff",
                        color: selectedService === s.name ? "#fff" : "#374151",
                        boxShadow: selectedService === s.name ? "0 6px 20px rgba(147,51,234,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
                      }}>
                      <span style={{ fontSize: 22 }}>{s.icon}</span>
                      <p style={{ fontWeight: 700, marginTop: 8, fontSize: 14 }}>{s.name}</p>
                      <p style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>{s.price} · {s.duration}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right - Form */}
              <div>
                <form onSubmit={handleSubmit} style={{
                  background: "#fff", border: "1px solid #f3f4f6", borderRadius: 20,
                  padding: 24, position: "sticky", top: 88,
                  boxShadow: "0 12px 40px rgba(147,51,234,0.08)",
                }}>
                  <StepHeader num={4} text="Vaši podaci" />

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4b5563", marginBottom: 6 }}>
                      Ime i prezime <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Vaše ime i prezime"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 12, fontSize: 14,
                        border: `1px solid ${errors.name ? "#fca5a5" : "#e5e7eb"}`,
                        background: errors.name ? "#fef2f2" : "#f9fafb", outline: "none",
                        boxSizing: "border-box",
                      }} />
                    {errors.name && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4b5563", marginBottom: 6 }}>
                      Broj telefona <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="+387 6X XXX XXX"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 12, fontSize: 14,
                        border: `1px solid ${errors.phone ? "#fca5a5" : "#e5e7eb"}`,
                        background: errors.phone ? "#fef2f2" : "#f9fafb", outline: "none",
                        boxSizing: "border-box",
                      }} />
                    {errors.phone && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.phone}</p>}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4b5563", marginBottom: 6 }}>
                      Email <span style={{ color: "#d1d5db", fontSize: 11 }}>(opcionalno)</span>
                    </label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="email@primjer.ba"
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 12, fontSize: 14,
                        border: `1px solid ${errors.email ? "#fca5a5" : "#e5e7eb"}`,
                        background: errors.email ? "#fef2f2" : "#f9fafb", outline: "none",
                        boxSizing: "border-box",
                      }} />
                    {errors.email && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
                  </div>

                  {/* Summary */}
                  <div style={{
                    background: "#faf5ff", borderRadius: 14, padding: 16,
                    marginBottom: 20, border: "1px solid #f3e8ff",
                  }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 10 }}>Pregled</p>
                    {[
                      ["Dan", schedule[selectedDay]?.label],
                      ["Termin", selectedSlot],
                      ["Usluga", selectedService],
                      ["Cijena", services.find(s => s.name === selectedService)?.price],
                    ].map(([l, v]) => (
                      <div key={l as string} style={{
                        display: "flex", justifyContent: "space-between", fontSize: 13,
                        marginBottom: 6,
                      }}>
                        <span style={{ color: "#9ca3af" }}>{l}</span>
                        <span style={{ fontWeight: 600, color: v ? "#374151" : "#d1d5db" }}>{(v as string) || "—"}</span>
                      </div>
                    ))}
                  </div>

                  <button type="submit" style={{
                    width: "100%", background: "#9333ea", color: "#fff", padding: "14px 0",
                    borderRadius: 14, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(147,51,234,0.3)",
                  }}>
                    Potvrdi rezervaciju
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Učitavanje termina...</p>
          )}
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer id="kontakt" style={{ background: "#111827", color: "#fff", padding: "64px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, background: "#9333ea", borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 18,
                }}>A</div>
                <span style={{ fontSize: 20, fontWeight: 700 }}>
                  Salon <span style={{ color: "#a855f7" }}>Anel</span>
                </span>
              </div>
              <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.7 }}>
                Profesionalne frizerske usluge u ugodnom ambijentu. Posjetite nas i uvjerite se.
              </p>
            </div>
            <div>
              <h4 style={{ color: "#a855f7", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>
                Navigacija
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[["Početna","#hero"],["Usluge","#usluge"],["O nama","#onama"],["Zakazivanje","#booking"]].map(([l,h]) => (
                  <li key={l} style={{ marginBottom: 10 }}>
                    <a href={h} style={{ color: "#9ca3af", textDecoration: "none", fontSize: 14 }}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: "#a855f7", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>
                Kontakt
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["+387 61 123 456","Ulica Primjer bb, Sarajevo","Pon-Pet: 09-18h | Sub: 09-15h"].map(t => (
                  <li key={t} style={{ color: "#9ca3af", fontSize: 14, marginBottom: 12 }}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #1f2937", paddingTop: 24, textAlign: "center", color: "#6b7280", fontSize: 13 }}>
            &copy; 2025 Frizerski Salon Anel. Sva prava zadržana.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ───── Step Header ───── */
function StepHeader({ num, text }: { num: number; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 28, height: 28, background: "#9333ea", borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: 13, fontWeight: 700,
      }}>{num}</div>
      <h3 style={{ fontWeight: 700, fontSize: 16, color: "#1f2937" }}>{text}</h3>
    </div>
  );
}
