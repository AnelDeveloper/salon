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

    // Generate cancel token (base64 encoded booking data)
    const cancelData = JSON.stringify({ name, phone, email, service, price, day, time });
    const cancelToken = Buffer.from(cancelData).toString("base64url");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
    const cancelUrl = `${baseUrl}/cancel?token=${cancelToken}`;

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

    /* ───── Email za korisnika (potvrda + cancel link) ───── */
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf5ff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #9333ea, #7c3aed); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Potvrda Rezervacije</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Frizerski Salon Anel</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">Postovani/a <strong>${name}</strong>,</p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
            Vasa rezervacija je uspjesno primljena. Evo detalja vaseg termina:
          </p>
          <div style="background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #f3e8ff;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #faf5ff; color: #9ca3af; font-size: 14px; width: 120px;">Usluga</td><td style="padding: 10px 0; border-bottom: 1px solid #faf5ff; color: #9333ea; font-size: 14px; font-weight: 700;">${service}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #faf5ff; color: #9ca3af; font-size: 14px;">Cijena</td><td style="padding: 10px 0; border-bottom: 1px solid #faf5ff; color: #9333ea; font-size: 16px; font-weight: 700;">${price}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #faf5ff; color: #9ca3af; font-size: 14px;">Dan</td><td style="padding: 10px 0; border-bottom: 1px solid #faf5ff; color: #1f2937; font-size: 14px; font-weight: 600;">${day}</td></tr>
              <tr><td style="padding: 10px 0; color: #9ca3af; font-size: 14px;">Termin</td><td style="padding: 10px 0; color: #1f2937; font-size: 18px; font-weight: 700;">${time}</td></tr>
            </table>
          </div>

          <!-- Warning box -->
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px; margin: 24px 0;">
            <p style="color: #92400e; font-size: 13px; line-height: 1.7; margin: 0;">
              <strong>&#9888; Vazna napomena:</strong> Otkazivanje termina je moguce najkasnije <strong>24 sata</strong> prije zakazanog termina. U slucaju nepojavljivanja ili kasnog otkazivanja, pri sljedecem zakazivanju bit ce potrebna avansna uplata.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
            Ako zelite otkazati svoj termin, kliknite na dugme ispod ili nas kontaktirajte na telefon <strong>+387 62 123 701</strong>.
          </p>

          <!-- Cancel button -->
          <div style="text-align: center; margin: 28px 0 16px;">
            <a href="${cancelUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; padding: 14px 36px; border-radius: 12px; font-weight: 700; font-size: 14px; text-decoration: none; box-shadow: 0 4px 14px rgba(239,68,68,0.3);">
              Otkazi termin
            </a>
          </div>
          <p style="color: #d1d5db; font-size: 11px; text-align: center; margin: 0;">
            Otkazivanje je moguce najkasnije 24h prije termina.
          </p>

          <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0;">
            Hvala vam na povjerenju!<br/>
            <strong style="color: #9333ea;">Salon Anel</strong>
          </p>
        </div>
        <div style="background: #f3e8ff; padding: 20px 32px; text-align: center;">
          <p style="color: #7e22ce; font-size: 13px; margin: 0;">Frizerski Salon Anel | Kenana Brkanica bb, Koblja Glava</p>
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
    return NextResponse.json({ error: "Greska pri slanju emaila" }, { status: 500 });
  }
}
