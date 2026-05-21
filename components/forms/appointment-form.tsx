"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Loader2, MessageCircle, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { appointmentServiceOptions, brand } from "@/constants/site";
import { createAppointment } from "@/lib/supabase-queries";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import { buildWhatsAppUrl } from "@/lib/format";
import type { AppointmentInsert } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const appointmentSchema = z.object({
  client_name: z.string().min(2, "Escribe tu nombre completo."),
  phone: z
    .string()
    .trim()
    .min(8, "Agrega un teléfono válido.")
    .regex(/^[+()\d\s-]+$/, "Usa solo numeros, espacios o +."),
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

export function AppointmentForm() {
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState("");
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
    const followUpWhatsAppUrl = buildWhatsAppUrl(
      undefined,
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
      phone: values.phone.trim(),
      email: values.email?.trim() || null,
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
      toast.success("Cita registrada", {
        description: "Te contactaremos pronto por tu canal preferido.",
        action: {
          label: "WhatsApp",
          onClick: () => window.open(followUpWhatsAppUrl, "_blank", "noreferrer"),
        },
      });
      setLastWhatsAppUrl(followUpWhatsAppUrl);
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
          <h3 className="font-heading text-3xl text-[#2F2433]">
            Reserva tu cita
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#7B6A80]">
            Comparte los detalles y te confirmaremos con una atención clara y
            cercana.
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
        <Field label="Telefono" error={errors.phone?.message}>
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
              <option value="telefono">Teléfono</option>
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
      </div>

      {lastWhatsAppUrl ? (
        <div className="mt-5 rounded-[1.5rem] border border-[#D9C6E8] bg-[#F7F1FA]/70 p-4 text-sm leading-6 text-[#5B3A63]">
          Tu solicitud quedó registrada. Si quieres acelerar la confirmación,
          puedes abrir WhatsApp con el resumen ya preparado.
          <a
            href={lastWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex font-semibold text-[#A7353F] underline-offset-4 hover:underline"
          >
            Continuar conversación
          </a>
        </div>
      ) : null}
    </form>
  );
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
