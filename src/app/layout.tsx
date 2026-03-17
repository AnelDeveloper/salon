import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frizerski Salon Anel | Zakazivanje termina",
  description:
    "Frizerski salon Anel - profesionalne frizerske usluge. Zakazite svoj termin online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
