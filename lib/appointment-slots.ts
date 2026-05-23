const START_MINUTES = 9 * 60;
const END_MINUTES = 18 * 60;
const STEP_MINUTES = 30;

function toTime(value: number) {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function generateAppointmentTimeSlots() {
  const slots: string[] = [];
  for (let minutes = START_MINUTES; minutes <= END_MINUTES; minutes += STEP_MINUTES) {
    slots.push(toTime(minutes));
  }
  return slots;
}

export const APPOINTMENT_TIME_SLOTS = generateAppointmentTimeSlots();

export function formatTimeSlotLabel(time: string) {
  const normalized = normalizeTimeSlot(time);
  if (!normalized) return time;

  const [hoursText, minutesText] = normalized.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return normalized;

  const suffix = hours < 12 ? "a.m." : "p.m.";
  const displayHour = ((hours + 11) % 12) + 1;
  return `${displayHour}:${minutesText} ${suffix}`;
}

export function normalizeTimeSlot(value?: string | null) {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function isTimeSlotAvailable(bookedSlots: Set<string>, slot: string) {
  return !bookedSlots.has(slot);
}
