import type { Metadata } from "next";
import { AdoptionsSection } from "@/components/landing/adoptions-section";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";

export const metadata: Metadata = {
  title: "Adopciones | Chiens & Chats",
  description: "Conoce mascotas disponibles para adopcion.",
};

export default function AdopcionesPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFB]">
      <Navbar />
      <main className="pt-6">
        <AdoptionsSection fullPage />
      </main>
      <Footer />
    </div>
  );
}
