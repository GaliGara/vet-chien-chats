import { Badge } from "@/components/ui/badge";
import {
  appointmentStatusLabels,
  petStatusLabels,
} from "@/constants/site";
import type { AppointmentStatus, PetAdoptionStatus } from "@/types/database";
import { cn } from "@/lib/utils";

const statusClassName = {
  nueva: "border-[#F7C8D9] bg-[#FFF6F8] text-[#A7353F]",
  confirmada: "border-[#D9C6E8] bg-[#F7F1FA] text-[#5B3A63]",
  cancelada: "border-[#E8D6DE] bg-white text-[#7B6A80]",
  atendida: "border-[#C89B8C] bg-[#FFF6F8] text-[#8E2D36]",
  disponible: "border-[#D9C6E8] bg-[#F7F1FA] text-[#5B3A63]",
  en_proceso: "border-[#F7C8D9] bg-[#FFF6F8] text-[#A7353F]",
  adoptado: "border-[#E8D6DE] bg-white text-[#7B6A80]",
};

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-3 py-1", statusClassName[status])}
    >
      {appointmentStatusLabels[status] ?? status}
    </Badge>
  );
}

export function PetStatusBadge({ status }: { status: PetAdoptionStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-3 py-1", statusClassName[status])}
    >
      {petStatusLabels[status] ?? status}
    </Badge>
  );
}
