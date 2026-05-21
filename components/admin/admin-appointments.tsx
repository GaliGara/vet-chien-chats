"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  appointmentStatusLabels,
  appointmentStatusOptions,
} from "@/constants/site";
import type { Appointment, AppointmentStatus } from "@/types/database";
import {
  getAppointments,
  updateAppointmentStatus,
} from "@/lib/supabase-queries";
import { buildWhatsAppUrl, formatDate, formatDateTime } from "@/lib/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { AppointmentStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";

export function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<AppointmentStatus | "todas">("todas");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadAppointments() {
    setIsLoading(true);
    const data = await getAppointments();
    setAppointments(data);
    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    getAppointments()
      .then((data) => {
        if (isMounted) setAppointments(data);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAppointments = useMemo(() => {
    if (filter === "todas") return appointments;
    return appointments.filter((appointment) => appointment.status === filter);
  }, [appointments, filter]);

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setUpdatingId(id);
    try {
      const updated = await updateAppointmentStatus(id, status);
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === id ? { ...appointment, ...updated } : appointment
        )
      );
      toast.success("Status actualizado");
    } catch (error) {
      toast.error("No se pudo actualizar", {
        description:
          error instanceof Error ? error.message : "Revisa tus policies de Supabase.",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminShell
      title="Citas"
      description="Gestiona solicitudes como cards legibles desde celular, filtra por estado y confirma avances rapidamente."
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["todas", ...appointmentStatusOptions] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`min-w-fit rounded-full border px-4 py-2 text-sm font-semibold transition ${
                filter === status
                  ? "border-[#A7353F] bg-[#A7353F] text-[#FFFDFB]"
                  : "border-[#E8D6DE] bg-white text-[#5B3A63] hover:bg-[#FFF6F8]"
              }`}
            >
              {status === "todas" ? "Todas" : appointmentStatusLabels[status]}
            </button>
          ))}
        </div>
        <Button
          type="button"
          onClick={loadAppointments}
          variant="outline"
          className="h-10 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63]"
        >
          <RefreshCw className="size-4" />
          Actualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-[1.75rem] bg-[#FFF6F8]"
            />
          ))}
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              updating={updatingId === appointment.id}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-[#D9C6E8] bg-[#F7F1FA]/70 p-8 text-center text-[#7B6A80]">
          No hay citas para este filtro.
        </div>
      )}
    </AdminShell>
  );
}

function AppointmentCard({
  appointment,
  updating,
  onStatusChange,
}: {
  appointment: Appointment;
  updating: boolean;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}) {
  const whatsappMessage = `Hola ${appointment.client_name}, te contactamos de Chiens & Chats sobre tu cita para ${appointment.pet_name} el ${appointment.preferred_date} a las ${appointment.preferred_time}.`;

  return (
    <article className="rounded-[1.75rem] border border-[#E8D6DE] bg-white p-5 shadow-[0_16px_44px_rgb(91_58_99/0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate font-heading text-3xl text-[#2F2433]">
            {appointment.client_name}
          </h2>
          <p className="mt-1 text-sm text-[#7B6A80]">
            {appointment.pet_name} · {appointment.pet_type}
          </p>
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-[#7B6A80]">
        <InfoLine icon={Phone} text={appointment.phone} />
        {appointment.email ? <InfoLine icon={Mail} text={appointment.email} /> : null}
        <InfoLine icon={CalendarDays} text={`${formatDate(appointment.preferred_date)} · ${appointment.preferred_time}`} />
      </div>

      <div className="mt-5 rounded-[1.3rem] bg-[#FFF6F8] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A7353F]">
          Servicio
        </p>
        <p className="mt-1 font-semibold text-[#2F2433]">
          {appointment.service}
        </p>
        {appointment.message ? (
          <p className="mt-3 text-sm leading-6 text-[#7B6A80]">
            {appointment.message}
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-[#7B6A80]">
        <div>
          <p className="font-semibold uppercase tracking-[0.14em] text-[#5B3A63]">
            Canal
          </p>
          <p className="mt-1 capitalize">{appointment.contact_channel}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-[0.14em] text-[#5B3A63]">
            Registro
          </p>
          <p className="mt-1">{formatDateTime(appointment.created_at)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <select
          value={appointment.status}
          disabled={updating}
          onChange={(event) =>
            onStatusChange(appointment.id, event.target.value as AppointmentStatus)
          }
          className="h-11 rounded-full border border-[#E8D6DE] bg-[#FFFDFB] px-4 text-sm font-semibold text-[#5B3A63] focus-visible:ring-3 focus-visible:ring-[#DFA2BA]/45"
        >
          {appointmentStatusOptions.map((status) => (
            <option key={status} value={status}>
              {appointmentStatusLabels[status]}
            </option>
          ))}
        </select>
        {appointment.phone ? (
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63] hover:bg-[#FFF6F8]"
          >
            <a
              href={buildWhatsAppUrl(appointment.phone, whatsappMessage)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function InfoLine({
  icon: Icon,
  text,
}: {
  icon: typeof Phone;
  text: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0 text-[#A7353F]" />
      <span className="truncate">{text}</span>
    </span>
  );
}
