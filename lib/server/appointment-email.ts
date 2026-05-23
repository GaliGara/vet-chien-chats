import { Resend } from "resend";
import { z } from "zod";

export const appointmentEmailSchema = z.object({
  client_name: z.string().min(2).max(120),
  phone: z.union([z.string().max(40), z.null()]).optional(),
  email: z.union([z.string().email(), z.null()]).optional(),
  pet_name: z.string().min(1).max(120),
  pet_type: z.string().min(1).max(60),
  service: z.string().min(1).max(160),
  preferred_date: z.string().min(1).max(40),
  preferred_time: z.string().min(1).max(40),
  message: z.union([z.string().max(800), z.null()]).optional(),
  contact_channel: z.enum(["whatsapp", "telefono", "email"]),
  status: z.enum(["nueva", "confirmada", "cancelada", "atendida"]).optional(),
});

export type AppointmentEmailPayload = z.infer<typeof appointmentEmailSchema>;

type SendAppointmentEmailResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "provider_error" };

const brandName = "Chiens et Chats";

export async function sendAppointmentEmails(
  payload: AppointmentEmailPayload
): Promise<SendAppointmentEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!apiKey || !adminEmail) {
    return { ok: false, reason: "not_configured" };
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM_EMAIL ?? `${brandName} <onboarding@resend.dev>`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const adminUrl = siteUrl ? `${siteUrl}/admin/citas?status=nueva` : null;

  try {
    const jobs = [
      resend.emails.send({
        from,
        to: adminEmail,
        replyTo: payload.email ?? undefined,
        subject: `Nueva solicitud de cita · ${brandName}`,
        html: renderAdminEmail(payload, adminUrl),
        text: renderAdminText(payload, adminUrl),
      }),
    ];

    if (payload.email) {
      jobs.push(
        resend.emails.send({
          from,
          to: payload.email,
          replyTo: adminEmail,
          subject: `Recibimos tu solicitud en ${brandName}`,
          html: renderClientEmail(payload),
          text: renderClientText(payload),
        })
      );
    }

    const results = await Promise.all(jobs);
    const hasError = results.some((result) => Boolean(result.error));
    if (hasError) {
      return { ok: false, reason: "provider_error" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "provider_error" };
  }
}

function renderClientEmail(payload: AppointmentEmailPayload) {
  return baseEmail(`
    <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#2F2433;">
      Recibimos tu solicitud
    </h1>
    <p style="margin:0 0 16px;color:#7B6A80;font-size:14px;line-height:1.7;">
      Hola ${escapeHtml(payload.client_name)}, gracias por confiar en ${brandName}. Recibimos tu solicitud y la revisaremos para confirmar los detalles contigo.
    </p>
    ${summaryCard(payload, false)}
    <p style="margin:18px 0 0;color:#7B6A80;font-size:13px;line-height:1.7;">
      Este correo confirma que tu solicitud fue registrada. La cita quedará confirmada cuando el equipo valide la disponibilidad.
    </p>
  `);
}

function renderAdminEmail(payload: AppointmentEmailPayload, adminUrl: string | null) {
  return baseEmail(`
    <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#2F2433;">
      Nueva solicitud de cita
    </h1>
    <p style="margin:0 0 16px;color:#7B6A80;font-size:14px;line-height:1.7;">
      Se registró una nueva solicitud desde el formulario público.
    </p>
    ${summaryCard(payload, true)}
    ${
      adminUrl
        ? `<p style="margin:20px 0 0;">
          <a href="${escapeHtml(adminUrl)}" style="display:inline-block;border-radius:999px;background:#A7353F;color:#FFFDFB;padding:11px 16px;text-decoration:none;font-size:13px;font-weight:700;">
            Abrir panel admin
          </a>
        </p>`
        : ""
    }
  `);
}

function summaryCard(payload: AppointmentEmailPayload, includeClientData: boolean) {
  const rows: Array<[string, string]> = [];

  if (includeClientData) {
    rows.push(["Cliente", payload.client_name]);
    rows.push(["Telefono", payload.phone || "No proporcionado"]);
    rows.push(["Email", payload.email || "No proporcionado"]);
  }

  rows.push(["Mascota", payload.pet_name]);
  rows.push(["Tipo", payload.pet_type]);
  rows.push(["Servicio", payload.service]);
  rows.push(["Fecha", payload.preferred_date]);
  rows.push(["Hora", payload.preferred_time]);
  rows.push(["Canal", channelLabel(payload.contact_channel)]);

  if (payload.message) {
    rows.push(["Mensaje", payload.message]);
  }

  return `
    <div style="border:1px solid #E8D6DE;border-radius:18px;overflow:hidden;background:#FFFFFF;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="padding:10px 12px;background:#FFF6F8;border-bottom:1px solid #F2E7EC;color:#5B3A63;font-size:12px;font-weight:700;white-space:nowrap;">${escapeHtml(label)}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #F2E7EC;color:#2F2433;font-size:13px;">${escapeHtml(value)}</td>
              </tr>
            `
          )
          .join("")}
      </table>
    </div>
  `;
}

function baseEmail(content: string) {
  return `
    <div style="margin:0;background:#FFFDFB;padding:28px 16px;font-family:Inter,Arial,sans-serif;color:#2F2433;">
      <div style="margin:0 auto;max-width:640px;border:1px solid #E8D6DE;border-radius:28px;background:#FFFFFF;padding:26px;box-shadow:0 18px 48px rgba(91,58,99,0.08);">
        <p style="margin:0 0 10px;">
          <span style="display:inline-block;border:1px solid #E8D6DE;border-radius:999px;background:#FFF6F8;color:#A7353F;padding:6px 10px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">
            ${brandName}
          </span>
        </p>
        ${content}
        <p style="margin:24px 0 0;color:#9A8A9E;font-size:12px;line-height:1.7;">
          Este correo fue generado automáticamente por ${brandName}.
        </p>
      </div>
    </div>
  `;
}

function renderClientText(payload: AppointmentEmailPayload) {
  return [
    "Recibimos tu solicitud",
    "",
    `Hola ${payload.client_name}, gracias por confiar en ${brandName}. Recibimos tu solicitud y la revisaremos para confirmar los detalles contigo.`,
    "",
    `Mascota: ${payload.pet_name}`,
    `Tipo: ${payload.pet_type}`,
    `Servicio: ${payload.service}`,
    `Fecha: ${payload.preferred_date}`,
    `Hora: ${payload.preferred_time}`,
    `Canal de contacto: ${channelLabel(payload.contact_channel)}`,
    payload.message ? `Mensaje: ${payload.message}` : "",
    "",
    "Este correo confirma que tu solicitud fue registrada. La cita quedará confirmada cuando el equipo valide la disponibilidad.",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderAdminText(payload: AppointmentEmailPayload, adminUrl: string | null) {
  return [
    "Nueva solicitud de cita",
    "",
    `Cliente: ${payload.client_name}`,
    `Telefono: ${payload.phone || "No proporcionado"}`,
    `Email: ${payload.email || "No proporcionado"}`,
    `Mascota: ${payload.pet_name}`,
    `Tipo: ${payload.pet_type}`,
    `Servicio: ${payload.service}`,
    `Fecha: ${payload.preferred_date}`,
    `Hora: ${payload.preferred_time}`,
    `Canal: ${channelLabel(payload.contact_channel)}`,
    payload.message ? `Mensaje: ${payload.message}` : "",
    adminUrl ? `Admin: ${adminUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function channelLabel(channel: AppointmentEmailPayload["contact_channel"]) {
  const labels = {
    whatsapp: "WhatsApp",
    telefono: "Llamada",
    email: "Correo",
  };

  return labels[channel];
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const escapes: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return escapes[character];
  });
}
