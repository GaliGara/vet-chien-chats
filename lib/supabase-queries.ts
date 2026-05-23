import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { normalizeTimeSlot } from "@/lib/appointment-slots";
import type {
  AdminStats,
  Appointment,
  AppointmentInsert,
  AppointmentStatus,
  PetForAdoption,
  PetForAdoptionInput,
  Service,
  ServiceInput,
} from "@/types/database";

type QueryOptions = {
  activeOnly?: boolean;
  throwOnError?: boolean;
};

const busyAppointmentStatuses: AppointmentStatus[] = ["nueva", "confirmada"];
const appointmentSlotTakenMessage =
  "Ese horario ya tiene una solicitud o cita confirmada. Elige otro horario.";

function reportSupabaseError(context: string, error: unknown) {
  console.warn(`[Supabase] ${context}`, error);
}

function handleQueryError(
  context: string,
  error: unknown,
  options?: QueryOptions
) {
  reportSupabaseError(context, error);

  if (options?.throwOnError) {
    throw error;
  }
}

function getLocalDateISO() {
  const now = new Date();
  const shifted = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 10);
}

function isBusyAppointmentStatus(status: AppointmentStatus) {
  return busyAppointmentStatuses.includes(status);
}

function createAppointmentSlotTakenError() {
  const error = new Error(appointmentSlotTakenMessage);
  (error as { code?: string }).code = "APPOINTMENT_SLOT_TAKEN";
  return error;
}

async function hasAppointmentSlotConflict({
  preferredDate,
  preferredTime,
  excludeAppointmentId,
  options,
}: {
  preferredDate: string;
  preferredTime: string;
  excludeAppointmentId?: string;
  options?: QueryOptions;
}) {
  let query = supabase
    .from("appointments")
    .select("id")
    .eq("preferred_date", preferredDate)
    .eq("preferred_time", preferredTime)
    .in("status", busyAppointmentStatuses)
    .limit(1);

  if (excludeAppointmentId) {
    query = query.neq("id", excludeAppointmentId);
  }

  const { data, error } = await query;

  if (error) {
    handleQueryError("No se pudo validar disponibilidad del horario.", error, options);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

export async function createAppointment(input: AppointmentInsert) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no esta configurado.");
  }

  const normalizedTime = normalizeTimeSlot(input.preferred_time);

  if (isBusyAppointmentStatus(input.status) && normalizedTime) {
    const hasConflict = await hasAppointmentSlotConflict({
      preferredDate: input.preferred_date,
      preferredTime: normalizedTime,
    });

    if (hasConflict) {
      throw createAppointmentSlotTakenError();
    }
  }

  const payload = normalizedTime
    ? { ...input, preferred_time: normalizedTime }
    : input;

  const { error } = await supabase.from("appointments").insert(payload);
  if (error) throw error;
}

export async function getAppointments(options?: QueryOptions) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("preferred_date", { ascending: true })
    .order("preferred_time", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    handleQueryError("No se pudieron leer las citas.", error, options);
    return [];
  }

  return (data ?? []) as Appointment[];
}

export async function getBookedTimeSlotsByDate(
  date: string,
  options?: QueryOptions & { excludeAppointmentId?: string }
) {
  if (!isSupabaseConfigured || !date) return [];

  let query = supabase
    .from("appointments")
    .select("id,preferred_time")
    .eq("preferred_date", date)
    .in("status", busyAppointmentStatuses);

  if (options?.excludeAppointmentId) {
    query = query.neq("id", options.excludeAppointmentId);
  }

  const { data, error } = await query;

  if (error) {
    handleQueryError("No se pudieron leer horarios ocupados.", error, options);
    return [];
  }

  const booked = new Set<string>();
  for (const row of data ?? []) {
    const normalized = normalizeTimeSlot(row.preferred_time);
    if (normalized) booked.add(normalized);
  }

  return [...booked];
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  return updateAppointment(id, { status });
}

