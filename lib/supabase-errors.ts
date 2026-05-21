type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string | null;
};

export function getSupabaseErrorMessage(error: unknown) {
  const fallback =
    "No pudimos completar la accion. Revisa tu conexion o la configuracion de Supabase.";

  if (!error || typeof error !== "object") return fallback;

  const supabaseError = error as SupabaseLikeError;
  const message = supabaseError.message?.toLowerCase() ?? "";
  const code = supabaseError.code ?? "";

  if (code === "42501" || message.includes("row-level security")) {
    return "Supabase bloqueo la operacion por RLS. Revisa las policies documentadas en docs/supabase-policies.md.";
  }

  if (code === "PGRST125" || message.includes("invalid path")) {
    return "Supabase respondio con una ruta invalida. Verifica NEXT_PUBLIC_SUPABASE_URL y que el proyecto este activo.";
  }

  if (message.includes("failed to fetch") || message.includes("network")) {
    return "No se pudo conectar con Supabase. Revisa internet, URL y anon key.";
  }

  return supabaseError.message || fallback;
}
