"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

/* ───────── TYPES ───────── */
interface TimeSlot { time: string; booked: boolean; }
interface DaySchedule { date: string; label: string; dayName: string; dayNum: string; month: string; slots: TimeSlot[]; }

/* ───────── DATA ───────── */
const MONTHS = ["januar","februar","mart","april","maj","juni","juli","august","septembar","oktobar","novembar","decembar"];
const DAYS = ["Ned","Pon","Uto","Sri","Čet","Pet","Sub"];
const DAYS_FULL = ["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"];

function generateSchedule(): DaySchedule[] {
  const days: DaySchedule[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    if (d.getDay() === 0) continue;
    const slots: TimeSlot[] = [];
    const end = d.getDay() === 6 ? 15 : 18;
    for (let h = 9; h < end; h++) {
      slots.push({ time: `${h.toString().padStart(2,"0")}:00`, booked: Math.random() < 0.35 });
      slots.push({ time: `${h.toString().padStart(2,"0")}:30`, booked: Math.random() < 0.3 });
    }
    const num = d.getDate().toString();
    const mon = MONTHS[d.getMonth()];
    days.push({ date: d.toISOString().split("T")[0], label: `${DAYS_FULL[d.getDay()]}, ${num}. ${mon}`, dayName: DAYS[d.getDay()], dayNum: num, month: mon.substring(0,3), slots });
  }
  return days;
}

const services = [
  { name: "Muško šišanje", price: "15 KM", duration: "30 min", img: "/service-beard-trim.jpg" },
  { name: "Žensko šišanje", price: "25 KM", duration: "45 min", img: "/service-female-haircut.jpg" },
  { name: "Farbanje kose", price: "40 KM", duration: "90 min", img: "/service-hair-coloring.jpg" },
  { name: "Pranje i feniranje", price: "15 KM", duration: "30 min", img: "/service-hair-wash.jpg" },
  { name: "Šišanje + brada", price: "20 KM", duration: "45 min", img: "/service-male-haircut.jpg" },
  { name: "Styling / frizura", price: "30 KM", duration: "60 min", img: "/service-styling.jpg" },
];

/* ───────── SVG ICONS ───────── */
function ServiceIcon({ index, color }: { index: number; color: string }) {
  const props = { width: 32, height: 32, fill: "none", stroke: color, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };
  switch (index) {
    case 0: return <svg {...props}><circle cx={6} cy={6} r={3}/><circle cx={6} cy={18} r={3}/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>;
    case 1: return <svg {...props}><path d="M12 2a4 4 0 014 4c0 2-2 3-2 6h-4c0-3-2-4-2-6a4 4 0 014-4z"/><path d="M10 12h4v2a2 2 0 01-4 0v-2z"/><path d="M8 17h8"/><path d="M9 20h6"/></svg>;
    case 2: return <svg {...props}><rect x="8" y="2" width="8" height="20" rx="3"/><path d="M8 7h8"/><path d="M8 12h8"/><circle cx="12" cy="17" r="1"/></svg>;
    case 3: return <svg {...props}><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>;
    case 4: return <svg {...props}><path d="M7 3h10v4a2 2 0 01-2 2H9a2 2 0 01-2-2V3z"/><rect x="9" y="9" width="6" height="12" rx="1"/><line x1="12" y1="9" x2="12" y2="21"/></svg>;
    case 5: return <svg {...props}><path d="M9.5 2a2.5 2.5 0 015 0v2h-5V2z"/><rect x="3" y="4" width="4" height="16" rx="1"/><line x1="7" y1="7" x2="12" y2="7"/><line x1="7" y1="10" x2="12" y2="10"/><line x1="7" y1="13" x2="12" y2="13"/><line x1="7" y1="16" x2="10" y2="16"/></svg>;
    default: return null;
  }
}

