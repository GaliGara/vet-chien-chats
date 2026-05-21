import type { Metadata } from "next";
import { AdminAppointments } from "@/components/admin/admin-appointments";

export const metadata: Metadata = {
  title: "Citas admin | Chiens et Chats",
};

export default function AdminCitasPage() {
  return <AdminAppointments />;
}
