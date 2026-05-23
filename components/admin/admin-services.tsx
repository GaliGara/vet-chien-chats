"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BriefcaseBusiness,
  Clock,
  Edit3,
  Loader2,
  Plus,
  Power,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { fallbackServices, getServiceIconFromName } from "@/constants/site";
import type { Service, ServiceInput } from "@/types/database";
import {
  createService,
  getServices,
  toggleServiceActive,
  updateService,
} from "@/lib/supabase-queries";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminNotice } from "@/components/admin/admin-notice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const nonNegativeNumberText = (message: string) =>
  z
    .string()
    .optional()
    .refine((value) => !value || Number(value) >= 0, message);

const nonNegativeIntegerText = (message: string) =>
  z
    .string()
    .optional()
    .refine(
      (value) => !value || (Number(value) >= 0 && Number.isInteger(Number(value))),
      message
    );

const serviceSchema = z.object({
  name: z.string().min(2, "Escribe el nombre del servicio."),
  description: z.string().max(700, "Máximo 700 caracteres.").optional(),
  price_from: nonNegativeNumberText("El precio no puede ser negativo."),
  duration_minutes: nonNegativeIntegerText(
    "La duración debe ser un número entero positivo."
  ),
  active: z.enum(["true", "false"]),
  sort_order: nonNegativeIntegerText(
    "El orden debe ser un número entero positivo."
  ),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

const emptyServiceValues: ServiceFormValues = {
  name: "",
  description: "",
  price_from: "",
  duration_minutes: "",
  active: "true",
  sort_order: "",
};

export function AdminServices() {
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function loadServices() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getServices({ throwOnError: true });
      setServices(data.length > 0 ? data : fallbackServices);
    } catch (error) {
      setServices([]);
      setErrorMessage(getSupabaseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    getServices({ throwOnError: true })
      .then((data) => {
        if (isMounted) setServices(data.length > 0 ? data : fallbackServices);
      })
      .catch((error) => {
        if (isMounted) {
          setServices([]);
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

  function openCreateDialog() {
    setEditingService(null);
    setDialogOpen(true);
  }

  function openEditDialog(service: Service) {
    setEditingService(service);
    setDialogOpen(true);
  }

  async function handleSaved(saved: Service) {
    setServices((current) => {
      const exists = current.some((item) => item.id === saved.id);
      const next = exists
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [...current.filter((item) => !item.id.startsWith("fallback-")), saved];
      return [...next].sort(
        (a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999)
      );
    });
    setDialogOpen(false);
  }

  async function handleToggle(service: Service) {
    setTogglingId(service.id);
    try {
      const updated = await toggleServiceActive(service.id, !service.active);
      setServices((current) =>
        current.map((item) => (item.id === service.id ? updated : item))
      );
      toast.success(updated.active ? "Servicio activado" : "Servicio desactivado");
    } catch (error) {
      toast.error("No se pudo actualizar", {
        description: getSupabaseErrorMessage(error),
      });
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <AdminShell
      title="Servicios"
      description="Administra servicios veterinarios, estética, prevención y adopciones sin tocar Supabase manualmente."
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          onClick={loadServices}
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
              Nuevo servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="h-[min(90dvh,780px)] overflow-hidden rounded-[2rem] border-[#E8D6DE] bg-[#FFFDFB] p-0 sm:max-w-2xl">
            <DialogHeader className="border-b border-[#E8D6DE] bg-[#FFFDFB] px-5 pb-3 pt-5">
              <DialogTitle className="font-heading text-3xl text-[#2F2433]">
                {editingService ? "Editar servicio" : "Nuevo servicio"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#7B6A80]">
                Ajusta nombre, duracion, precio y estado del servicio.
              </DialogDescription>
            </DialogHeader>
            <div className="modal-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              <ServiceForm
                key={editingService?.id ?? "new"}
                service={editingService}
                onSaved={handleSaved}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-[1.75rem] bg-[#FFF6F8]"
            />
          ))}
        </div>
      ) : errorMessage ? (
        <AdminNotice
          title="No se pudieron cargar servicios"
          text={errorMessage}
        />
      ) : services.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              toggling={togglingId === service.id}
              onEdit={openEditDialog}
              onToggle={handleToggle}
            />
          ))}
        </div>
      ) : (
        <AdminNotice
          title="Sin servicios configurados"
          text="Crea servicios para mostrarlos aquí y en la landing."
        />
      )}
    </AdminShell>
  );
}

