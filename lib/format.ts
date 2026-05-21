export function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Sin registro";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function normalizePhoneNumber(value?: string | null) {
  return value?.replace(/\D/g, "") ?? "";
}

export function buildPhoneHref(phone?: string | null) {
  const normalizedPhone = normalizePhoneNumber(phone);

  return normalizedPhone ? `tel:+${normalizedPhone}` : "";
}

export function buildWhatsAppUrl(phone?: string | null, message?: string) {
  const target =
    normalizePhoneNumber(phone) ||
    normalizePhoneNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const encodedMessage = encodeURIComponent(
    message ??
      "Hola, quiero recibir informacion sobre citas y adopciones en Chiens & Chats."
  );

  return target
    ? `https://wa.me/${target}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
}
