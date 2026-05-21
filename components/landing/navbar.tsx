"use client";

import Link from "next/link";
import { Heart, Menu } from "lucide-react";
import { brand, navItems } from "@/constants/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E8D6DE]/70 bg-[#FFFDFB]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/#inicio" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-[#FFF6F8] text-[#A7353F] ring-1 ring-[#E8D6DE]">
            <Heart className="size-4 fill-[#F7C8D9]" />
          </span>
          <span className="font-heading text-xl font-semibold text-[#2F2433]">
            {brand.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#7B6A80] transition hover:text-[#A7353F]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            asChild
            className="h-10 rounded-full bg-[#A7353F] px-5 text-[#FFFDFB] hover:bg-[#8E2D36]"
          >
            <Link href="/#citas">Reservar cita</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-full border-[#E8D6DE] bg-white/70 px-5 text-[#5B3A63] hover:bg-[#FFF6F8]"
          >
            <Link href="/admin">Admin</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon-lg"
              variant="outline"
              className="rounded-full border-[#E8D6DE] bg-white/80 text-[#5B3A63] lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[86vw] border-[#E8D6DE] bg-[#FFFDFB]">
            <SheetHeader className="border-b border-[#E8D6DE]">
              <SheetTitle className="font-heading text-xl text-[#2F2433]">
                {brand.name}
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 px-4" aria-label="Menu movil">
              {navItems.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-2xl px-4 py-3 text-base font-medium text-[#5B3A63] transition hover:bg-[#FFF6F8]"
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto grid gap-3 p-4">
              <SheetClose asChild>
                <Button
                  asChild
                  className="h-12 rounded-full bg-[#A7353F] text-[#FFFDFB] hover:bg-[#8E2D36]"
                >
                  <Link href="/#citas">Reservar cita</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-[#E8D6DE] text-[#5B3A63]"
                >
                  <Link href="/admin">Entrar a admin</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
