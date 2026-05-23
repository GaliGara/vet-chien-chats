import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { AppToaster } from "@/components/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chiens et Chats | Veterinaria boutique y adopciones",
  description:
    "Reserva citas veterinarias, estética canina, vacunación y procesos de adopción con cuidado humano.",
};

const fontVariables = {
  "--font-inter":
    'Inter, "Avenir Next", Avenir, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  "--font-playfair":
    '"Playfair Display", "Times New Roman", Georgia, Cambria, serif',
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" style={fontVariables}>
      <body
        className="min-h-full bg-background text-foreground"
        data-scroll-behavior="smooth"
      >
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
