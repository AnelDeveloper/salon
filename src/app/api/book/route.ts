import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, service, price, day, time } = body;

    if (!name || !phone || !email || !service || !day || !time) {
      return NextResponse.json({ error: "Nedostaju obavezni podaci" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    /* ───── Email za vlasnika salona ───── */
    const ownerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf5ff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #9333ea, #7c3aed); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Nova Rezervacija</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Frizerski Salon Anel</p>
        </div>
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #f3e8ff; color: #9ca3af; font-size: 14px; width: 140px;">Klijent</td><td style="padding: 12px 0; border-bottom: 1px solid #f3e8ff; color: #1f2937; font-size: 14px; font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #f3e8ff; color: #9ca3af; font-size: 14px;">Telefon</td><td style="padding: 12px 0; border-bottom: 1px solid #f3e8ff; color: #1f2937; font-size: 14px; font-weight: 600;">${phone}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #f3e8ff; color: #9ca3af; font-size: 14px;">Email</td><td style="padding: 12px 0; border-bottom: 1px solid #f3e8ff; color: #1f2937; font-size: 14px; font-weight: 600;">${email}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #f3e8ff; color: #9ca3af; font-size: 14px;">Usluga</td><td style="padding: 12px 0; border-bottom: 1px solid #f3e8ff; color: #9333ea; font-size: 14px; font-weight: 600;">${service}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #f3e8ff; color: #9ca3af; font-size: 14px;">Cijena</td><td style="padding: 12px 0; border-bottom: 1px solid #f3e8ff; color: #9333ea; font-size: 16px; font-weight: 700;">${price}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #f3e8ff; color: #9ca3af; font-size: 14px;">Dan</td><td style="padding: 12px 0; border-bottom: 1px solid #f3e8ff; color: #1f2937; font-size: 14px; font-weight: 600;">${day}</td></tr>
            <tr><td style="padding: 12px 0; color: #9ca3af; font-size: 14px;">Termin</td><td style="padding: 12px 0; color: #1f2937; font-size: 18px; font-weight: 700;">${time}</td></tr>
          </table>
        </div>
        <div style="background: #f3e8ff; padding: 20px 32px; text-align: center;">
          <p style="color: #7e22ce; font-size: 13px; margin: 0;">Ovaj email je automatski generisan sa web stranice Salon Anel.</p>
        </div>
      </div>
    `;

    /* ───── Email za korisnika (potvrda) ───── */
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf5ff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #9333ea, #7c3aed); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Potvrda Rezervacije</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Frizerski Salon Anel</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">Poštovani/a <strong>${name}</strong>,</p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
            Vaša rezervacija je uspješno primljena. Evo detalja vašeg termina:
          </p>
          <div style="background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #f3e8ff;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #faf5ff; color: #9ca3af; font-size: 14px; width: 120px;">Usluga</td><td style="padding: 10px 0; border-bottom: 1px solid #faf5ff; color: #9333ea; font-size: 14px; font-weight: 700;">${service}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #faf5ff; color: #9ca3af; font-size: 14px;">Cijena</td><td style="padding: 10px 0; border-bottom: 1px solid #faf5ff; color: #9333ea; font-size: 16px; font-weight: 700;">${price}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #faf5ff; color: #9ca3af; font-size: 14px;">Dan</td><td style="padding: 10px 0; border-bottom: 1px solid #faf5ff; color: #1f2937; font-size: 14px; font-weight: 600;">${day}</td></tr>
              <tr><td style="padding: 10px 0; color: #9ca3af; font-size: 14px;">Termin</td><td style="padding: 10px 0; color: #1f2937; font-size: 18px; font-weight: 700;">${time}</td></tr>
            </table>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.7; margin: 24px 0 0;">
            Kontaktirat ćemo vas za dodatnu potvrdu. Ako želite otkazati ili promijeniti termin,
            javite nam se na telefon <strong>+387 61 123 456</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 16px 0 0;">
            Hvala vam na povjerenju!<br/>
            <strong style="color: #9333ea;">Salon Anel</strong>
          </p>
        </div>
        <div style="background: #f3e8ff; padding: 20px 32px; text-align: center;">
          <p style="color: #7e22ce; font-size: 13px; margin: 0;">Frizerski Salon Anel | Ulica Primjer bb, Sarajevo</p>
        </div>
      </div>
    `;

    // Slanje oba emaila paralelno
    await Promise.all([
      transporter.sendMail({
        from: `"Salon Anel" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `Nova rezervacija: ${name} - ${service} (${day}, ${time})`,
        html: ownerHtml,
      }),
      transporter.sendMail({
        from: `"Salon Anel" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Potvrda rezervacije - Salon Anel (${day}, ${time})`,
        html: customerHtml,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Greška pri slanju emaila" }, { status: 500 });
  }
}
