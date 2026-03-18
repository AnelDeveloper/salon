import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { token, reason } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token nedostaje" }, { status: 400 });
    }

    // Decode booking data from token
    let booking: { name: string; phone: string; email: string; service: string; price: string; day: string; time: string };
    try {
      booking = JSON.parse(Buffer.from(token, "base64url").toString("utf-8"));
    } catch {
      return NextResponse.json({ error: "Nevazeci token" }, { status: 400 });
    }

    const { name, phone, email, service, price, day, time } = booking;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    /* ───── Email za vlasnika - OTKAZIVANJE ───── */
    const ownerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fef2f2; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">&#10060; Otkazana Rezervacija</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Frizerski Salon Anel</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #991b1b; font-size: 15px; font-weight: 600; margin: 0 0 20px;">Klijent je otkazao sljedecu rezervaciju:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #fecaca; color: #9ca3af; font-size: 14px; width: 140px;">Klijent</td><td style="padding: 12px 0; border-bottom: 1px solid #fecaca; color: #1f2937; font-size: 14px; font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #fecaca; color: #9ca3af; font-size: 14px;">Telefon</td><td style="padding: 12px 0; border-bottom: 1px solid #fecaca; color: #1f2937; font-size: 14px; font-weight: 600;">${phone}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #fecaca; color: #9ca3af; font-size: 14px;">Email</td><td style="padding: 12px 0; border-bottom: 1px solid #fecaca; color: #1f2937; font-size: 14px; font-weight: 600;">${email}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #fecaca; color: #9ca3af; font-size: 14px;">Usluga</td><td style="padding: 12px 0; border-bottom: 1px solid #fecaca; color: #ef4444; font-size: 14px; font-weight: 600;">${service}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #fecaca; color: #9ca3af; font-size: 14px;">Cijena</td><td style="padding: 12px 0; border-bottom: 1px solid #fecaca; color: #ef4444; font-size: 16px; font-weight: 700;">${price}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #fecaca; color: #9ca3af; font-size: 14px;">Dan</td><td style="padding: 12px 0; border-bottom: 1px solid #fecaca; color: #1f2937; font-size: 14px; font-weight: 600;">${day}</td></tr>
            <tr><td style="padding: 12px 0; ${reason ? "border-bottom: 1px solid #fecaca;" : ""} color: #9ca3af; font-size: 14px;">Termin</td><td style="padding: 12px 0; ${reason ? "border-bottom: 1px solid #fecaca;" : ""} color: #1f2937; font-size: 18px; font-weight: 700;">${time}</td></tr>
            ${reason ? `<tr><td style="padding: 12px 0; color: #9ca3af; font-size: 14px;">Razlog</td><td style="padding: 12px 0; color: #1f2937; font-size: 14px; font-style: italic;">${reason}</td></tr>` : ""}
          </table>
        </div>
        <div style="background: #fecaca; padding: 20px 32px; text-align: center;">
          <p style="color: #991b1b; font-size: 13px; margin: 0;">Ovaj termin je sada slobodan za druge klijente.</p>
        </div>
      </div>
    `;

    /* ───── Email za korisnika - potvrda otkazivanja ───── */
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf5ff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6b7280, #4b5563); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Termin Otkazan</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Frizerski Salon Anel</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">Postovani/a <strong>${name}</strong>,</p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
            Vas termin je uspjesno otkazan. Evo detalja otkazanog termina:
          </p>
          <div style="background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #9ca3af; font-size: 14px; width: 120px;">Usluga</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px; font-weight: 600; text-decoration: line-through;">${service}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #9ca3af; font-size: 14px;">Dan</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px; font-weight: 600; text-decoration: line-through;">${day}</td></tr>
              <tr><td style="padding: 10px 0; color: #9ca3af; font-size: 14px;">Termin</td><td style="padding: 10px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-decoration: line-through;">${time}</td></tr>
            </table>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.7; margin: 24px 0 0;">
            Ako zelite zakazati novi termin, posjetite nasu web stranicu ili nas kontaktirajte na <strong>+387 62 123 701</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 16px 0 0;">
            Hvala vam na razumijevanju!<br/>
            <strong style="color: #9333ea;">Salon Anel</strong>
          </p>
        </div>
        <div style="background: #f3e8ff; padding: 20px 32px; text-align: center;">
          <p style="color: #7e22ce; font-size: 13px; margin: 0;">Frizerski Salon Anel | Kenana Brkanica bb, Koblja Glava</p>
        </div>
      </div>
    `;

    await Promise.all([
      transporter.sendMail({
        from: `"Salon Anel" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `OTKAZANO: ${name} - ${service} (${day}, ${time})`,
        html: ownerHtml,
      }),
      transporter.sendMail({
        from: `"Salon Anel" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Termin otkazan - Salon Anel (${day}, ${time})`,
        html: customerHtml,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel email error:", error);
    return NextResponse.json({ error: "Greska pri slanju emaila" }, { status: 500 });
  }
}
