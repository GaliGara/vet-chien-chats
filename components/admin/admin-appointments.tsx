"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Edit3,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  PhoneCall,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  appointmentServiceOptions,
  appointmentStatusLabels,
  appointmentStatusOptions,
  brand,
} from "@/constants/site";
import type {
  Appointment,
  AppointmentInsert,
  AppointmentStatus,
  ContactChannel,
} from "@/types/database";
import {
  createAppointment,
  getAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "@/lib/supabase-queries";
import {
  buildPhoneHref,
  buildWhatsAppUrl,
  formatDate,
  formatDateTime,
} from "@/lib/format";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AppointmentStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const appointmentAdminSchema = z.object({
  client_name: z.string().min(2, "Escribe el nombre del cliente."),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^[+()\d\s-]{6,}$/.test(value),
      "Si agregas telefono, usa numeros, espacios o +."
    ),
  email: z
    .union([z.string().email("Agrega un email valido."), z.literal("")])
    .optional(),
  pet_name: z.string().min(2, "Agrega el nombre de la mascota."),
  pet_type: z.string().min(1, "Selecciona el tipo de mascota."),
  service: z.string().min(1, "Selecciona un servicio."),
  preferred_date: z.string().min(1, "Elige una fecha."),
  preferred_time: z.string().optional(),
  contact_channel: z.enum(["whatsapp", "telefono", "email"]),
  status: z.enum(["nueva", "confirmada", "cancelada", "atendida"]),
  message: z.string().max(600, "Maximo 600 caracteres.").optional(),
});

type AppointmentAdminValues = z.infer<typeof appointmentAdminSchema>;

const emptyAppointmentValues: AppointmentAdminValues = {
  client_name: "",
  phone: "",
  email: "",
  pet_name: "",
  pet_type: "Perro",
  service: "Consulta medica",
  preferred_date: "",
  preferred_time: "",
  contact_channel: "whatsapp",
  status: "nueva",
  message: "",
};

export function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<AppointmentStatus | "todas">("todas");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  async function loadAppointments() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getAppointments({ throwOnError: true });
      setAppointments(data);
    } catch (error) {
      setAppointments([]);
      setErrorMessage(getSupabaseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    getAppointments({ throwOnError: true })
      .then((data) => {
        if (isMounted) setAppointments(data);
      })
      .catch((error) => {
        if (isMounted) {
          setAppointments([]);
          setErrorMessage(getSupabaseErrorMessage(error));
        }
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

  function openCreateDialog() {
    setEditingAppointment(null);
    setDialogOpen(true);
  }

  function openEditDialog(appointment: Appointment) {
    setEditingAppointment(appointment);
    setDialogOpen(true);
  }

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
        description: getSupabaseErrorMessage(error),
      });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSaved(saved?: Appointment) {
    if (saved) {
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === saved.id ? saved : appointment
        )
      );
    } else {
      await loadAppointments();
    }
    setDialogOpen(false);
  }

  return (
    <AdminShell
      title="Citas"
      description="Gestiona solicitudes como cards compactas desde celular y actualiza estado rapidamente."
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["todas", ...appointmentStatusOptions] as const).map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={filter === status}
              onClick={() => setFilter(status)}
              className={`min-w-fit rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                filter === status
                  ? "border-[#A7353F] bg-[#A7353F] text-[#FFFDFB]"
                  : "border-[#E8D6DE] bg-white text-[#5B3A63] hover:bg-[#FFF6F8]"
              }`}
            >
              {status === "todas" ? "Todas" : appointmentStatusLabels[status]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            type="button"
            onClick={loadAppointments}
            variant="outline"
            className="h-10 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63]"
          >
            <RefreshCw className="size-4" />
            Actualizar
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                onClick={openCreateDialog}
                className="h-10 rounded-full bg-[#A7353F] text-[#FFFDFB] hover:bg-[#8E2D36]"
              >
                <Plus className="size-4" />
                Nueva cita
              </Button>
            </DialogTrigger>
            <DialogContent className="h-[min(90dvh,780px)] overflow-hidden rounded-[2rem] border-[#E8D6DE] bg-[#FFFDFB] p-0 sm:max-w-2xl">
              <DialogHeader className="border-b border-[#E8D6DE] bg-[#FFFDFB] px-5 pb-3 pt-5">
                <DialogTitle className="font-heading text-3xl text-[#2F2433]">
                  {editingAppointment ? "Editar cita" : "Nueva cita"}
                </DialogTitle>
                <DialogDescription className="text-sm text-[#7B6A80]">
                  Registra una cita manual con lo esencial y completa el resto luego.
                </DialogDescription>
              </DialogHeader>
              <div className="modal-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-5">
                <AppointmentAdminForm
                  key={editingAppointment?.id ?? "new"}
                  appointment={editingAppointment}
                  onSaved={handleSaved}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-[1.25rem] bg-[#FFF6F8]"
            />
          ))}
        </div>
      ) : errorMessage ? (
        <AdminNotice
          title="No se pudieron cargar las citas"
          text={errorMessage}
        />
      ) : filteredAppointments.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              updating={updatingId === appointment.id}
              onEdit={openEditDialog}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <AdminNotice
          title="Sin citas por ahora"
          text="Cuando llegue una solicitud o crees una cita manual, aparecera aqui."
        />
      )}
    </AdminShell>
  );
}

