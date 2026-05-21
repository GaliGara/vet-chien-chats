import type { Metadata } from "next";
import { AdminServices } from "@/components/admin/admin-services";

export const metadata: Metadata = {
  title: "Servicios admin | Chiens et Chats",
};

export default function AdminServiciosPage() {
  return <AdminServices />;
}
