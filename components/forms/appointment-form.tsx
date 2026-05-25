"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { appointmentServiceOptions, brand } from "@/constants/site";
import {
  APPOINTMENT_TIME_SLOTS,
  formatTimeSlotLabel,
  normalizeTimeSlot,
} from "@/lib/appointment-slots";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import { buildWhatsAppUrl } from "@/lib/format";
import type { AppointmentInsert, ContactChannel } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const appointmentSchema = z
  .object({
    client_name: z.string().min(2, "Escribe tu nombre completo."),
    phone: z.string().trim().optional(),
    email: z
      .union([z.string().email("Agrega un email valido."), z.literal("")])
      .optional(),
    pet_name: z.string().min(2, "Cuentanos el nombre de tu mascota."),
    pet_type: z.string().min(1, "Selecciona el tipo de mascota."),
    service: z.string().min(1, "Selecciona un servicio."),
    preferred_date: z.string().min(1, "Elige una fecha."),
    preferred_time: z.string().min(1, "Elige una hora."),
    contact_channel: z.enum(["whatsapp", "telefono", "email"], {
      message: "Selecciona un canal de contacto.",
    }),
    message: z.string().max(600, "Maximo 600 caracteres.").optional(),
  })
  .superRefine((values, context) => {
    const phone = values.phone?.trim() || "";
    const email = values.email?.trim() || "";

    if (phone && !/^[+()\d\s-]{6,}$/.test(phone)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Si agregas telefono, usa numeros, espacios o +.",
        path: ["phone"],
      });
    }

    if (values.contact_channel === "email" && !email) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Para elegir contacto por correo, agrega tu email.",
        path: ["email"],
      });
    }

    if (
      (values.contact_channel === "whatsapp" ||
        values.contact_channel === "telefono") &&
      !phone
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Para este canal, agrega un telefono.",
        path: ["phone"],
      });
    }
  });

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const defaultValues: AppointmentFormValues = {
  client_name: "",
  phone: "",
  email: "",
  pet_name: "",
  pet_type: "",
  service: "",
  preferred_date: "",
  preferred_time: "",
  contact_channel: "whatsapp",
  message: "",
};

type SubmitSummary = {
  channel: ContactChannel;
  whatsappUrl: string;
  emailProvided: boolean;
};

type EmailNotificationResult = "sent" | "not_configured" | "failed";
type CreateAppointmentApiResponse = {
  ok: boolean;
  message?: string;
  email_status?: EmailNotificationResult;
};

