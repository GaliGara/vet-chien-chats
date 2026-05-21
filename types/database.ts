export type AppointmentStatus = "nueva" | "confirmada" | "cancelada" | "atendida";

export type PetAdoptionStatus = "disponible" | "en_proceso" | "adoptado";

export type ServiceStatus = "activo" | "inactivo";

export type ContactChannel = "whatsapp" | "telefono" | "email";

export type Appointment = {
  id: string;
  client_name: string;
  phone: string;
  email: string | null;
  pet_name: string;
  pet_type: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  contact_channel: ContactChannel;
  status: AppointmentStatus;
  created_at: string;
};

export type AppointmentInsert = Omit<Appointment, "id" | "created_at">;

export type PetForAdoption = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: string | null;
  sex: string | null;
  short_description: string | null;
  description?: string | null;
  image_url: string | null;
  status: PetAdoptionStatus;
  created_at?: string | null;
};

export type PetForAdoptionInput = Omit<PetForAdoption, "id" | "created_at">;

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price?: number | null;
  duration_minutes?: number | null;
  status?: ServiceStatus | null;
  icon?: string | null;
  created_at?: string | null;
};

export type AdminStats = {
  totalAppointments: number;
  newAppointments: number;
  availableAdoptions: number;
  activeServices: number;
};
