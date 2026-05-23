import { z } from "zod";
import {
  appointmentEmailSchema,
  sendAppointmentEmails,
} from "@/lib/server/appointment-email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: z.infer<typeof appointmentEmailSchema>;

  try {
    const body = await request.json();
    payload = appointmentEmailSchema.parse(body);
  } catch {
    return Response.json(
      { ok: false, error: "invalid_appointment_payload" },
      { status: 400 }
    );
  }

  const result = await sendAppointmentEmails(payload);

  if (result.ok) {
    return Response.json({ ok: true });
  }

  if (result.reason === "not_configured") {
    return Response.json(
      { ok: false, error: "email_service_not_configured" },
      { status: 503 }
    );
  }

  return Response.json({ ok: false, error: "email_send_failed" }, { status: 502 });
}