/* ───────── SCROLL ANIMATION HOOK ───────── */
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }); },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    el.querySelectorAll(".anim").forEach(c => observer.observe(c));
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ───────── MAIN COMPONENT ───────── */
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
  const [sending, setSending] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const sRef = useScrollAnimation();
  const aRef = useScrollAnimation();
  const bRef = useScrollAnimation();

  useEffect(() => { setSchedule(generateSchedule()); }, []);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Ime je obavezno";
    if (!phone.trim()) errs.phone = "Broj telefona je obavezan";
    else if (!/^\+387\d{8,9}$/.test(phone.replace(/\s/g, ""))) errs.phone = "Unesite validan +387 broj (npr. +387 61 123 456)";
    if (!email.trim()) errs.email = "Email je obavezan";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Unesite validnu email adresu";
    if (!selectedService) errs.service = "Odaberite uslugu";
    if (!selectedSlot) errs.slot = "Odaberite termin";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSending(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          service: selectedService,
          price: services.find(s => s.name === selectedService)?.price,
          day: schedule[selectedDay]?.label,
          time: selectedSlot,
        }),
      });
      if (!res.ok) throw new Error("API error");
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  }, [name, phone, email, selectedService, selectedSlot, schedule, selectedDay]);

  const navLinks = [["Početna","#hero"],["Usluge","#usluge"],["O nama","#onama"],["Zakazivanje","#booking"],["Kontakt","#kontakt"]];

  return (
    <div style={{ minHeight: "100vh", background: "#fff", overflowX: "hidden" }}>

      {/* ═══════ NAVBAR ═══════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid #f3e8ff" : "1px solid transparent",
        transition: "all 0.4s ease",
        boxShadow: scrolled ? "0 4px 30px rgba(147,51,234,0.06)" : "none",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 68 }}>
            <a href="#hero" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 38, height: 38, background: scrolled ? "linear-gradient(135deg, #9333ea, #7c3aed)" : "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18, transition: "all 0.4s", boxShadow: scrolled ? "0 4px 12px rgba(147,51,234,0.3)" : "none" }}>A</div>
              <span style={{ fontSize: 21, fontWeight: 800, color: scrolled ? "#1f1f1f" : "#fff", transition: "color 0.4s" }}>Salon <span style={{ color: scrolled ? "#9333ea" : "#e9d5ff" }}>Anel</span></span>
            </a>
            <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {navLinks.map(([l,h]) => (
                <a key={l} href={h} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500, color: scrolled ? "#6b7280" : "rgba(255,255,255,0.85)", textDecoration: "none", transition: "all 0.25s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = scrolled ? "#faf5ff" : "rgba(255,255,255,0.1)"; e.currentTarget.style.color = scrolled ? "#9333ea" : "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = scrolled ? "#6b7280" : "rgba(255,255,255,0.85)"; }}
                >{l}</a>
              ))}
              <a href="#booking" style={{ marginLeft: 10, background: scrolled ? "linear-gradient(135deg, #9333ea, #7c3aed)" : "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: scrolled ? "none" : "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "10px 22px", borderRadius: 11, fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "all 0.3s", boxShadow: scrolled ? "0 4px 16px rgba(147,51,234,0.25)" : "none" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.background = scrolled ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(255,255,255,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = scrolled ? "linear-gradient(135deg, #9333ea, #7c3aed)" : "rgba(255,255,255,0.15)"; }}
              >Zakaži termin</a>
            </div>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="mobile-menu-btn" style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, color: scrolled ? "#6b7280" : "#fff", transition: "color 0.4s" }}>
              <svg width={24} height={24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenu ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
          {mobileMenu && (
            <div style={{ paddingBottom: 20, animation: "slideDown 0.3s ease" }}>
              {navLinks.map(([l,h]) => (
                <a key={l} href={h} onClick={() => setMobileMenu(false)} style={{ display: "block", padding: "12px 14px", color: "#4b5563", textDecoration: "none", fontSize: 15, fontWeight: 500, borderRadius: 10, transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#faf5ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >{l}</a>
              ))}
              <a href="#booking" onClick={() => setMobileMenu(false)} style={{ display: "block", textAlign: "center", marginTop: 8, background: "#9333ea", color: "#fff", padding: "12px", borderRadius: 11, fontWeight: 600, textDecoration: "none" }}>Zakaži termin</a>
            </div>
          )}
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section id="hero" style={{ paddingTop: 68, background: "linear-gradient(135deg, #581c87 0%, #7e22ce 30%, #9333ea 60%, #a855f7 100%)", position: "relative", overflow: "hidden" }}>
        {/* Decorative shapes */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", top: "30%", left: "15%", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "80px 24px 100px" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, alignItems: "center" }}>
            {/* Left */}
            <div>
              <div className="hero-fade" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)",
                color: "#fff", padding: "8px 20px", borderRadius: 50, fontSize: 13, fontWeight: 600, marginBottom: 32,
                border: "1px solid rgba(255,255,255,0.15)",
              }}>
                <span style={{ width: 8, height: 8, background: "#86efac", borderRadius: "50%", display: "inline-block" }} />
                Online zakazivanje dostupno
              </div>

              <h1 className="hero-fade-delay-1" style={{ fontSize: 54, fontWeight: 800, color: "#fff", lineHeight: 1.08, marginBottom: 24 }}>
                Frizerski Salon<br/><span style={{ color: "#e9d5ff", fontWeight: 800 }}>Anel</span>
              </h1>

              <p className="hero-fade-delay-2" style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 40, maxWidth: 440 }}>
                Profesionalne frizerske usluge u ugodnom ambijentu. Vaša ljepota je naš prioritet. Zakazite termin online brzo i jednostavno.
              </p>

              <div className="hero-fade-delay-2" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 52 }}>
                <a href="#booking" style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "#fff", color: "#7e22ce", padding: "15px 32px",
                  borderRadius: 14, fontWeight: 700, fontSize: 15, textDecoration: "none",
                  transition: "all 0.3s ease",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)"; }}
                >
                  Zakaži termin
                  <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
                <a href="#usluge" style={{
                  display: "inline-flex", alignItems: "center",
                  border: "2px solid rgba(255,255,255,0.25)", color: "#fff",
                  padding: "15px 28px", borderRadius: 14, fontWeight: 600, fontSize: 15,
                  textDecoration: "none", transition: "all 0.3s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
                >Pogledaj usluge</a>
              </div>

              <div className="hero-fade-delay-3" style={{ display: "flex", gap: 40 }}>
                {[["500+","Klijenata"],["5+","God. iskustva"],["4.9","Ocjena"]].map(([n,l]) => (
                  <div key={l}>
                    <p style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>{n}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5, marginTop: 2 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Image */}
            <div className="hero-card-wrapper hero-card-anim" style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative" }}>
                {/* Glow behind image */}
                <div style={{ position: "absolute", inset: -20, borderRadius: 32, background: "rgba(255,255,255,0.08)", filter: "blur(20px)" }} />
                <div style={{
                  position: "relative", borderRadius: 24, overflow: "hidden",
                  border: "3px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
                  maxWidth: 340,
                }}>
                  <Image src="/hero-woman.jpg" alt="Salon Anel" width={340} height={420} style={{ width: "100%", height: "auto", display: "block" }} priority />
                </div>
                {/* Floating rating badge */}
                <div className="floating" style={{
                  position: "absolute", bottom: -20, left: -24,
                  background: "#fff", borderRadius: 18, padding: "14px 22px",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} width={16} height={16} viewBox="0 0 20 20" fill="#facc15"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#1f2937" }}>4.9</span>
                </div>
                {/* Floating time badge */}
                <div className="floating" style={{
                  position: "absolute", top: 20, right: -28,
                  background: "#fff", borderRadius: 14, padding: "10px 16px",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                  animationDelay: "1s",
                }}>
                  <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Radno vrijeme</p>
                  <p style={{ fontSize: 14, color: "#7e22ce", fontWeight: 700, marginTop: 2 }}>09 - 18h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Wave bottom */}
        <svg viewBox="0 0 1440 80" fill="none" style={{ display: "block", width: "100%" }}>
          <path d="M0 80L60 68C120 56 240 32 360 24C480 16 600 24 720 32C840 40 960 48 1080 48C1200 48 1320 40 1380 36L1440 32V80H0Z" fill="#ffffff"/>
        </svg>
      </section>

      {/* ═══════ USLUGE ═══════ */}
      <section id="usluge" style={{ padding: "80px 0 100px", background: "#fff" }} ref={sRef}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div className="anim" style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: "#9333ea", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 4, marginBottom: 12 }}>Šta nudimo</p>
            <h2 style={{ fontSize: 42, fontWeight: 800, color: "#111827", marginBottom: 16 }}>Naše usluge</h2>
            <div style={{ width: 60, height: 4, background: "linear-gradient(90deg, #9333ea, #c084fc)", borderRadius: 2, margin: "0 auto 18px" }} />
            <p style={{ color: "#9ca3af", maxWidth: 480, margin: "0 auto", fontSize: 15, lineHeight: 1.7 }}>
              Širok spektar profesionalnih frizerskih usluga za muškarce i žene uz kvalitetne proizvode.
            </p>
          </div>

          <div className="services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {services.map((s, i) => (
              <div key={s.name} className={`anim delay-${(i % 3) + 1}`}
                style={{
                  borderRadius: 22, overflow: "hidden", cursor: "default",
                  transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  border: "1px solid #f3f4f6",
                  background: "#fff",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(147,51,234,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.04)"; }}
              >
                {/* Photo header */}
                <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                  <Image src={s.img} alt={s.name} fill style={{ objectFit: "cover", transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 60%)" }} />
                  {/* Icon badge */}
                  <div style={{ position: "absolute", bottom: 14, left: 16, width: 44, height: 44, background: "rgba(147,51,234,0.9)", backdropFilter: "blur(8px)", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                    <ServiceIcon index={i} color="#fff" />
                  </div>
                </div>
                {/* Content */}
                <div style={{ padding: "20px 24px 24px" }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1f2937", marginBottom: 4 }}>{s.name}</h3>
                  <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>Trajanje: {s.duration}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: "#9333ea" }}>{s.price}</span>
                    <a href="#booking" style={{
                      fontSize: 13, color: "#fff", fontWeight: 600, textDecoration: "none",
                      background: "linear-gradient(135deg, #9333ea, #7c3aed)",
                      padding: "8px 18px", borderRadius: 10,
                      transition: "all 0.3s", display: "inline-flex", alignItems: "center", gap: 4,
                      boxShadow: "0 4px 12px rgba(147,51,234,0.2)",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(147,51,234,0.35)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(147,51,234,0.2)"; }}
                    >
                      Zakaži
                      <svg width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ O NAMA ═══════ */}
      <section id="onama" style={{ padding: "100px 0", background: "#faf5ff" }} ref={aRef}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            {/* Left - visual */}
            <div className="anim">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { n: "5+", l: "Godina iskustva", bg: "linear-gradient(135deg, #9333ea, #7c3aed)", c: "#fff", lc: "rgba(255,255,255,0.8)" },
                  { n: "500+", l: "Zadovoljnih klijenata", bg: "#fff", c: "#9333ea", lc: "#9ca3af" },
                  { n: "100%", l: "Posvećenost", bg: "#fff", c: "#9333ea", lc: "#9ca3af" },
                  { n: "6", l: "Vrsta usluga", bg: "linear-gradient(135deg, #7c3aed, #6d28d9)", c: "#fff", lc: "rgba(255,255,255,0.8)" },
                ].map((item, i) => (
                  <div key={item.l} className={`anim delay-${i + 1}`}
                    style={{
                      background: item.bg, borderRadius: 22, padding: "36px 20px",
                      textAlign: "center", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                      border: item.bg === "#fff" ? "1px solid #f3e8ff" : "none",
                      boxShadow: item.bg !== "#fff" ? "0 10px 30px rgba(147,51,234,0.25)" : "0 4px 16px rgba(0,0,0,0.03)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    <p style={{ fontSize: 40, fontWeight: 800, color: item.c, marginBottom: 4 }}>{item.n}</p>
                    <p style={{ fontSize: 13, color: item.lc, fontWeight: 500 }}>{item.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - text */}
            <div className="anim delay-2">
              <p style={{ color: "#9333ea", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 4, marginBottom: 12 }}>O nama</p>
              <h2 style={{ fontSize: 42, fontWeight: 800, color: "#111827", marginBottom: 10 }}>Vaša ljepota,<br/>naša strast</h2>
              <div style={{ width: 60, height: 4, background: "linear-gradient(90deg, #9333ea, #c084fc)", borderRadius: 2, marginBottom: 28 }} />
              <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 16, fontSize: 15 }}>
                Frizerski salon Anel je mjesto gdje se tradicija spaja sa modernim trendovima. Naš tim profesionalaca posvećen je tome da svaki klijent izađe sa osmijehom na licu.
              </p>
              <p style={{ color: "#6b7280", lineHeight: 1.8, marginBottom: 32, fontSize: 15 }}>
                Koristimo vrhunske proizvode i najnovije tehnike kako bismo vam pružili najbolji mogući rezultat.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Kvalitetni profesionalni proizvodi","Iskusni i certificirani frizeri","Ugodna i prijatna atmosfera","Online zakazivanje termina"].map((item, i) => (
                  <li key={item} className={`anim delay-${i + 3}`} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #9333ea, #a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 10px rgba(147,51,234,0.2)" }}>
                      <svg width={14} height={14} fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span style={{ color: "#4b5563", fontSize: 15, fontWeight: 500 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BOOKING ═══════ */}
      <section id="booking" style={{ padding: "100px 0", background: "#fff" }} ref={bRef}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div className="anim" style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: "#9333ea", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 4, marginBottom: 12 }}>Rezervacija</p>
            <h2 style={{ fontSize: 42, fontWeight: 800, color: "#111827", marginBottom: 16 }}>Zakazite svoj termin</h2>
            <div style={{ width: 60, height: 4, background: "linear-gradient(90deg, #9333ea, #c084fc)", borderRadius: 2, margin: "0 auto 18px" }} />
            <p style={{ color: "#9ca3af", maxWidth: 480, margin: "0 auto", fontSize: 15 }}>Odaberite dan, termin i uslugu, te unesite vaše podatke. Kontaktirat ćemo vas za potvrdu.</p>
          </div>

          {submitted ? (
            <div style={{ maxWidth: 440, margin: "0 auto", textAlign: "center", animation: "scaleIn 0.5s ease" }}>
              <div style={{ background: "#fff", border: "2px solid #86efac", borderRadius: 28, padding: 52, boxShadow: "0 16px 48px rgba(0,0,0,0.06)" }}>
                <div style={{ width: 76, height: 76, background: "linear-gradient(135deg, #22c55e, #16a34a)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 24px rgba(34,197,94,0.3)" }}>
                  <svg width={36} height={36} fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "#15803d", marginBottom: 12 }}>Termin uspješno zakazan!</h3>
                <p style={{ color: "#16a34a", fontSize: 15, marginBottom: 4 }}><strong>{name}</strong>, vaš termin za <strong>{selectedService}</strong></p>
                <p style={{ color: "#16a34a", fontSize: 15, marginBottom: 24 }}>zakazan za <strong>{schedule[selectedDay]?.label}</strong> u <strong>{selectedSlot}</strong>.</p>
                <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 28 }}>Kontaktirat ćemo vas na {phone} za potvrdu.</p>
                <button onClick={() => { setSubmitted(false); setSelectedSlot(null); setSelectedService(""); setName(""); setPhone(""); setEmail(""); }}
                  style={{ background: "linear-gradient(135deg, #9333ea, #7c3aed)", color: "#fff", padding: "13px 30px", borderRadius: 14, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(147,51,234,0.3)", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(147,51,234,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(147,51,234,0.3)"; }}
                >Zakaži novi termin</button>
              </div>
            </div>
          ) : schedule.length > 0 ? (
            <div className="booking-grid anim visible" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 36 }}>
              <div>
                <StepHeader num={1} text="Odaberite dan" />
                <div className="days-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 40 }}>
                  {schedule.map((day, idx) => (
                    <button key={day.date} onClick={() => { setSelectedDay(idx); setSelectedSlot(null); }}
                      style={{
                        padding: "16px 8px", borderRadius: 18, textAlign: "center", border: "none", cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                        background: selectedDay === idx ? "linear-gradient(135deg, #9333ea, #7c3aed)" : "#fff",
                        color: selectedDay === idx ? "#fff" : "#4b5563",
                        boxShadow: selectedDay === idx ? "0 8px 28px rgba(147,51,234,0.35)" : "0 2px 8px rgba(0,0,0,0.04)",
                        transform: selectedDay === idx ? "scale(1.06)" : "scale(1)",
                      }}>
                      <p style={{ fontSize: 11, fontWeight: 600, opacity: 0.6 }}>{day.dayName}</p>
                      <p style={{ fontSize: 26, fontWeight: 800, margin: "4px 0" }}>{day.dayNum}</p>
                      <p style={{ fontSize: 11, fontWeight: 500, opacity: 0.6 }}>{day.month}</p>
                    </button>
                  ))}
                </div>

                <StepHeader num={2} text="Odaberite termin" />
                <div style={{ display: "flex", gap: 16, marginBottom: 14, fontSize: 12, color: "#9ca3af" }}>
                  <Legend color="#fff" border="#e5e7eb" label="Slobodan" />
                  <Legend color="#fef2f2" border="#fecaca" label="Zauzet" />
                  <Legend color="#9333ea" border="#9333ea" label="Odabran" />
                </div>
                {errors.slot && <ErrMsg text={errors.slot} />}
                <div className="slots-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 40 }}>
                  {schedule[selectedDay]?.slots.map(slot => (
                    <button key={slot.time} disabled={slot.booked} onClick={() => setSelectedSlot(slot.time)}
                      style={{
                        padding: "11px 0", borderRadius: 12, fontSize: 14, fontWeight: 600, border: "none",
                        cursor: slot.booked ? "not-allowed" : "pointer",
                        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
                        background: slot.booked ? "#fef2f2" : selectedSlot === slot.time ? "linear-gradient(135deg, #9333ea, #7c3aed)" : "#fff",
                        color: slot.booked ? "#fca5a5" : selectedSlot === slot.time ? "#fff" : "#4b5563",
                        textDecoration: slot.booked ? "line-through" : "none",
                        boxShadow: selectedSlot === slot.time ? "0 4px 16px rgba(147,51,234,0.35)" : "0 1px 4px rgba(0,0,0,0.04)",
                        transform: selectedSlot === slot.time ? "scale(1.06)" : "scale(1)",
                      }}>
                      {slot.time}
                    </button>
                  ))}
                </div>

                <StepHeader num={3} text="Odaberite uslugu" />
                {errors.service && <ErrMsg text={errors.service} />}
                <div className="service-pick-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {services.map((s, i) => (
                    <button key={s.name} onClick={() => setSelectedService(s.name)}
                      style={{
                        padding: 18, borderRadius: 18, textAlign: "left", border: "none", cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                        background: selectedService === s.name ? "linear-gradient(135deg, #9333ea, #7c3aed)" : "#fff",
                        color: selectedService === s.name ? "#fff" : "#374151",
                        boxShadow: selectedService === s.name ? "0 8px 28px rgba(147,51,234,0.35)" : "0 2px 8px rgba(0,0,0,0.04)",
                        transform: selectedService === s.name ? "scale(1.03)" : "scale(1)",
                      }}>
                      <div style={{ color: selectedService === s.name ? "#e9d5ff" : "#9333ea", marginBottom: 8 }}><ServiceIcon index={i} color={selectedService === s.name ? "#e9d5ff" : "#9333ea"} /></div>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</p>
                      <p style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>{s.price} · {s.duration}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div>
                <form onSubmit={handleSubmit} style={{
                  background: "#fff", border: "1px solid #f3e8ff", borderRadius: 24, padding: 28,
                  position: "sticky", top: 88,
                  boxShadow: "0 16px 48px rgba(147,51,234,0.08)",
                }}>
                  <StepHeader num={4} text="Vaši podaci" />
                  <Field label="Ime i prezime" req value={name} set={setName} err={errors.name} ph="Vaše ime i prezime" />
                  <Field label="Broj telefona" req value={phone} set={setPhone} err={errors.phone} ph="+387 6X XXX XXX" type="tel" />
                  <Field label="Email" req value={email} set={setEmail} err={errors.email} ph="email@primjer.ba" type="email" />

                  <div style={{ background: "linear-gradient(135deg, #faf5ff, #f3e8ff)", borderRadius: 18, padding: 20, marginBottom: 22, border: "1px solid #ede9fe" }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 14 }}>Pregled rezervacije</p>
                    {[["Dan", schedule[selectedDay]?.label], ["Termin", selectedSlot], ["Usluga", selectedService], ["Cijena", services.find(s => s.name === selectedService)?.price]].map(([l, v]) => (
                      <div key={l as string} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                        <span style={{ color: "#9ca3af" }}>{l}</span>
                        <span style={{ fontWeight: 700, color: v ? (l === "Cijena" ? "#9333ea" : "#374151") : "#d1d5db" }}>{(v as string) || "—"}</span>
                      </div>
                    ))}
                  </div>

                  <button type="submit" disabled={sending} style={{
                    width: "100%", background: sending ? "#c084fc" : "linear-gradient(135deg, #9333ea, #7c3aed)", color: "#fff", padding: "15px 0",
                    borderRadius: 14, fontWeight: 700, fontSize: 15, border: "none", cursor: sending ? "wait" : "pointer",
                    boxShadow: "0 8px 24px rgba(147,51,234,0.3)", transition: "all 0.3s",
                    opacity: sending ? 0.8 : 1,
                  }}
                    onMouseEnter={e => { if (!sending) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(147,51,234,0.4)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(147,51,234,0.3)"; }}
                  >{sending ? "Slanje..." : "Potvrdi rezervaciju"}</button>
                </form>
              </div>
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: 48 }}>Učitavanje termina...</p>
          )}
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer id="kontakt" style={{ background: "linear-gradient(180deg, #1e1b4b, #0f0a2e)", color: "#fff", padding: "80px 0 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #9333ea, #7c3aed)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 20 }}>A</div>
                <span style={{ fontSize: 22, fontWeight: 800 }}>Salon <span style={{ color: "#a855f7" }}>Anel</span></span>
              </div>
              <p style={{ color: "#7c7c9a", fontSize: 14, lineHeight: 1.8, maxWidth: 300 }}>
                Profesionalne frizerske usluge u ugodnom ambijentu. Posjetite nas i uvjerite se zašto su naši klijenti uvijek zadovoljni.
              </p>
            </div>
            <div>
              <h4 style={{ color: "#a855f7", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginBottom: 22 }}>Navigacija</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {navLinks.map(([l,h]) => (
                  <li key={l} style={{ marginBottom: 14 }}>
                    <a href={h} style={{ color: "#7c7c9a", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#e9d5ff")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#7c7c9a")}
                    >{l}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: "#a855f7", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginBottom: 22 }}>Kontakt</h4>
              {[
                { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />, text: "+387 61 123 456" },
                { icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>, text: "Ulica Primjer bb, Sarajevo" },
                { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />, text: "Pon-Pet: 09-18h | Sub: 09-15h" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, color: "#7c7c9a", fontSize: 14, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, background: "rgba(147,51,234,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width={16} height={16} fill="none" stroke="#a855f7" viewBox="0 0 24 24">{item.icon}</svg>
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(147,51,234,0.15)", paddingTop: 28, textAlign: "center", color: "#6b6b8a", fontSize: 13 }}>
            &copy; 2025 Frizerski Salon Anel. Sva prava zadržana.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ───── Helpers ───── */
function StepHeader({ num, text }: { num: number; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #9333ea, #7c3aed)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800, boxShadow: "0 4px 12px rgba(147,51,234,0.25)" }}>{num}</div>
      <h3 style={{ fontWeight: 700, fontSize: 17, color: "#1f2937" }}>{text}</h3>
    </div>
  );
}

function Field({ label, value, set, err, ph, type = "text", req, opt }: {
  label: string; value: string; set: (v: string) => void; err?: string;
  ph: string; type?: string; req?: boolean; opt?: boolean;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4b5563", marginBottom: 7 }}>
        {label} {req && <span style={{ color: "#ef4444" }}>*</span>}
        {opt && <span style={{ color: "#d1d5db", fontSize: 11, fontWeight: 400 }}> (opcionalno)</span>}
      </label>
      <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 13, fontSize: 14,
          border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`,
          background: err ? "#fef2f2" : "#fafafa", outline: "none", boxSizing: "border-box",
          transition: "all 0.25s",
        }}
        onFocus={e => { if (!err) { e.currentTarget.style.borderColor = "#c084fc"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(192,132,252,0.12)"; e.currentTarget.style.background = "#fff"; } }}
        onBlur={e => { if (!err) { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#fafafa"; } }}
      />
      {err && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5, fontWeight: 500 }}>{err}</p>}
    </div>
  );
}

function Legend({ color, border, label }: { color: string; border: string; label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 6, background: color, border: `1.5px solid ${border}`, display: "inline-block" }} />
      {label}
    </span>
  );
}

function ErrMsg({ text }: { text: string }) {
  return <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10, fontWeight: 500 }}>{text}</p>;
}
