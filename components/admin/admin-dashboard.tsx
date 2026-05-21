"use client";

import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Heart,
  PawPrint,
  Sparkles,
} from "lucide-react";
import type { AdminStats, Appointment, PetForAdoption } from "@/types/database";
import {
  getAdminStats,
  getAppointments,
  getPetsForAdoption,
} from "@/lib/supabase-queries";
import { formatDate } from "@/lib/format";
import { AdminShell } from "@/components/admin/admin-shell";
import { AppointmentStatusBadge, PetStatusBadge } from "@/components/admin/status-badge";

const emptyStats: AdminStats = {
  totalAppointments: 0,
  newAppointments: 0,
  availableAdoptions: 0,
  activeServices: 0,
};

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<PetForAdoption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getAppointments(), getPetsForAdoption()])
      .then(([nextStats, nextAppointments, nextPets]) => {
        setStats(nextStats);
        setAppointments(nextAppointments.slice(0, 3));
        setPets(nextPets.slice(0, 3));
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AdminShell
      title="Resumen"
      description="Una vista rapida para revisar citas recientes, adopciones disponibles y servicios activos desde celular."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total citas"
          value={stats.totalAppointments}
          icon={CalendarDays}
          loading={isLoading}
        />
        <StatCard
          label="Citas nuevas"
          value={stats.newAppointments}
          icon={Sparkles}
          loading={isLoading}
        />
        <StatCard
          label="Adopciones disponibles"
          value={stats.availableAdoptions}
          icon={PawPrint}
          loading={isLoading}
        />
        <StatCard
          label="Servicios activos"
          value={stats.activeServices}
          icon={BriefcaseBusiness}
          loading={isLoading}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-[#E8D6DE] bg-white p-5 shadow-[0_16px_44px_rgb(91_58_99/0.07)]">
          <h2 className="font-heading text-3xl text-[#2F2433]">
            Citas recientes
          </h2>
          <div className="mt-5 grid gap-3">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="rounded-[1.4rem] border border-[#E8D6DE] bg-[#FFFDFB] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#2F2433]">
                        {appointment.client_name}
                      </p>
                      <p className="mt-1 text-sm text-[#7B6A80]">
                        {appointment.pet_name} · {appointment.service}
                      </p>
                    </div>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#A7353F]">
                    {formatDate(appointment.preferred_date)} ·{" "}
                    {appointment.preferred_time}
                  </p>
                </article>
              ))
            ) : (
              <EmptyLine text="Sin citas registradas todavia." />
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#E8D6DE] bg-white p-5 shadow-[0_16px_44px_rgb(91_58_99/0.07)]">
          <h2 className="font-heading text-3xl text-[#2F2433]">
            Adopciones
          </h2>
          <div className="mt-5 grid gap-3">
            {pets.length > 0 ? (
              pets.map((pet) => (
                <article
                  key={pet.id}
                  className="flex items-center gap-3 rounded-[1.4rem] border border-[#E8D6DE] bg-[#FFFDFB] p-3"
                >
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#FFF6F8] text-[#A7353F]">
                    <Heart className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#2F2433]">
                      {pet.name}
                    </p>
                    <p className="truncate text-sm text-[#7B6A80]">
                      {pet.species}
                      {pet.breed ? ` · ${pet.breed}` : ""}
                    </p>
                  </div>
                  <PetStatusBadge status={pet.status} />
                </article>
              ))
            ) : (
              <EmptyLine text="Sin mascotas cargadas por ahora." />
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  icon: typeof CalendarDays;
  loading: boolean;
}) {
  return (
    <article className="rounded-[1.75rem] border border-[#E8D6DE] bg-white p-5 shadow-[0_16px_44px_rgb(91_58_99/0.07)]">
      <div className="mb-5 flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-2xl bg-[#FFF6F8] text-[#A7353F]">
          <Icon className="size-5" />
        </span>
      </div>
      {loading ? (
        <div className="h-10 w-16 animate-pulse rounded-full bg-[#F7F1FA]" />
      ) : (
        <p className="font-heading text-5xl text-[#2F2433]">{value}</p>
      )}
      <p className="mt-2 text-sm font-semibold text-[#7B6A80]">{label}</p>
    </article>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-[#D9C6E8] bg-[#F7F1FA]/60 p-5 text-sm text-[#7B6A80]">
      {text}
    </div>
  );
}
