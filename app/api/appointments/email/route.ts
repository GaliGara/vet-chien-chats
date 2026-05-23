import { Resend } from "resend";
import { z } from "zod";

export const runtime = "nodejs";

const emailAppointmentSchema = z.object({
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

type EmailAppointment = z.infer<typeof emailAppointmentSchema>;

const brandName = "Chiens et Chats";

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!apiKey || !adminEmail) {
    return Response.json(
      { ok: false, error: "Email service is not configured." },
      { status: 503 }
    );
  }

  let appointment: EmailAppointment;

  try {
    const body = await request.json();
    appointment = emailAppointmentSchema.parse(body);
  } catch {
    return Response.json(
      { ok: false, error: "Invalid appointment payload." },
      { status: 400 }
    );
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? `${brandName} <onboarding@resend.dev>`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const adminUrl = siteUrl ? `${siteUrl}/admin/citas` : null;

  try {
    const messages = [
      resend.emails.send({
        from,
        to: adminEmail,
        replyTo: appointment.email ?? undefined,
        subject: `Nueva cita en ${brandName}`,
        html: renderAdminEmail(appointment, adminUrl),
        text: renderAdminText(appointment, adminUrl),
      }),
    ];

    if (appointment.email) {
      messages.push(
        resend.emails.send({
          from,
          to: appointment.email,
          replyTo: adminEmail,
          subject: `Recibimos tu solicitud en ${brandName}`,
          html: renderClientEmail(appointment),
          text: renderClientText(appointment),
        })
      );
    }

    const results = await Promise.all(messages);
    const failed = results.find((result) => result.error);

    if (failed?.error) {
      console.error("[Resend] Appointment email failed", failed.error);
      return Response.json(
        { ok: false, error: "Email provider rejected the message." },
        { status: 502 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[Resend] Appointment email error", error);
    return Response.json(
      { ok: false, error: "Unable to send appointment email." },
      { status: 502 }
    );
  }
}

function renderAdminEmail(appointment: EmailAppointment, adminUrl: string | null) {
  return baseEmail(`
    <p style="margin:0 0 18px;color:#7B6A80;">Hay una nueva solicitud de cita desde la web.</p>
    ${detailsTable(appointment)}
    ${
      adminUrl
        ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;border-radius:999px;background:#A7353F;color:#FFFDFB;padding:12px 18px;text-decoration:none;font-weight:700;">Abrir admin</a></p>`
        : ""
    }
  `);
}

function renderClientEmail(appointment: EmailAppointment) {
  return baseEmail(`
    <p style="margin:0 0 18px;color:#7B6A80;">Hola ${escapeHtml(appointment.client_name)}, recibimos tu solicitud en <strong style="color:#2F2433;">${brandName}</strong>.</p>
    ${detailsTable(appointment)}
    <p style="margin:22px 0 0;color:#7B6A80;line-height:1.7;">Nuestro equipo revisara la disponibilidad y te confirmara por ${channelLabel(appointment.contact_channel)}. Gracias por confiar en nosotros para cuidar a ${escapeHtml(appointment.pet_name)}.</p>
  `);
}

function baseEmail(content: string) {
  return `
    <div style="margin:0;background:#FFFDFB;padding:28px 16px;font-family:Inter,Arial,sans-serif;color:#2F2433;">
      <div style="margin:0 auto;max-width:640px;border:1px solid #E8D6DE;border-radius:28px;background:#FFFFFF;padding:28px;box-shadow:0 18px 48px rgba(91,58,99,.08);">
        <p style="margin:0 0 8px;color:#A7353F;font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">${brandName}</p>
        <h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:34px;line-height:1.12;color:#2F2433;">Solicitud de cita</h1>
        ${content}
      </div>
    </div>
  `;
}

function detailsTable(appointment: EmailAppointment) {
  const rows = [
    ["Cliente", appointment.client_name],
    ["Telefono", appointment.phone || "No proporcionado"],
    ["Correo", appointment.email ?? "No proporcionado"],
    ["Mascota", appointment.pet_name],
    ["Tipo", appointment.pet_type],
    ["Servicio", appointment.service],
    ["Fecha", appointment.preferred_date],
    ["Hora", appointment.preferred_time],
    ["Canal", channelLabel(appointment.contact_channel)],
    ["Notas", appointment.message || "Sin notas"],
  ];

  return `
    <div style="overflow:hidden;border:1px solid #E8D6DE;border-radius:22px;">
      ${rows
        .map(
          ([label, value]) => `
            <div style="display:grid;grid-template-columns:145px 1fr;border-bottom:1px solid #F0E3E9;">
              <div style="background:#FFF6F8;padding:12px 14px;color:#5B3A63;font-size:13px;font-weight:700;">${escapeHtml(label)}</div>
              <div style="padding:12px 14px;color:#2F2433;font-size:14px;">${escapeHtml(value)}</div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderAdminText(appointment: EmailAppointment, adminUrl: string | null) {
  return [
    `Nueva cita en ${brandName}`,
    "",
    detailsText(appointment),
    adminUrl ? `Admin: ${adminUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderClientText(appointment: EmailAppointment) {
  return [
    `Hola ${appointment.client_name}, recibimos tu solicitud en ${brandName}.`,
    "",
    detailsText(appointment),
    "",
    `Nuestro equipo te confirmara por ${channelLabel(appointment.contact_channel)}.`,
  ].join("\n");
}

function detailsText(appointment: EmailAppointment) {
  return [
    `Cliente: ${appointment.client_name}`,
    `Telefono: ${appointment.phone || "No proporcionado"}`,
    `Correo: ${appointment.email ?? "No proporcionado"}`,
    `Mascota: ${appointment.pet_name}`,
    `Tipo: ${appointment.pet_type}`,
    `Servicio: ${appointment.service}`,
    `Fecha: ${appointment.preferred_date}`,
    `Hora: ${appointment.preferred_time}`,
    `Canal: ${channelLabel(appointment.contact_channel)}`,
    `Notas: ${appointment.message || "Sin notas"}`,
  ].join("\n");
}

function channelLabel(channel: EmailAppointment["contact_channel"]) {
  const labels = {
    whatsapp: "WhatsApp",
    telefono: "telefono",
    email: "correo",
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
