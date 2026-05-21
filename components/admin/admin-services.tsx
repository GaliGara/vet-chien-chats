"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness, Clock, RefreshCw } from "lucide-react";
import { fallbackServices } from "@/constants/site";
import type { Service } from "@/types/database";
import { getServices } from "@/lib/supabase-queries";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminNotice } from "@/components/admin/admin-notice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AdminServices() {
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadServices() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getServices({ throwOnError: true });
      setServices(data.length > 0 ? data : fallbackServices);
    } catch (error) {
      setServices([]);
      setErrorMessage(getSupabaseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    getServices({ throwOnError: true })
      .then((data) => {
        if (isMounted) setServices(data.length > 0 ? data : fallbackServices);
      })
      .catch((error) => {
        if (isMounted) {
          setServices([]);
          setErrorMessage(getSupabaseErrorMessage(error));
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AdminShell
      title="Servicios"
      description="Vista ligera de servicios activos. Esta base queda lista para convertirla en CRUD si quieres administrarlos desde el panel."
    >
      <div className="mb-5 flex justify-end">
        <Button
          type="button"
          onClick={loadServices}
          variant="outline"
          className="h-10 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63]"
        >
          <RefreshCw className="size-4" />
          Actualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-[1.75rem] bg-[#FFF6F8]"
            />
          ))}
        </div>
      ) : errorMessage ? (
        <AdminNotice
          title="No se pudieron cargar servicios"
          text={errorMessage}
        />
      ) : services.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className="rounded-[1.75rem] border border-[#E8D6DE] bg-white p-5 shadow-[0_16px_44px_rgb(91_58_99/0.07)]"
            >
              <div className="mb-6 flex items-start justify-between gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#F7F1FA] text-[#5B3A63]">
                  <BriefcaseBusiness className="size-6" />
                </span>
                <Badge className="rounded-full bg-[#FFF6F8] px-3 py-1 text-[#A7353F]">
                  {service.status ?? "activo"}
                </Badge>
              </div>
              <h2 className="font-heading text-3xl text-[#2F2433]">
                {service.name}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#7B6A80]">
                {service.description ??
                  "Servicio preparado para reserva y seguimiento."}
              </p>
              {service.duration_minutes ? (
                <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F7F1FA] px-3 py-1 text-xs font-semibold text-[#5B3A63]">
                  <Clock className="size-3.5" />
                  {service.duration_minutes} min
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <AdminNotice
          title="Sin servicios configurados"
          text="Agrega servicios en Supabase para mostrarlos aqui y en la landing."
        />
      )}
    </AdminShell>
  );
}
