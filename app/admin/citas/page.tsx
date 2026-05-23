import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminAppointments } from "@/components/admin/admin-appointments";

export const metadata: Metadata = {
  title: "Citas admin | Chiens et Chats",
};

export default function AdminCitasPage() {
  return (
    <Suspense fallback={<AppointmentsFallback />}>
      <AdminAppointments />
    </Suspense>
  );
}

function AppointmentsFallback() {
  return (
    <div className="min-h-screen bg-[#FFFDFB]">
      <main className="mx-auto max-w-6xl px-4 py-5 pb-24 sm:px-6 sm:pb-8">
        <div className="mb-6">
          <div className="mb-2 h-6 w-32 animate-pulse rounded-full bg-[#FFF6F8]" />
          <div className="h-10 w-48 animate-pulse rounded-full bg-[#F7F1FA]" />
          <div className="mt-3 h-4 w-72 animate-pulse rounded-full bg-[#FFF6F8]" />
        </div>
        <div className="grid gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-[1.2rem] border border-[#E8D6DE] bg-white"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
