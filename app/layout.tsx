import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AppToaster } from "@/components/toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chiens & Chats | Citas y adopciones con cuidado premium",
  description:
    "Reserva citas, conoce adopciones disponibles y recibe acompañamiento humano en cada paso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
