"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Heart,
  LayoutDashboard,
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
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess(nextSession?: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) {
      const currentSession =
        nextSession ?? (await supabase.auth.getSession()).data.session;

      if (!isMounted) return;

      if (!currentSession) {
        setHasAccess(false);
        setIsLoading(false);
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const { data, error } = await supabase.rpc("is_app_admin");
      if (!isMounted) return;

      if (error) {
        setHasAccess(false);
        setIsLoading(false);
        router.replace("/admin/login?reason=forbidden");
        return;
      }

      if (!data) {
        await supabase.auth.signOut();
        if (!isMounted) return;
        setHasAccess(false);
        setIsLoading(false);
        router.replace("/admin/login?reason=forbidden");
        return;
      }

      setHasAccess(true);
      setIsLoading(false);
    }

    verifyAccess().catch(() => {
      if (!isMounted) return;
      setHasAccess(false);
      setIsLoading(false);
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      verifyAccess(nextSession).catch(() => {
        if (!isMounted) return;
        setHasAccess(false);
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setHasAccess(false);
    router.replace("/admin/login");
  }

  if (!isLoading && !hasAccess) {
    return null;
  }

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
            ) : null}
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

      <main className="mx-auto max-w-6xl px-4 py-5 pb-24 sm:px-6 sm:pb-8">
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
              <h1 className="font-heading text-3xl leading-tight text-[#2F2433] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7B6A80]">
                {description}
              </p>
            </div>
            {children}
          </>
        ) : null}
      </main>

      {hasAccess ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8D6DE] bg-[#FFFDFB]/92 px-2.5 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-10px_24px_rgb(91_58_99/0.09)] backdrop-blur-xl sm:hidden"
          aria-label="Admin movil"
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
                ? "min-w-0 flex-col gap-0.5 px-1.5 py-1.5 text-[0.62rem]"
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
