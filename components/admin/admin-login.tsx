"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { brand } from "@/constants/site";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast.error("No pudimos iniciar sesion", {
        description: error.message,
      });
      return;
    }

    window.localStorage.removeItem("admin-preview");
    toast.success("Sesion iniciada");
    router.push("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#FFFDFB,#FFF6F8,#F7F1FA)] px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-[#E8D6DE] bg-white/90 p-7 shadow-[0_24px_70px_rgb(91_58_99/0.12)] backdrop-blur">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid size-10 place-items-center rounded-full bg-[#FFF6F8] text-[#A7353F] ring-1 ring-[#E8D6DE]">
            <Heart className="size-5 fill-[#F7C8D9]" />
          </span>
          <span className="font-heading text-2xl text-[#2F2433]">
            {brand.name}
          </span>
        </Link>

        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F7F1FA] text-[#5B3A63]">
            <LockKeyhole className="size-6" />
          </span>
          <h1 className="mt-4 font-heading text-4xl text-[#2F2433]">
            Entrar al panel
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#7B6A80]">
            Usa un usuario creado en Supabase Auth para gestionar citas y
            adopciones.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#5B3A63]">
              Email
            </span>
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="h-12 rounded-2xl border-[#E8D6DE] bg-[#FFFDFB]"
              placeholder="admin@email.com"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#5B3A63]">
              Password
            </span>
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="h-12 rounded-2xl border-[#E8D6DE] bg-[#FFFDFB]"
              placeholder="••••••••"
            />
          </label>
          <Button
            disabled={isLoading}
            className="mt-2 h-12 rounded-full bg-[#A7353F] text-[#FFFDFB] hover:bg-[#8E2D36]"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            Entrar
          </Button>
        </form>
      </div>
    </main>
  );
}
