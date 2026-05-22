import type { Metadata } from "next";
import { FloatingAppointmentButton } from "@/components/landing/floating-appointment-button";
import { AppointmentSection } from "@/components/landing/appointment-section";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";

export const metadata: Metadata = {
  title: "Reservar cita | Chiens et Chats",
  description: "Agenda una cita con una experiencia clara y cálida.",
};

export default function CitasPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFB]">
      <Navbar />
      <main className="pt-6">
        <AppointmentSection />
      </main>
      <Footer />
      <FloatingAppointmentButton />
    </div>
  );
}
