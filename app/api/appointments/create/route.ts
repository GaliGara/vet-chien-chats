import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { normalizeTimeSlot } from "@/lib/appointment-slots";
import {
  appointmentEmailSchema,
  sendAppointmentEmails,
} from "@/lib/server/appointment-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const busyStatuses = ["nueva", "confirmada"] as const;
const slotTakenMessage = "Ese horario ya no está disponible. Elige otra hora.";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { ok: false, message: "Servicio temporalmente no disponible." },
      { status: 503 }
    );
  }

  let payload: z.infer<typeof appointmentEmailSchema>;
  try {
    const body = await request.json();
    payload = appointmentEmailSchema.parse(body);
  } catch {
    return Response.json(
      { ok: false, message: "Datos de cita invalidos." },
      { status: 400 }
    );
  }

  const normalizedTime = normalizeTimeSlot(payload.preferred_time);
  if (!normalizedTime) {
    return Response.json(
      { ok: false, message: "Hora invalida." },
      { status: 400 }
    );
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: existingSlot, error: slotError } = await adminSupabase
    .from("appointments")
    .select("id")
    .eq("preferred_date", payload.preferred_date)
    .eq("preferred_time", normalizedTime)
    .in("status", [...busyStatuses])
    .limit(1);

  if (slotError) {
    return Response.json(
      { ok: false, message: "No se pudo validar disponibilidad." },
      { status: 500 }
    );
  }

  if ((existingSlot?.length ?? 0) > 0) {
    return Response.json({ ok: false, message: slotTakenMessage }, { status: 409 });
  }

  const appointmentInsert = {
    ...payload,
    preferred_time: normalizedTime,
    status: "nueva" as const,
  };

  const { error: insertError } = await adminSupabase
    .from("appointments")
    .insert(appointmentInsert);

  if (insertError) {
    if ((insertError as { code?: string }).code === "23505") {
      return Response.json({ ok: false, message: slotTakenMessage }, { status: 409 });
    }

    return Response.json(
      { ok: false, message: "No pudimos registrar la cita." },
      { status: 500 }
    );
  }

  const emailResult = await sendAppointmentEmails(appointmentInsert);

  if (emailResult.ok) {
    return Response.json({ ok: true, email_status: "sent" });
  }

  if (emailResult.reason === "not_configured") {
    return Response.json({ ok: true, email_status: "not_configured" });
  }

  return Response.json({ ok: true, email_status: "failed" });
}