export async function updateAppointment(
  id: string,
  input: Partial<AppointmentInsert>
) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data: currentAppointment, error: readError } = await supabase
    .from("appointments")
    .select("preferred_date, preferred_time, status")
    .eq("id", id)
    .single();

  if (readError) throw readError;

  const nextStatus = (input.status ?? currentAppointment.status) as AppointmentStatus;
  const nextDate = input.preferred_date ?? currentAppointment.preferred_date;
  const rawTime = input.preferred_time ?? currentAppointment.preferred_time;
  const normalizedTime = normalizeTimeSlot(rawTime);

  if (isBusyAppointmentStatus(nextStatus) && normalizedTime) {
    const hasConflict = await hasAppointmentSlotConflict({
      preferredDate: nextDate,
      preferredTime: normalizedTime,
      excludeAppointmentId: id,
    });

    if (hasConflict) {
      throw createAppointmentSlotTakenError();
    }
  }

  const payload =
    input.preferred_time !== undefined && normalizedTime
      ? { ...input, preferred_time: normalizedTime }
      : input;

  const { data, error } = await supabase
    .from("appointments")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Appointment;
}

export async function deleteAppointment(id: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no esta configurado.");
  }

  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) throw error;
}

export async function getPetsForAdoption(
  status?: string,
  options?: QueryOptions
) {
  if (!isSupabaseConfigured) return [];

  let query = supabase
    .from("pets_for_adoption")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    handleQueryError("No se pudieron leer las adopciones.", error, options);
    return [];
  }

  return (data ?? []) as PetForAdoption[];
}

export async function createPetForAdoption(input: PetForAdoptionInput) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data, error } = await supabase
    .from("pets_for_adoption")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as PetForAdoption;
}

export async function updatePetForAdoption(
  id: string,
  input: Partial<PetForAdoptionInput>
) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data, error } = await supabase
    .from("pets_for_adoption")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PetForAdoption;
}

export async function archivePetForAdoption(id: string) {
  return updatePetForAdoption(id, { status: "oculto" });
}

export async function getServices(options?: QueryOptions) {
  if (!isSupabaseConfigured) return [];

  let query = supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (options?.activeOnly) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error) {
    handleQueryError("No se pudieron leer los servicios.", error, options);
    return [];
  }

  return (data ?? []) as Service[];
}

export async function getActiveServices(options?: QueryOptions) {
  return getServices({ ...options, activeOnly: true });
}

export async function createService(input: ServiceInput) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data, error } = await supabase
    .from("services")
    .insert(input)
    .select()
    .single();

  if (error) {
    if (isMissingDurationMinutesError(error)) {
      const { data: retryData, error: retryError } = await supabase
        .from("services")
        .insert(withoutDurationMinutes(input))
        .select()
        .single();

      if (retryError) throw retryError;
      return retryData as Service;
    }
    throw error;
  }

  return data as Service;
}

export async function updateService(id: string, input: Partial<ServiceInput>) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no esta configurado.");
  }

  const { data, error } = await supabase
    .from("services")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (isMissingDurationMinutesError(error)) {
      const { data: retryData, error: retryError } = await supabase
        .from("services")
        .update(withoutDurationMinutes(input))
        .eq("id", id)
        .select()
        .single();

      if (retryError) throw retryError;
      return retryData as Service;
    }
    throw error;
  }

  return data as Service;
}

export async function toggleServiceActive(id: string, active: boolean) {
  return updateService(id, { active });
}

function isMissingDurationMinutesError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error ? String(error.message) : "";
  return message.toLowerCase().includes("duration_minutes");
}

function withoutDurationMinutes<T extends Partial<ServiceInput>>(input: T) {
  const next = { ...input };
  delete next.duration_minutes;
  return next;
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured) {
    return {
      newAppointments: 0,
      confirmedToday: 0,
      upcomingAppointments: 0,
      availableAdoptions: 0,
    };
  }

  const today = getLocalDateISO();

  const [newAppointments, confirmedToday, upcomingAppointments, availableAdoptions] =
    await Promise.all([
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("status", "nueva"),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("status", "confirmada")
        .eq("preferred_date", today),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("status", "confirmada")
        .gte("preferred_date", today),
      supabase
        .from("pets_for_adoption")
        .select("id", { count: "exact", head: true })
        .eq("status", "disponible"),
    ]);

  const results = [
    newAppointments,
    confirmedToday,
    upcomingAppointments,
    availableAdoptions,
  ];

  results.forEach((result, index) => {
    if (result.error) {
      reportSupabaseError(
        `No se pudo calcular estadistica ${index + 1}.`,
        result.error
      );
    }
  });

  return {
    newAppointments: newAppointments.count ?? 0,
    confirmedToday: confirmedToday.count ?? 0,
    upcomingAppointments: upcomingAppointments.count ?? 0,
    availableAdoptions: availableAdoptions.count ?? 0,
  };
}