export function AppointmentForm() {
  const [submitSummary, setSubmitSummary] = useState<SubmitSummary | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues,
  });

  const watchedValues = useWatch({ control });
  const selectedDate = watchedValues.preferred_date ?? "";
  const selectedTime = watchedValues.preferred_time ?? "";
  const selectedChannel = watchedValues.contact_channel ?? "whatsapp";

  const bookedSet = useMemo(() => new Set(bookedSlots), [bookedSlots]);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    let isMounted = true;

    async function loadAvailability() {
      if (!selectedDate) {
        setBookedSlots([]);
        setAvailabilityError("");
        return;
      }

      setIsLoadingAvailability(true);
      setAvailabilityError("");

      try {
        const response = await fetch(
          `/api/appointments/availability?date=${encodeURIComponent(selectedDate)}`,
          { method: "GET" }
        );

        if (!isMounted) return;

        if (!response.ok) {
          if (response.status === 503) {
            setBookedSlots([]);
            setAvailabilityError(
              "No pudimos validar disponibilidad en este momento. Aun puedes enviar tu solicitud."
            );
            return;
          }

          setBookedSlots([]);
          setAvailabilityError("No se pudo cargar disponibilidad de horarios.");
          return;
        }

        const payload = (await response.json()) as {
          booked_times?: string[];
        };

        const normalized = (payload.booked_times ?? [])
          .map((time) => normalizeTimeSlot(time))
          .filter((time): time is string => Boolean(time));

        setBookedSlots(normalized);
      } catch {
        if (!isMounted) return;
        setBookedSlots([]);
        setAvailabilityError(
          "No se pudo validar disponibilidad de horarios por ahora."
        );
      } finally {
        if (isMounted) {
          setIsLoadingAvailability(false);
        }
      }
    }

    loadAvailability();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTime && bookedSet.has(selectedTime)) {
      setValue("preferred_time", "", { shouldValidate: true });
    }
  }, [bookedSet, selectedTime, setValue]);

  async function onSubmit(values: AppointmentFormValues) {
    const normalizedPhone = values.phone?.trim() || "";
    const normalizedEmail = values.email?.trim() || "";
    const followUpWhatsAppUrl = buildWhatsAppUrl(
      normalizedPhone || undefined,
      [
        `Hola, acabo de enviar mi solicitud de cita en ${brand.name}.`,
        `Mi nombre es ${values.client_name}.`,
        `Mi mascota se llama ${values.pet_name}.`,
        `Servicio: ${values.service}.`,
        `Fecha preferida: ${values.preferred_date}.`,
        `Hora preferida: ${values.preferred_time}.`,
      ].join(" ")
    );

    const payload: AppointmentInsert = {
      client_name: values.client_name.trim(),
      phone: normalizedPhone || "No proporcionado",
      email: normalizedEmail || null,
      pet_name: values.pet_name.trim(),
      pet_type: values.pet_type,
      service: values.service,
      preferred_date: values.preferred_date,
      preferred_time: values.preferred_time,
      message: values.message?.trim() || null,
      contact_channel: values.contact_channel,
      status: "nueva",
    };

    try {
      const emailStatus = await createAppointmentRequest(payload);
      toast.success(
        "Cita registrada",
        buildChannelToastOptions(values.contact_channel, followUpWhatsAppUrl, emailStatus)
      );

      setSubmitSummary({
        channel: values.contact_channel,
        whatsappUrl: followUpWhatsAppUrl,
        emailProvided: Boolean(normalizedEmail),
      });
      reset(defaultValues);
      setBookedSlots([]);
      setAvailabilityError("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : getSupabaseErrorMessage(error);
      toast.error("No pudimos guardar la cita", {
        description: message,
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-[2rem] border border-[#E8D6DE] bg-white p-5 shadow-[0_24px_70px_rgb(91_58_99/0.10)] sm:p-7"
    >
      <div className="mb-6 flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#FFF6F8] text-[#A7353F]">
          <CalendarDays className="size-6" />
        </span>
        <div>
          <h3 className="font-heading text-3xl text-[#2F2433]">Reserva tu cita</h3>
          <p className="mt-1 text-sm leading-6 text-[#7B6A80]">
            Comparte los detalles y te confirmaremos por tu canal preferido.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" error={errors.client_name?.message}>
          <Input
            {...register("client_name")}
            aria-invalid={Boolean(errors.client_name)}
            autoComplete="name"
            className="h-12 rounded-2xl border-[#E8D6DE] bg-[#FFFDFB]"
            placeholder="Tu nombre"
          />
        </Field>
        <Field
          label={selectedChannel === "email" ? "Telefono opcional" : "Telefono"}
          error={errors.phone?.message}
        >
          <Input
            {...register("phone")}
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
            inputMode="tel"
            className="h-12 rounded-2xl border-[#E8D6DE] bg-[#FFFDFB]"
            placeholder="+52..."
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className="h-12 rounded-2xl border-[#E8D6DE] bg-[#FFFDFB]"
            placeholder="tu@email.com"
          />
        </Field>
        <Field label="Nombre de mascota" error={errors.pet_name?.message}>
          <Input
            {...register("pet_name")}
            aria-invalid={Boolean(errors.pet_name)}
            className="h-12 rounded-2xl border-[#E8D6DE] bg-[#FFFDFB]"
            placeholder="Nala"
          />
        </Field>
        <Field label="Tipo de mascota" error={errors.pet_type?.message}>
          <select
            {...register("pet_type")}
            aria-invalid={Boolean(errors.pet_type)}
            className="h-12 w-full rounded-2xl border border-[#E8D6DE] bg-[#FFFDFB] px-3 text-sm text-[#2F2433] focus-visible:ring-3 focus-visible:ring-[#DFA2BA]/45"
          >
            <option value="">Seleccionar</option>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Otro">Otro</option>
          </select>
        </Field>
        <Field label="Servicio" error={errors.service?.message}>
          <select
            {...register("service")}
            aria-invalid={Boolean(errors.service)}
            className="h-12 w-full rounded-2xl border border-[#E8D6DE] bg-[#FFFDFB] px-3 text-sm text-[#2F2433] focus-visible:ring-3 focus-visible:ring-[#DFA2BA]/45"
          >
            <option value="">Seleccionar</option>
            {appointmentServiceOptions.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha preferida" error={errors.preferred_date?.message}>
          <Input
            {...register("preferred_date")}
            type="date"
            min={today}
            aria-invalid={Boolean(errors.preferred_date)}
            className="h-12 rounded-2xl border-[#E8D6DE] bg-[#FFFDFB]"
          />
        </Field>
        <Field
          label="Hora preferida"
          error={errors.preferred_time?.message}
          hint={
            selectedDate
              ? isLoadingAvailability
                ? "Revisando horarios ocupados..."
                : availabilityError || "Elige un horario disponible."
              : "Primero selecciona la fecha."
          }
        >
          <select
            {...register("preferred_time")}
            aria-invalid={Boolean(errors.preferred_time)}
            disabled={!selectedDate}
            className="h-12 w-full rounded-2xl border border-[#E8D6DE] bg-[#FFFDFB] px-3 text-sm text-[#2F2433] disabled:cursor-not-allowed disabled:bg-[#F7F1FA]/65"
          >
            <option value="">
              {selectedDate ? "Seleccionar horario" : "Selecciona fecha primero"}
            </option>
            {APPOINTMENT_TIME_SLOTS.map((slot) => {
              const isBooked = bookedSet.has(slot);
              return (
                <option key={slot} value={slot} disabled={isBooked}>
                  {formatTimeSlotLabel(slot)}
                  {isBooked ? " - ocupado" : ""}
                </option>
              );
            })}
          </select>
        </Field>
        <Field label="Canal de contacto" error={errors.contact_channel?.message}>
          <select
            {...register("contact_channel")}
            aria-invalid={Boolean(errors.contact_channel)}
            className="h-12 w-full rounded-2xl border border-[#E8D6DE] bg-[#FFFDFB] px-3 text-sm text-[#2F2433] focus-visible:ring-3 focus-visible:ring-[#DFA2BA]/45"
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="telefono">Llamada</option>
            <option value="email">Email</option>
          </select>
        </Field>
        <Field
          label="Mensaje"
          error={errors.message?.message}
          className="sm:col-span-2"
        >
          <Textarea
            {...register("message")}
            aria-invalid={Boolean(errors.message)}
            className="min-h-28 rounded-2xl border-[#E8D6DE] bg-[#FFFDFB]"
            placeholder="Cuentanos si hay algun detalle importante..."
          />
        </Field>
      </div>

      <div className="mt-6 grid gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-full bg-[#A7353F] text-base text-[#FFFDFB] shadow-lg shadow-[#A7353F]/20 hover:bg-[#8E2D36]"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {isSubmitting ? "Guardando..." : "Enviar solicitud"}
        </Button>
        <p className="text-xs leading-5 text-[#7B6A80]">
          Tu cita se registra primero. Despues te mostraremos el siguiente paso
          por {selectedChannel === "email"
            ? "correo"
            : selectedChannel === "telefono"
              ? "llamada"
              : "WhatsApp"}
          .
        </p>
      </div>

      {submitSummary ? <ConfirmationBox summary={submitSummary} /> : null}
    </form>
  );
}

function ConfirmationBox({ summary }: { summary: SubmitSummary }) {
  const channelMessageMap: Record<ContactChannel, string> = {
    whatsapp:
      "Tu solicitud quedo registrada. Puedes continuar por WhatsApp para agilizar la confirmacion.",
    telefono:
      "Tu solicitud quedo registrada. Te contactaremos por llamada para confirmar.",
    email:
      "Tu solicitud quedo registrada. Te enviaremos la confirmacion por correo.",
  };

  return (
    <div className="mt-5 rounded-[1.5rem] border border-[#D9C6E8] bg-[#F7F1FA]/70 p-4 text-sm leading-6 text-[#5B3A63]">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#A7353F]" />
        <p>{channelMessageMap[summary.channel]}</p>
      </div>
      {summary.channel === "whatsapp" ? (
        <a
          href={summary.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex rounded-full bg-[#A7353F] px-4 py-2 font-semibold text-[#FFFDFB] shadow-md shadow-[#A7353F]/20 hover:bg-[#8E2D36]"
        >
          Continuar por WhatsApp
        </a>
      ) : null}
      {summary.channel === "email" && summary.emailProvided ? (
        <p className="mt-2 text-xs text-[#7B6A80]">
          Enviaremos copia al correo que registraste.
        </p>
      ) : null}
    </div>
  );
}

function buildChannelToastOptions(
  channel: ContactChannel,
  whatsappUrl: string,
  emailStatus: EmailNotificationResult
) {
  const emailHint =
    emailStatus === "sent"
      ? ""
      : " La cita se guardo, pero el correo automatico no pudo enviarse.";

  if (channel === "email") {
    return {
      description:
        "Te enviaremos confirmacion por correo." +
        (emailStatus === "sent" ? "" : emailHint),
    };
  }

  if (channel === "telefono") {
    return {
      description:
        "Te contactaremos por llamada para confirmar." +
        (emailStatus === "sent" ? "" : emailHint),
    };
  }

  return {
    description:
      "Te contactaremos pronto por WhatsApp." +
      (emailStatus === "sent" ? "" : emailHint),
    action: {
      label: "WhatsApp",
      onClick: () => window.open(whatsappUrl, "_blank", "noreferrer"),
    },
  };
}

async function createAppointmentRequest(payload: AppointmentInsert) {
  try {
    const response = await fetch("/api/appointments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json().catch(() => null)) as
      | CreateAppointmentApiResponse
      | null;

    if (!response.ok) {
      const fallbackMessage = "No pudimos guardar la cita.";
      const message =
        typeof result?.message === "string" ? result.message : fallbackMessage;
      throw new Error(message);
    }

    if (
      result?.email_status === "sent" ||
      result?.email_status === "not_configured" ||
      result?.email_status === "failed"
    ) {
      return result.email_status;
    }

    return "failed" as const;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("No pudimos guardar la cita.");
  }
}

function Field({
  label,
  error,
  children,
  className,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-semibold text-[#5B3A63]">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-2 block text-xs text-[#7B6A80]">{hint}</span> : null}
      {error ? (
        <span className="mt-2 block text-xs font-medium text-[#A7353F]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
