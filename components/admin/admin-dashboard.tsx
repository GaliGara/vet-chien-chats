"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CalendarClock,
  CalendarPlus,
  MessageCircle,
  PawPrint,
  PhoneCall,
} from "lucide-react";
import type { AdminStats, Appointment } from "@/types/database";
import { getAdminStats, getAppointments } from "@/lib/supabase-queries";
import { buildPhoneHref, buildWhatsAppUrl, formatDate } from "@/lib/format";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import { AdminShell } from "@/components/admin/admin-shell";
import { AppointmentStatusBadge } from "@/components/admin/status-badge";
import { AdminNotice } from "@/components/admin/admin-notice";
import { Button } from "@/components/ui/button";

const emptyStats: AdminStats = {
  newAppointments: 0,
  confirmedToday: 0,
  upcomingAppointments: 0,
  availableAdoptions: 0,
};

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getAdminStats(),
      getAppointments({ throwOnError: true }),
    ])
      .then(([nextStats, nextAppointments]) => {
        if (!isMounted) return;
        setStats(nextStats);
        setAppointments(nextAppointments);
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(getSupabaseErrorMessage(error));
        setAppointments([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const { upcomingConfirmed, newRequests } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const confirmed = appointments
      .filter(
        (appointment) =>
          appointment.status === "confirmada" &&
          appointment.preferred_date >= today
      )
      .slice(0, 6);
    const pending = appointments
      .filter((appointment) => appointment.status === "nueva")
      .slice(0, 6);

    return { upcomingConfirmed: confirmed, newRequests: pending };
  }, [appointments]);

  return (
    <AdminShell
      title="Resumen"
      description="Gestion diaria para confirmar solicitudes y seguir la agenda de Chiens et Chats."
    >
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatCard
          label="Nuevas por confirmar"
          value={stats.newAppointments}
          detail="Solicitudes pendientes"
          icon={CalendarPlus}
          loading={isLoading}
        />
        <StatCard
          label="Confirmadas hoy"
          value={stats.confirmedToday}
          detail="Agenda del dia"
          icon={CalendarCheck2}
          loading={isLoading}
        />
        <StatCard
          label="Proximas citas"
          value={stats.upcomingAppointments}
          detail="Confirmadas futuras"
          icon={CalendarClock}
          loading={isLoading}
        />
        <StatCard
          label="Adopciones disponibles"
          value={stats.availableAdoptions}
          detail="Perfiles activos"
          icon={PawPrint}
          loading={isLoading}
        />
      </div>

      {errorMessage ? (
        <div className="mt-4">
          <AdminNotice title="No se pudo cargar el resumen" text={errorMessage} />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <section className="rounded-[1.2rem] border border-[#E8D6DE] bg-white p-3.5 shadow-[0_12px_30px_rgb(91_58_99/0.07)]">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="font-heading text-[1.5rem] leading-none text-[#2F2433]">
              Citas agendadas
            </h2>
            <Button
              asChild
              variant="outline"
              className="h-8 rounded-full border-[#E8D6DE] px-3 text-xs text-[#5B3A63]"
            >
              <Link href="/admin/citas?status=confirmada">Ver todo</Link>
            </Button>
          </div>
          <div className="grid gap-2">
            {isLoading ? (
              <>
                <SkeletonLine />
                <SkeletonLine />
              </>
            ) : upcomingConfirmed.length > 0 ? (
              upcomingConfirmed.map((appointment) => (
                <AgendaCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <SmallEmpty text="No hay citas confirmadas proximas por ahora." />
            )}
          </div>
        </section>

        <section className="rounded-[1.2rem] border border-[#E8D6DE] bg-white p-3.5 shadow-[0_12px_30px_rgb(91_58_99/0.07)]">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="font-heading text-[1.5rem] leading-none text-[#2F2433]">
              Nuevas solicitudes
            </h2>
            <Button
              asChild
              variant="outline"
              className="h-8 rounded-full border-[#E8D6DE] px-3 text-xs text-[#5B3A63]"
            >
              <Link href="/admin/citas">Revisar</Link>
            </Button>
          </div>
          <div className="grid gap-2">
            {isLoading ? (
              <>
                <SkeletonLine />
                <SkeletonLine />
              </>
            ) : newRequests.length > 0 ? (
              newRequests.map((appointment) => (
                <AgendaCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <SmallEmpty text="No hay solicitudes nuevas pendientes." />
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof CalendarPlus;
  loading: boolean;
}) {
  return (
    <article className="rounded-[1rem] border border-[#E8D6DE] bg-white p-3 shadow-[0_10px_26px_rgb(91_58_99/0.06)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="grid size-7 place-items-center rounded-lg bg-[#FFF6F8] text-[#A7353F]">
          <Icon className="size-4" />
        </span>
      </div>
      {loading ? (
        <div className="h-7 w-14 animate-pulse rounded-full bg-[#F7F1FA]" />
      ) : (
        <p className="font-heading text-3xl leading-none text-[#2F2433]">{value}</p>
      )}
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#5B3A63]">
        {label}
      </p>
      <p className="mt-0.5 text-[11px] text-[#7B6A80]">{detail}</p>
    </article>
  );
}

function AgendaCard({ appointment }: { appointment: Appointment }) {
  const phoneHref = buildPhoneHref(appointment.phone);
  const canContactByPhone = Boolean(phoneHref);
  const whatsappMessage = `Hola ${appointment.client_name}, te contactamos de Chiens et Chats para confirmar tu cita ${appointment.preferred_date} ${appointment.preferred_time}.`;

  return (
    <article className="rounded-[0.95rem] border border-[#E8D6DE] bg-[#FFFDFB] p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#2F2433]">
            {appointment.client_name}
          </p>
          <p className="truncate text-xs text-[#7B6A80]">
            {appointment.pet_name} - {appointment.service}
          </p>
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-1 text-[11px] text-[#7B6A80]">
        <p>{formatDate(appointment.preferred_date)}</p>
        <p className="text-right">{appointment.preferred_time}</p>
        <p className="col-span-2 capitalize">{appointment.contact_channel}</p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <Button
          asChild
          variant="outline"
          className="h-8 rounded-full border-[#E8D6DE] px-2 text-xs text-[#5B3A63]"
        >
          <a
            href={buildWhatsAppUrl(appointment.phone, whatsappMessage)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          disabled={!canContactByPhone}
          className="h-8 rounded-full border-[#E8D6DE] px-2 text-xs text-[#5B3A63] disabled:opacity-45"
        >
          <a href={phoneHref || "#"}>
            <PhoneCall className="size-3.5" />
            Llamar
          </a>
        </Button>
      </div>
    </article>
  );
}

function SkeletonLine() {
  return <div className="h-24 animate-pulse rounded-[0.95rem] bg-[#FFF6F8]" />;
}

function SmallEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-[0.95rem] border border-dashed border-[#D9C6E8] bg-[#F7F1FA]/55 p-4 text-sm text-[#7B6A80]">
      {text}
    </div>
  );
}
