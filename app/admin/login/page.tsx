import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin/admin-login";

export const metadata: Metadata = {
  title: "Login admin | Chiens et Chats",
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLogin />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <main className="min-h-screen bg-[#FFFDFB] px-6 py-10">
      <div className="mx-auto max-w-md rounded-[2rem] border border-[#E8D6DE] bg-white/80 p-8 shadow-sm">
        <p className="text-center text-[#7B6A80]">Cargando acceso...</p>
      </div>
    </main>
  );
}
