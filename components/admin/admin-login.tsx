"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Heart, Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { brand } from "@/constants/site";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const welcomeMessages = [
  "Que hoy sea un dia tranquilo, claro y bonito.",
  "Respira profundo; todo puede ir paso a paso.",
  "Hoy tambien mereces hacer las cosas con calma.",
  "Que encuentres momentos ligeros entre todo lo importante.",
  "Un dia organizado tambien puede sentirse suave.",
  "Estas aqui, y eso ya es un buen comienzo.",
  "Que tu dia tenga claridad, paciencia y pequenos respiros.",
  "Hazlo con calma; no todo tiene que resolverse de golpe.",
  "Que hoy te acompanhe una energia amable y serena.",
] as const;

export function AdminLogin() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string>(welcomeMessages[0]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
      setWelcomeMessage(welcomeMessages[randomIndex]);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (response.status === 401) {
        toast.error("Usuario o contraseña incorrectos.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        toast.error("No pudimos iniciar sesion");
        setIsLoading(false);
        return;
      }

      const payload = (await response.json()) as {
        session?: { access_token: string; refresh_token: string };
      };

      if (!payload.session?.access_token || !payload.session?.refresh_token) {
        toast.error("No pudimos iniciar sesion");
        setIsLoading(false);
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: payload.session.access_token,
        refresh_token: payload.session.refresh_token,
      });

      setIsLoading(false);

      if (sessionError) {
        toast.error("No pudimos iniciar sesion", {
          description: sessionError.message,
        });
        return;
      }

      toast.success("Sesion iniciada");
      router.push("/admin");
    } catch {
      setIsLoading(false);
      toast.error("No pudimos iniciar sesion");
      return;
    }
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
            Bienvenida, Lizeth
          </h1>
          <motion.p
            key={welcomeMessage}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-2 text-sm leading-6 text-[#7B6A80]"
          >
            {welcomeMessage}
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#5B3A63]">
              Usuario
            </span>
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              type="text"
              required
              className="h-12 rounded-2xl border-[#E8D6DE] bg-[#FFFDFB]"
              placeholder="lizeth"
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
              placeholder="********"
            />
          </label>
          <Button
            disabled={isLoading}
            className="mt-2 h-12 rounded-full bg-[#A7353F] text-[#FFFDFB] hover:bg-[#8E2D36]"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            Iniciar sesion
          </Button>
          <Button
            asChild
            type="button"
            variant="ghost"
            className="h-11 rounded-full text-[#5B3A63] hover:bg-[#FFF6F8]"
          >
            <Link href="/">
              <ArrowLeft className="size-4" />
              Volver al sitio
            </Link>
          </Button>
        </form>
      </div>
    </main>
  );
}
