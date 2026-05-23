import { createClient } from "@supabase/supabase-js";
import { normalizeTimeSlot } from "@/lib/appointment-slots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? "";

  if (!datePattern.test(date)) {
    return Response.json({ date, booked_times: [] as string[] }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { date, booked_times: [] as string[] },
      { status: 503 }
    );
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await adminSupabase
    .from("appointments")
    .select("preferred_time")
    .eq("preferred_date", date)
    .in("status", ["nueva", "confirmada"]);

  if (error) {
    return Response.json({ date, booked_times: [] as string[] }, { status: 500 });
  }

  const booked = new Set<string>();
  for (const row of data ?? []) {
    const normalized = normalizeTimeSlot(row.preferred_time);
    if (normalized) booked.add(normalized);
  }

  return Response.json({
    date,
    booked_times: [...booked].sort(),
  });
}
