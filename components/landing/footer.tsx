import Link from "next/link";
import { AtSign, Mail, MapPin, Phone } from "lucide-react";
import { brand, navItems } from "@/constants/site";

export function Footer() {
  return (
    <footer
      id="contacto"
      className="border-t border-[#E8D6DE] bg-[#FFF6F8] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Link href="/#inicio" className="font-heading text-3xl text-[#2F2433]">
            {brand.name}
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#7B6A80]">
            Reservacion de citas y procesos de adopcion con una experiencia
            premium, calida y profundamente humana.
          </p>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#A7353F]">
            Navegacion
          </p>
          <div className="grid gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[#7B6A80] transition hover:text-[#A7353F]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#A7353F]">
            Contacto
          </p>
          <div className="grid gap-3 text-sm text-[#7B6A80]">
            <span className="flex items-center gap-2">
              <Phone className="size-4 text-[#5B3A63]" />
              {brand.phone}
            </span>
            <span className="flex items-center gap-2">
              <Mail className="size-4 text-[#5B3A63]" />
              {brand.email}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-[#5B3A63]" />
              {brand.location}
            </span>
            <span className="flex items-center gap-2">
              <AtSign className="size-4 text-[#5B3A63]" />
              @chienschats
            </span>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-[#E8D6DE] pt-6 text-xs text-[#7B6A80] sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 {brand.name}. Todos los derechos reservados.</span>
        <Link href="/admin" className="w-fit hover:text-[#A7353F]">
          Acceso admin
        </Link>
      </div>
    </footer>
  );
}
