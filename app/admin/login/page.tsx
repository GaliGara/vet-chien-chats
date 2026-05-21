import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin/admin-login";

export const metadata: Metadata = {
  title: "Login admin | Chiens et Chats",
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}
