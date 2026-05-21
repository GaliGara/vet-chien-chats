"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  BriefcaseBusiness,
  CalendarDays,
  Heart,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  PawPrint,
  ShieldCheck,
} from "lucide-react";
import { brand } from "@/constants/site";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { label: "Resumen", href: "/admin", icon: LayoutDashboard },
  { label: "Citas", href: "/admin/citas", icon: CalendarDays },
  { label: "Adopciones", href: "/admin/adopciones", icon: PawPrint },
  { label: "Servicios", href: "/admin/servicios", icon: BriefcaseBusiness },
];

type AdminShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AdminShell({ title, description, children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isPreview, setIsPreview] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("admin-preview") === "true"
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    window.localStorage.removeItem("admin-preview");
    setIsPreview(false);
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  function continuePreview() {
    window.localStorage.setItem("admin-preview", "true");
    setIsPreview(true);
  }

  const hasAccess = Boolean(session || isPreview);

  return (
    <div className="min-h-screen bg-[#FFFDFB]">
      <header className="sticky top-0 z-40 border-b border-[#E8D6DE] bg-[#FFFDFB]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-[#FFF6F8] text-[#A7353F] ring-1 ring-[#E8D6DE]">
              <Heart className="size-4 fill-[#F7C8D9]" />
            </span>
            <span className="font-heading text-xl text-[#2F2433]">
              {brand.name}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {isPreview ? (
              <span className="rounded-full border border-[#D9C6E8] bg-[#F7F1FA] px-3 py-1 text-xs font-semibold text-[#5B3A63]">
                Revisión local
              </span>
            ) : null}
            {hasAccess ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="rounded-full border-[#E8D6DE] bg-white text-[#5B3A63]"
              >
                <LogOut className="size-4" />
                Salir
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="rounded-full bg-[#A7353F] text-[#FFFDFB] hover:bg-[#8E2D36]"
              >
                <Link href="/admin/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
        {hasAccess ? (
          <nav
            className="mx-auto hidden max-w-6xl gap-2 overflow-x-auto px-4 pb-3 sm:flex sm:px-6"
            aria-label="Admin"
          >
            <AdminNav pathname={pathname} />
          </nav>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 sm:pb-8">
        {isLoading ? (
          <div className="rounded-[2rem] border border-[#E8D6DE] bg-white p-8">
            <div className="h-6 w-44 animate-pulse rounded-full bg-[#F7F1FA]" />
            <div className="mt-4 h-4 w-64 animate-pulse rounded-full bg-[#FFF6F8]" />
          </div>
        ) : hasAccess ? (
          <>
            <div className="mb-6">
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E8D6DE] bg-[#FFF6F8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#A7353F]">
                <ShieldCheck className="size-3.5" />
                Panel admin
              </p>
              <h1 className="font-heading text-4xl leading-tight text-[#2F2433] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7B6A80]">
                {description}
              </p>
            </div>
            {children}
          </>
        ) : (
          <div className="mx-auto max-w-xl rounded-[2rem] border border-[#E8D6DE] bg-white p-7 text-center shadow-[0_20px_60px_rgb(91_58_99/0.10)]">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#FFF6F8] text-[#A7353F]">
              <LockKeyhole className="size-7" />
            </span>
            <h1 className="mt-5 font-heading text-4xl text-[#2F2433]">
              Acceso admin
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#7B6A80]">
              Inicia sesión con Supabase Auth. Si aún no configuraste usuarios,
              puedes abrir una revisión local para validar la interfaz.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                asChild
                className="h-12 rounded-full bg-[#A7353F] text-[#FFFDFB] hover:bg-[#8E2D36]"
              >
                <Link href="/admin/login">Iniciar sesión</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={continuePreview}
                className="h-12 rounded-full border-[#E8D6DE] text-[#5B3A63] hover:bg-[#FFF6F8]"
              >
                Revisión local
              </Button>
            </div>
          </div>
        )}
      </main>

      {hasAccess ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8D6DE] bg-[#FFFDFB]/94 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_40px_rgb(91_58_99/0.10)] backdrop-blur-xl sm:hidden"
          aria-label="Admin móvil"
        >
          <AdminNav pathname={pathname} compact />
        </nav>
      ) : null}
    </div>
  );
}

function AdminNav({
  pathname,
  compact = false,
}: {
  pathname: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex gap-2", compact && "grid grid-cols-4")}>
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex min-w-fit items-center justify-center gap-2 rounded-full border font-semibold transition focus-visible:ring-3 focus-visible:ring-[#DFA2BA]/45",
              compact
                ? "min-w-0 flex-col gap-1 px-2 py-2 text-[0.68rem]"
                : "px-4 py-2 text-sm",
              isActive
                ? "border-[#A7353F] bg-[#A7353F] text-[#FFFDFB]"
                : "border-[#E8D6DE] bg-white text-[#5B3A63] hover:bg-[#FFF6F8]"
            )}
          >
            <Icon className={cn("size-4", compact && "size-4")} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
