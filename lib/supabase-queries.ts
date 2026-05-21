import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  AdminStats,
  Appointment,
  AppointmentInsert,
  AppointmentStatus,
  PetForAdoption,
  PetForAdoptionInput,
  Service,
} from "@/types/database";

type QueryOptions = {
  throwOnError?: boolean;
};

function reportSupabaseError(context: string, error: unknown) {
  console.warn(`[Supabase] ${context}`, error);
}

function handleQueryError(context: string, error: unknown, options?: QueryOptions) {
  reportSupabaseError(context, error);

  if (options?.throwOnError) {
    throw error;
  }
}

export async function createAppointment(input: AppointmentInsert) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no está configurado.");
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Appointment;
}

export async function getAppointments(options?: QueryOptions) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    handleQueryError("No se pudieron leer las citas.", error, options);
    return [];
  }

  return (data ?? []) as Appointment[];
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no está configurado.");
  }

  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Appointment;
}

export async function getPetsForAdoption(status?: string, options?: QueryOptions) {
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
    throw new Error("Supabase no está configurado.");
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
    throw new Error("Supabase no está configurado.");
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

export async function deletePetForAdoption(id: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no está configurado.");
  }

  const { error } = await supabase.from("pets_for_adoption").delete().eq("id", id);

  if (error) throw error;
}

export async function getServices(options?: QueryOptions) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    handleQueryError("No se pudieron leer los servicios.", error, options);
    return [];
  }

  return (data ?? []) as Service[];
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured) {
    return {
      totalAppointments: 0,
      newAppointments: 0,
      availableAdoptions: 0,
      activeServices: 0,
    };
  }

  const [
    appointments,
    newAppointments,
    availableAdoptions,
    activeServices,
  ] = await Promise.all([
    supabase.from("appointments").select("id", { count: "exact", head: true }),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "nueva"),
    supabase
      .from("pets_for_adoption")
      .select("id", { count: "exact", head: true })
      .eq("status", "disponible"),
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("status", "activo"),
  ]);

  const results = [
    appointments,
    newAppointments,
    availableAdoptions,
    activeServices,
  ];

  results.forEach((result, index) => {
    if (result.error) {
      reportSupabaseError(`No se pudo calcular estadística ${index + 1}.`, result.error);
    }
  });

  return {
    totalAppointments: appointments.count ?? 0,
    newAppointments: newAppointments.count ?? 0,
    availableAdoptions: availableAdoptions.count ?? 0,
    activeServices: activeServices.count ?? 0,
  };
}