function AppointmentCard({
  appointment,
  updating,
  onEdit,
  onStatusChange,
}: {
  appointment: Appointment;
  updating: boolean;
  onEdit: (appointment: Appointment) => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}) {
  const hasCallablePhone = Boolean(buildPhoneHref(appointment.phone));
  const whatsappMessage = `Hola ${appointment.client_name}, te contactamos de ${brand.name} sobre tu cita para ${appointment.pet_name} el ${appointment.preferred_date} a las ${appointment.preferred_time}. Servicio: ${appointment.service}.`;
  const phoneHref = buildPhoneHref(appointment.phone);

  return (
    <article className="rounded-[1.3rem] border border-[#E8D6DE] bg-white p-4 shadow-[0_12px_30px_rgb(91_58_99/0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-heading text-2xl leading-tight text-[#2F2433]">
            {appointment.client_name}
          </h2>
          <p className="mt-0.5 text-sm text-[#7B6A80]">
            {appointment.pet_name} · {appointment.pet_type}
          </p>
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <div className="mt-3 grid gap-2 text-sm text-[#7B6A80]">
        {hasCallablePhone ? <InfoLine icon={Phone} text={appointment.phone} /> : null}
        {appointment.email ? <InfoLine icon={Mail} text={appointment.email} /> : null}
        <InfoLine
          icon={CalendarDays}
          text={`${formatDate(appointment.preferred_date)} · ${appointment.preferred_time}`}
        />
      </div>

      <div className="mt-3 rounded-[1rem] bg-[#FFF6F8] p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A7353F]">
          Servicio
        </p>
        <p className="mt-1 text-sm font-semibold text-[#2F2433]">
          {appointment.service}
        </p>
        {appointment.message ? (
          <p className="mt-2 text-sm leading-6 text-[#7B6A80]">
            {appointment.message}
          </p>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#7B6A80]">
        <div>
          <p className="font-semibold uppercase tracking-[0.12em] text-[#5B3A63]">
            Canal
          </p>
          <p className="mt-1 capitalize">{appointment.contact_channel}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-[0.12em] text-[#5B3A63]">
            Registro
          </p>
          <p className="mt-1">{formatDateTime(appointment.created_at)}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <select
          aria-label={`Cambiar status de cita de ${appointment.client_name}`}
          value={appointment.status}
          disabled={updating}
          onChange={(event) =>
            onStatusChange(appointment.id, event.target.value as AppointmentStatus)
          }
          className="h-10 rounded-full border border-[#E8D6DE] bg-[#FFFDFB] px-3 text-sm font-semibold text-[#5B3A63] focus-visible:ring-3 focus-visible:ring-[#DFA2BA]/45"
        >
          {appointmentStatusOptions.map((status) => (
            <option key={status} value={status}>
              {appointmentStatusLabels[status]}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          onClick={() => onEdit(appointment)}
          className="h-10 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63] hover:bg-[#FFF6F8]"
        >
          <Edit3 className="size-4" />
          Editar
        </Button>
        {hasCallablePhone ? (
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63] hover:bg-[#FFF6F8]"
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
        ) : (
          <span />
        )}
        {phoneHref ? (
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63] hover:bg-[#FFF6F8]"
          >
            <a href={phoneHref}>
              <PhoneCall className="size-4" />
              Llamar
            </a>
          </Button>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}

function AppointmentAdminForm({
  appointment,
  onSaved,
}: {
  appointment: Appointment | null;
  onSaved: (saved?: Appointment) => void | Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AppointmentAdminValues>({
    resolver: zodResolver(appointmentAdminSchema),
    defaultValues: appointment
      ? {
          client_name: appointment.client_name,
          phone: appointment.phone === "No proporcionado" ? "" : appointment.phone,
          email: appointment.email ?? "",
          pet_name: appointment.pet_name,
          pet_type: appointment.pet_type,
          service: appointment.service,
          preferred_date: appointment.preferred_date,
          preferred_time:
            appointment.preferred_time === "Por confirmar"
              ? ""
              : appointment.preferred_time,
          contact_channel: appointment.contact_channel,
          status: appointment.status,
          message: appointment.message ?? "",
        }
      : emptyAppointmentValues,
  });

  async function onSubmit(values: AppointmentAdminValues) {
    const normalizedPhone = values.phone?.trim() || "";
    const normalizedEmail = values.email?.trim() || "";
    const preferredTime = values.preferred_time?.trim() || "Por confirmar";

    const payload: AppointmentInsert = {
      client_name: values.client_name.trim(),
      phone: normalizedPhone || "No proporcionado",
      email: normalizedEmail || null,
      pet_name: values.pet_name.trim(),
      pet_type: values.pet_type,
      service: values.service,
      preferred_date: values.preferred_date,
      preferred_time: preferredTime,
      message: values.message?.trim() || null,
      contact_channel: values.contact_channel as ContactChannel,
      status: values.status,
    };

    setIsSaving(true);
    try {
      if (appointment) {
        const updated = await updateAppointment(appointment.id, payload);
        toast.success("Cita actualizada");
        await onSaved(updated);
      } else {
        await createAppointment(payload);
        toast.success("Cita creada");
        await onSaved();
      }
      const advisory = getAdminContactAdvisory(
        values.contact_channel,
        normalizedPhone,
        normalizedEmail
      );
      if (advisory) {
        toast.info(advisory);
      }
    } catch (error) {
      toast.error("No se pudo guardar", {
        description: getSupabaseErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 pb-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nombre del cliente" error={errors.client_name?.message}>
          <Input
            {...register("client_name")}
            className="h-12 rounded-2xl border-[#E8D6DE] bg-white"
          />
        </FormField>
        <FormField label="Telefono opcional" error={errors.phone?.message}>
          <Input
            {...register("phone")}
            inputMode="tel"
            className="h-12 rounded-2xl border-[#E8D6DE] bg-white"
          />
        </FormField>
        <FormField label="Correo opcional" error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            className="h-12 rounded-2xl border-[#E8D6DE] bg-white"
          />
        </FormField>
        <FormField label="Nombre de mascota" error={errors.pet_name?.message}>
          <Input
            {...register("pet_name")}
            className="h-12 rounded-2xl border-[#E8D6DE] bg-white"
          />
        </FormField>
        <FormField label="Tipo de mascota" error={errors.pet_type?.message}>
          <select
            {...register("pet_type")}
            className="h-12 w-full rounded-2xl border border-[#E8D6DE] bg-white px-3 text-sm text-[#2F2433]"
          >
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Otro">Otro</option>
          </select>
        </FormField>
        <FormField label="Servicio" error={errors.service?.message}>
          <select
            {...register("service")}
            className="h-12 w-full rounded-2xl border border-[#E8D6DE] bg-white px-3 text-sm text-[#2F2433]"
          >
            {appointmentServiceOptions.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Fecha preferida" error={errors.preferred_date?.message}>
          <Input
            {...register("preferred_date")}
            type="date"
            className="h-12 rounded-2xl border-[#E8D6DE] bg-white"
          />
        </FormField>
        <FormField label="Hora preferida (opcional)" error={errors.preferred_time?.message}>
          <Input
            {...register("preferred_time")}
            type="time"
            className="h-12 rounded-2xl border-[#E8D6DE] bg-white"
          />
        </FormField>
        <FormField label="Canal de contacto" error={errors.contact_channel?.message}>
          <select
            {...register("contact_channel")}
            className="h-12 w-full rounded-2xl border border-[#E8D6DE] bg-white px-3 text-sm text-[#2F2433]"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="telefono">Telefono</option>
            <option value="email">Email</option>
          </select>
        </FormField>
        <FormField label="Status" error={errors.status?.message}>
          <select
            {...register("status")}
            className="h-12 w-full rounded-2xl border border-[#E8D6DE] bg-white px-3 text-sm text-[#2F2433]"
          >
            {appointmentStatusOptions.map((status) => (
              <option key={status} value={status}>
                {appointmentStatusLabels[status]}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Mensaje o notas" error={errors.message?.message}>
        <Textarea
          {...register("message")}
          className="min-h-24 rounded-2xl border-[#E8D6DE] bg-white"
        />
      </FormField>
      <p className="text-xs leading-5 text-[#7B6A80]">
        Telefono y correo son opcionales en captura manual. Si falta el dato del
        canal elegido, podras completarlo despues.
      </p>
      <div className="sticky bottom-0 z-10 bg-[#FFFDFB] pt-1">
        <Button
          disabled={isSaving}
          className="h-12 w-full rounded-full bg-[#A7353F] text-[#FFFDFB] hover:bg-[#8E2D36]"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
          {appointment ? "Guardar cambios" : "Crear cita"}
        </Button>
      </div>
    </form>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-[#5B3A63]">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-2 block text-xs font-medium text-[#A7353F]">
          {error}
        </span>
      ) : null}
    </label>
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

function getAdminContactAdvisory(
  channel: ContactChannel,
  phone: string,
  email: string
) {
  if (channel === "whatsapp" && !phone) {
    return "Tip: agrega telefono para facilitar confirmacion por WhatsApp.";
  }
  if (channel === "telefono" && !phone) {
    return "Tip: agrega telefono para poder llamar y confirmar.";
  }
  if (channel === "email" && !email) {
    return "Tip: agrega correo para confirmar por email.";
  }
  return "";
}
