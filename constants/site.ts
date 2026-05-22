import {
  Bath,
  CalendarDays,
  HeartHandshake,
  HeartPulse,
  MessageCircleHeart,
  PawPrint,
  Scissors,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
} from "lucide-react";
import type {
  AppointmentStatus,
  PetAdoptionStatus,
  Service,
} from "@/types/database";

export const brand = {
  name: "Chiens et Chats",
  email: "hola@chiensetchats.mx",
  phone: "+52 55 0000 0000",
  location: "Ciudad de Mexico",
  social: "@chiensetchats",
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
    title: "Cuidado médico y estético",
    description:
      "Consulta, vacunación, desparasitación y estética con delicadeza.",
    icon: Stethoscope,
  },
  {
    title: "Procesos de adopción",
    description: "Adopciones responsables acompañadas de principio a fin.",
    icon: PawPrint,
  },
  {
    title: "Agenda clara y humana",
    description:
      "Agenda en minutos, recibe confirmación y continúa por WhatsApp.",
    icon: MessageCircleHeart,
  },
];

export const processSteps = [
  {
    title: "Elegir servicio",
    description: "Selecciona consulta, estética, vacunación o adopción.",
    icon: Sparkles,
  },
  {
    title: "Agendar cita",
    description: "Comparte datos de tu mascota y el mejor horario.",
    icon: CalendarDays,
  },
  {
    title: "Recibir confirmación",
    description: "Te contactamos por el canal que prefieras.",
    icon: MessageCircleHeart,
  },
  {
    title: "Iniciar proceso",
    description: "Avanzas con cuidado médico, estético o de adopción.",
    icon: ShieldCheck,
  },
];

export const testimonials = [
  {
    quote:
      "Todo se sintió cuidado de principio a fin. La reservación fue fácil y el seguimiento, impecable.",
    name: "Mariana L.",
    role: "Tutora de Nala",
  },
  {
    quote:
      "Nos acompañaron con mucha sensibilidad durante la adopción. Fue claro, humano y precioso.",
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
    id: "fallback-consulta",
    name: "Consulta médica veterinaria",
    description: "Valoración clínica para perros y gatos con trato sereno.",
    price_from: null,
    duration_minutes: 45,
    active: true,
    icon: "stethoscope",
    sort_order: 10,
  },
  {
    id: "fallback-estetica",
    name: "Estética canina, baño y cuidado",
    description: "Baño, corte y cuidado de piel y pelaje con mucha delicadeza.",
    price_from: null,
    duration_minutes: 90,
    active: true,
    icon: "bath",
    sort_order: 20,
  },
  {
    id: "fallback-vacunacion",
    name: "Vacunación",
    description: "Aplicación y seguimiento de esquemas preventivos.",
    price_from: null,
    duration_minutes: 30,
    active: true,
    icon: "syringe",
    sort_order: 30,
  },
  {
    id: "fallback-desparasitacion",
    name: "Desparasitación",
    description: "Cuidado preventivo para bienestar y tranquilidad en casa.",
    price_from: null,
    duration_minutes: 25,
    active: true,
    icon: "heart-pulse",
    sort_order: 40,
  },
  {
    id: "fallback-adopciones",
    name: "Acompañamiento en adopciones",
    description: "Proceso responsable, humano y guiado de principio a fin.",
    price_from: null,
    duration_minutes: 60,
    active: true,
    icon: "paw",
    sort_order: 50,
  },
];

export const appointmentServiceOptions = [
  "Consulta médica",
  "Baño",
  "Corte de pelo",
  "Baño + corte",
  "Vacunación",
  "Desparasitación",
  "Seguimiento médico",
  "Proceso de adopción",
  "Otro",
];

export const veterinaryServiceIcons = [
  Stethoscope,
  Bath,
  Syringe,
  HeartPulse,
  HeartHandshake,
  Scissors,
  CalendarDays,
];

export const veterinaryMicrocopy = [
  "Cuidado médico y estético con delicadeza.",
  "Procesos de adopción acompañados de principio a fin.",
  "Agenda en minutos, recibe confirmación y continúa por WhatsApp.",
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
  oculto: "Oculto",
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
  "oculto",
];
