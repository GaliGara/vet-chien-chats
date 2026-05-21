import type { Metadata } from "next";
import { AdminAdoptions } from "@/components/admin/admin-adoptions";

export const metadata: Metadata = {
  title: "Adopciones admin | Chiens et Chats",
};

export default function AdminAdopcionesPage() {
  return <AdminAdoptions />;
}
