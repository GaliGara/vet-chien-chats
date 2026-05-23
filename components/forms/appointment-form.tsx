"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Loader2, MailCheck, MessageCircle, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { appointmentServiceOptions, brand } from "@/constants/site";
import { createAppointment } from "@/lib/supabase-queries";
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

    if ((values.contact_channel === "whatsapp" || values.contact_channel === "telefono") && !phone) {
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

export function AppointmentForm() {
  const [submitSummary, setSubmitSummary] = useState<SubmitSummary | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues,
  });

  const watchedValues = useWatch({ control });
  const selectedChannel = watchedValues.contact_channel ?? "whatsapp";

  const whatsappUrl = useMemo(() => {
    const message = [
      `Hola, quiero reservar una cita en ${brand.name}.`,
      watchedValues.client_name ? `Mi nombre es ${watchedValues.client_name}.` : "",
      watchedValues.pet_name ? `Mi mascota se llama ${watchedValues.pet_name}.` : "",
      watchedValues.service ? `Servicio: ${watchedValues.service}.` : "",
      watchedValues.preferred_date
        ? `Fecha preferida: ${watchedValues.preferred_date}.`
        : "",
      watchedValues.preferred_time
        ? `Hora preferida: ${watchedValues.preferred_time}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    return buildWhatsAppUrl(undefined, message);
  }, [watchedValues]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

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
      await createAppointment(payload);
      const emailSent = await notifyAppointmentEmails(payload);
      const toastOptions = buildChannelToastOptions(
        values.contact_channel,
        followUpWhatsAppUrl,
        emailSent
      );
      toast.success("Cita registrada", toastOptions);
      setSubmitSummary({
        channel: values.contact_channel,
        whatsappUrl: followUpWhatsAppUrl,
        emailProvided: Boolean(normalizedEmail),
      });
      reset(defaultValues);
    } catch (error) {
      toast.error("No pudimos guardar la cita", {
        description: getSupabaseErrorMessage(error),
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
        <Field label="Hora preferida" error={errors.preferred_time?.message}>
          <Input
            {...register("preferred_time")}
            type="time"
            aria-invalid={Boolean(errors.preferred_time)}
            className="h-12 rounded-2xl border-[#E8D6DE] bg-[#FFFDFB]"
          />
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

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
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
        <ChannelSecondaryAction
          channel={selectedChannel}
          whatsappUrl={whatsappUrl}
          emailValue={watchedValues.email?.trim() || ""}
        />
      </div>

      {submitSummary ? (
        <ConfirmationBox summary={submitSummary} />
      ) : null}
    </form>
  );
}

function ChannelSecondaryAction({
  channel,
  whatsappUrl,
  emailValue,
}: {
  channel: ContactChannel;
  whatsappUrl: string;
  emailValue: string;
}) {
  if (channel === "email") {
    return (
      <Button
        type="button"
        variant="outline"
        disabled={!emailValue}
        onClick={() => {
          if (emailValue) {
            window.location.href = `mailto:${emailValue}`;
          }
        }}
        className="h-12 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63] hover:bg-[#FFF6F8]"
      >
        <MailCheck className="size-4" />
        Revisar correo
      </Button>
    );
  }

  return (
    <Button
      type="button"
      asChild
      variant="outline"
      className="h-12 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63] hover:bg-[#FFF6F8]"
    >
      <a href={whatsappUrl} target="_blank" rel="noreferrer">
        <MessageCircle className="size-4" />
        Continuar por WhatsApp
      </a>
    </Button>
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
      {channelMessageMap[summary.channel]}
      {summary.channel === "whatsapp" ? (
        <a
          href={summary.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex font-semibold text-[#A7353F] underline-offset-4 hover:underline"
        >
          Continuar conversacion
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
  emailSent: boolean
) {
  if (channel === "email") {
    return {
      description: emailSent
        ? "Te enviaremos confirmacion por correo."
        : "La cita se guardo. El correo no pudo enviarse ahora.",
    };
  }

  if (channel === "telefono") {
    return {
      description: emailSent
        ? "Te contactaremos por llamada para confirmar."
        : "La cita se guardo. Te confirmaremos por llamada.",
    };
  }

  return {
    description: emailSent
      ? "Te contactaremos pronto por WhatsApp."
      : "La cita se guardo. El correo automatico no pudo enviarse.",
    action: {
      label: "WhatsApp",
      onClick: () => window.open(whatsappUrl, "_blank", "noreferrer"),
    },
  };
}

async function notifyAppointmentEmails(payload: AppointmentInsert) {
  try {
    const response = await fetch("/api/appointments/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn("[Email] Appointment notification failed", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Email] Appointment notification failed", error);
    return false;
  }
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
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