function ServiceCard({
  service,
  toggling,
  onEdit,
  onToggle,
}: {
  service: Service;
  toggling: boolean;
  onEdit: (service: Service) => void;
  onToggle: (service: Service) => void;
}) {
  return (
    <article className="rounded-[1.35rem] border border-[#E8D6DE] bg-white p-4 shadow-[0_12px_30px_rgb(91_58_99/0.07)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[#F7F1FA] text-[#5B3A63]">
          <BriefcaseBusiness className="size-5" />
        </span>
        <Badge className="rounded-full bg-[#FFF6F8] px-2.5 py-1 text-xs text-[#A7353F]">
          {service.active === false ? "inactivo" : "activo"}
        </Badge>
      </div>
      <h2 className="font-heading text-2xl text-[#2F2433]">{service.name}</h2>
      <p className="mt-2 text-sm leading-6 text-[#7B6A80]">
        {service.description ?? "Servicio preparado para reserva y seguimiento."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#5B3A63]">
        {service.duration_minutes ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F7F1FA] px-3 py-1">
            <Clock className="size-3.5" />
            {service.duration_minutes} min
          </span>
        ) : null}
        {typeof service.price_from === "number" ? (
          <span className="rounded-full bg-[#F7F1FA] px-3 py-1">
            Desde ${service.price_from}
          </span>
        ) : null}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onEdit(service)}
          className="h-10 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63]"
        >
          <Edit3 className="size-4" />
          Editar
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={toggling || service.id.startsWith("fallback-")}
          onClick={() => onToggle(service)}
          className="h-10 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63]"
        >
          {toggling ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
          {service.active === false ? "Activar" : "Desactivar"}
        </Button>
      </div>
    </article>
  );
}

function ServiceForm({
  service,
  onSaved,
}: {
  service: Service | null;
  onSaved: (service: Service) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          name: service.name,
          description: service.description ?? "",
          price_from:
            typeof service.price_from === "number" ? String(service.price_from) : "",
          duration_minutes:
            typeof service.duration_minutes === "number"
              ? String(service.duration_minutes)
              : "",
          active: service.active === false ? "false" : "true",
          sort_order:
            typeof service.sort_order === "number" ? String(service.sort_order) : "",
        }
      : emptyServiceValues,
  });

  async function onSubmit(values: ServiceFormValues) {
    const payload: ServiceInput = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
      price_from:
        values.price_from === "" || values.price_from === undefined
          ? null
          : Number(values.price_from),
      duration_minutes:
        values.duration_minutes === "" || values.duration_minutes === undefined
          ? null
          : Number(values.duration_minutes),
      icon: getServiceIconFromName(values.name.trim()),
      active: values.active === "true",
      sort_order:
        values.sort_order === "" || values.sort_order === undefined
          ? null
          : Number(values.sort_order),
    };

    setIsSaving(true);
    try {
      const saved = service
        ? await updateService(service.id, payload)
        : await createService(payload);
      toast.success(service ? "Servicio actualizado" : "Servicio creado");
      onSaved(saved);
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
      <FormField label="Nombre" error={errors.name?.message}>
        <Input {...register("name")} className="h-12 rounded-2xl border-[#E8D6DE] bg-white" />
      </FormField>
      <FormField label="Descripción" error={errors.description?.message}>
        <Textarea {...register("description")} className="min-h-28 rounded-2xl border-[#E8D6DE] bg-white" />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Precio desde" error={errors.price_from?.message}>
          <Input {...register("price_from")} type="number" min="0" step="1" className="h-12 rounded-2xl border-[#E8D6DE] bg-white" />
        </FormField>
        <FormField label="Duración en minutos" error={errors.duration_minutes?.message}>
          <Input {...register("duration_minutes")} type="number" min="0" step="1" className="h-12 rounded-2xl border-[#E8D6DE] bg-white" />
        </FormField>
        <FormField
          label="Orden de aparición"
          error={errors.sort_order?.message}
          hint="Opcional. Menor número = aparece antes."
        >
          <Input {...register("sort_order")} type="number" min="0" step="1" className="h-12 rounded-2xl border-[#E8D6DE] bg-white" />
        </FormField>
        <FormField label="Activo" error={errors.active?.message}>
          <select {...register("active")} className="h-12 w-full rounded-2xl border border-[#E8D6DE] bg-white px-3 text-sm text-[#2F2433]">
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </FormField>
      </div>
      <div className="sticky bottom-0 z-10 bg-[#FFFDFB] pt-1">
        <Button
          disabled={isSaving}
          className="h-12 w-full rounded-full bg-[#A7353F] text-[#FFFDFB] hover:bg-[#8E2D36]"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
          {service ? "Guardar cambios" : "Crear servicio"}
        </Button>
      </div>
    </form>
  );
}

function FormField({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-[#5B3A63]">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1 block text-xs text-[#7B6A80]">{hint}</span>
      ) : null}
      {error ? (
        <span className="mt-2 block text-xs font-medium text-[#A7353F]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
