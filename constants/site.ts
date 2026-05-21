import {
  CalendarDays,
  HeartHandshake,
  MessageCircleHeart,
  PawPrint,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type {
  AppointmentStatus,
  PetAdoptionStatus,
  Service,
} from "@/types/database";

export const brand = {
  name: "Chiens & Chats",
  email: "hola@chienschats.mx",
  phone: "+52 55 0000 0000",
  location: "Ciudad de Mexico",
};

export const navItems = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Citas", href: "/#citas" },
  { label: "Adopciones", href: "/#adopciones" },
  { label: "Proceso", href: "/#proceso" },
  { label: "Testimonios", href: "/#testimonios" },
  { label: "Contacto", href: "/#contacto" },
];

export const serviceHighlights = [
  {
    title: "Reservacion de citas",
    description:
      "Agenda servicios con una experiencia clara, amable y pensada para reducir friccion.",
    icon: CalendarDays,
  },
  {
    title: "Proceso de adopcion",
    description:
      "Conoce perfiles disponibles, recibe orientacion y avanza con seguimiento humano.",
    icon: PawPrint,
  },
  {
    title: "Acompanamiento personalizado",
    description:
      "Te guiamos antes, durante y despues de cada decision importante.",
    icon: HeartHandshake,
  },
];

export const processSteps = [
  {
    title: "Elegir servicio",
    description: "Selecciona si deseas una cita, iniciar adopcion o recibir guia.",
    icon: Sparkles,
  },
  {
    title: "Agendar cita",
    description: "Comparte tus datos y el mejor horario para coordinar contigo.",
    icon: CalendarDays,
  },
  {
    title: "Recibir confirmacion",
    description: "Te contactamos por el canal que prefieras para confirmar detalles.",
    icon: MessageCircleHeart,
  },
  {
    title: "Iniciar proceso",
    description: "Avanzas con claridad, cuidado y acompanamiento cercano.",
    icon: ShieldCheck,
  },
];

export const testimonials = [
  {
    quote:
      "Todo se sintio cuidado de principio a fin. La reservacion fue facil y el seguimiento, impecable.",
    name: "Mariana L.",
    role: "Tutora de Nala",
  },
  {
    quote:
      "Nos acompanaron con mucha sensibilidad durante la adopcion. Fue claro, humano y precioso.",
    name: "Ana y Sofia",
    role: "Familia adoptante",
  },
  {
    quote:
      "La experiencia se siente premium sin perder calidez. Cada detalle transmite confianza.",
    name: "Valeria R.",
    role: "Cliente recurrente",
  },
];

export const fallbackServices: Service[] = [
  {
    id: "fallback-cita",
    name: "Cita de valoracion",
    description: "Primera revision y orientacion personalizada.",
    duration_minutes: 45,
    status: "activo",
  },
  {
    id: "fallback-adopcion",
    name: "Entrevista de adopcion",
    description: "Sesiones para conocer necesidades y compatibilidad.",
    duration_minutes: 60,
    status: "activo",
  },
  {
    id: "fallback-seguimiento",
    name: "Seguimiento familiar",
    description: "Acompanamiento posterior a la cita o adopcion.",
    duration_minutes: 30,
    status: "activo",
  },
];

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  nueva: "Nueva",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  atendida: "Atendida",
};

export const petStatusLabels: Record<PetAdoptionStatus, string> = {
  disponible: "Disponible",
  en_proceso: "En proceso",
  adoptado: "Adoptado",
};

export const appointmentStatusOptions: AppointmentStatus[] = [
  "nueva",
  "confirmada",
  "cancelada",
  "atendida",
];

export const petStatusOptions: PetAdoptionStatus[] = [
  "disponible",
  "en_proceso",
  "adoptado",
];

export const adoptionFallbackImage =
  "https://images.unsplash.com/photo-1601758123927-19685dfddd30?auto=format&fit=crop&w=1200&q=80";

export const heroImage =
  "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1400&q=85";
