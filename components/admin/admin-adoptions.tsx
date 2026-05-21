"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { Edit3, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  adoptionFallbackImage,
  petStatusLabels,
  petStatusOptions,
} from "@/constants/site";
import type {
  PetAdoptionStatus,
  PetForAdoption,
  PetForAdoptionInput,
} from "@/types/database";
import {
  createPetForAdoption,
  deletePetForAdoption,
  getPetsForAdoption,
  updatePetForAdoption,
} from "@/lib/supabase-queries";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminNotice } from "@/components/admin/admin-notice";
import { PetStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PetFormState = {
  name: string;
  species: string;
  breed: string;
  age: string;
  sex: string;
  short_description: string;
  image_url: string;
  status: PetAdoptionStatus;
};

const emptyPetForm: PetFormState = {
  name: "",
  species: "Perro",
  breed: "",
  age: "",
  sex: "",
  short_description: "",
  image_url: "",
  status: "disponible",
};

export function AdminAdoptions() {
  const [pets, setPets] = useState<PetForAdoption[]>([]);
  const [filter, setFilter] = useState<PetAdoptionStatus | "todas">("todas");
  const [isLoading, setIsLoading] = useState(true);
  const [editingPet, setEditingPet] = useState<PetForAdoption | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadPets() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getPetsForAdoption(undefined, { throwOnError: true });
      setPets(data);
    } catch (error) {
      setPets([]);
      setErrorMessage(getSupabaseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    getPetsForAdoption(undefined, { throwOnError: true })
      .then((data) => {
        if (isMounted) setPets(data);
      })
      .catch((error) => {
        if (isMounted) {
          setPets([]);
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

  const filteredPets = useMemo(() => {
    if (filter === "todas") return pets;
    return pets.filter((pet) => pet.status === filter);
  }, [pets, filter]);

  function openCreateDialog() {
    setEditingPet(null);
    setDialogOpen(true);
  }

  function openEditDialog(pet: PetForAdoption) {
    setEditingPet(pet);
    setDialogOpen(true);
  }

  async function handleDelete(pet: PetForAdoption) {
    const confirmed = window.confirm(
      `Eliminar el perfil de ${pet.name}? Esta accion no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      await deletePetForAdoption(pet.id);
      setPets((current) => current.filter((item) => item.id !== pet.id));
      toast.success("Mascota eliminada");
    } catch (error) {
      toast.error("No se pudo eliminar", {
        description: getSupabaseErrorMessage(error),
      });
    }
  }

  async function handleStatusChange(pet: PetForAdoption, status: PetAdoptionStatus) {
    try {
      const updated = await updatePetForAdoption(pet.id, { status });
      setPets((current) =>
        current.map((item) => (item.id === pet.id ? { ...item, ...updated } : item))
      );
      toast.success("Status actualizado");
    } catch (error) {
      toast.error("No se pudo actualizar", {
        description: getSupabaseErrorMessage(error),
      });
    }
  }

  return (
    <AdminShell
      title="Adopciones"
      description="Crea, edita y mantiene perfiles visuales para mascotas en adopcion, con estados faciles de cambiar desde el celular."
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["todas", ...petStatusOptions] as const).map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={filter === status}
              onClick={() => setFilter(status)}
              className={`min-w-fit rounded-full border px-4 py-2 text-sm font-semibold transition ${
                filter === status
                  ? "border-[#A7353F] bg-[#A7353F] text-[#FFFDFB]"
                  : "border-[#E8D6DE] bg-white text-[#5B3A63] hover:bg-[#FFF6F8]"
              }`}
            >
              {status === "todas" ? "Todas" : petStatusLabels[status]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            type="button"
            onClick={loadPets}
            variant="outline"
            className="h-10 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63]"
          >
            <RefreshCw className="size-4" />
            Actualizar
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                onClick={openCreateDialog}
                className="h-10 rounded-full bg-[#A7353F] text-[#FFFDFB] hover:bg-[#8E2D36]"
              >
                <Plus className="size-4" />
                Crear
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[88svh] overflow-y-auto rounded-[2rem] border-[#E8D6DE] bg-[#FFFDFB] sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading text-3xl text-[#2F2433]">
                  {editingPet ? "Editar adopcion" : "Nueva adopcion"}
                </DialogTitle>
              </DialogHeader>
              <PetForm
                key={editingPet?.id ?? "new"}
                pet={editingPet}
                onSaved={(savedPet) => {
                  setPets((current) => {
                    const exists = current.some((item) => item.id === savedPet.id);
                    if (exists) {
                      return current.map((item) =>
                        item.id === savedPet.id ? savedPet : item
                      );
                    }
                    return [savedPet, ...current];
                  });
                  setDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-[1.75rem] bg-[#FFF6F8]"
            />
          ))}
        </div>
      ) : errorMessage ? (
        <AdminNotice
          title="No se pudieron cargar adopciones"
          text={errorMessage}
        />
      ) : filteredPets.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredPets.map((pet) => (
            <PetAdminCard
              key={pet.id}
              pet={pet}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <AdminNotice
          title="Sin mascotas en este filtro"
          text="Crea un perfil nuevo o cambia el status de una mascota para verla en esta vista."
        />
      )}
    </AdminShell>
  );
}

function PetAdminCard({
  pet,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  pet: PetForAdoption;
  onEdit: (pet: PetForAdoption) => void;
  onDelete: (pet: PetForAdoption) => void;
  onStatusChange: (pet: PetForAdoption, status: PetAdoptionStatus) => void;
}) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-[#E8D6DE] bg-white shadow-[0_16px_44px_rgb(91_58_99/0.07)]">
      <div className="relative aspect-[5/3] bg-[#F7F1FA]">
        <img
          src={pet.image_url || adoptionFallbackImage}
          alt={`Foto de ${pet.name}`}
          onError={(event) => {
            event.currentTarget.src = adoptionFallbackImage;
          }}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-4 top-4">
          <PetStatusBadge status={pet.status} />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-3xl text-[#2F2433]">{pet.name}</h2>
            <p className="mt-1 text-sm font-semibold text-[#A7353F]">
              {pet.species}
              {pet.breed ? ` · ${pet.breed}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              onClick={() => onEdit(pet)}
              className="rounded-full border-[#E8D6DE] bg-white text-[#5B3A63]"
              aria-label={`Editar ${pet.name}`}
            >
              <Edit3 className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              onClick={() => onDelete(pet)}
              className="rounded-full border-[#E8D6DE] bg-white text-[#A7353F]"
              aria-label={`Eliminar ${pet.name}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#7B6A80]">
          {pet.age ? <span className="rounded-full bg-[#F7F1FA] px-3 py-1">{pet.age}</span> : null}
          {pet.sex ? <span className="rounded-full bg-[#F7F1FA] px-3 py-1">{pet.sex}</span> : null}
        </div>

        <p className="mt-4 text-sm leading-7 text-[#7B6A80]">
          {pet.short_description ?? pet.description ?? "Sin descripcion breve."}
        </p>

        <select
          aria-label={`Cambiar status de adopcion de ${pet.name}`}
          value={pet.status}
          onChange={(event) =>
            onStatusChange(pet, event.target.value as PetAdoptionStatus)
          }
          className="mt-5 h-11 w-full rounded-full border border-[#E8D6DE] bg-[#FFFDFB] px-4 text-sm font-semibold text-[#5B3A63] focus-visible:ring-3 focus-visible:ring-[#DFA2BA]/45"
        >
          {petStatusOptions.map((status) => (
            <option key={status} value={status}>
              {petStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}

function PetForm({
  pet,
  onSaved,
}: {
  pet: PetForAdoption | null;
  onSaved: (pet: PetForAdoption) => void;
}) {
  const [form, setForm] = useState<PetFormState>(() =>
    pet
      ? {
          name: pet.name,
          species: pet.species,
          breed: pet.breed ?? "",
          age: pet.age ?? "",
          sex: pet.sex ?? "",
          short_description: pet.short_description ?? pet.description ?? "",
          image_url: pet.image_url ?? "",
          status: pet.status,
        }
      : emptyPetForm
  );
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field: keyof PetFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.species.trim()) {
      toast.error("Nombre y especie son obligatorios");
      return;
    }

    const payload: PetForAdoptionInput = {
      name: form.name.trim(),
      species: form.species.trim(),
      breed: form.breed.trim() || null,
      age: form.age.trim() || null,
      sex: form.sex.trim() || null,
      short_description: form.short_description.trim() || null,
      description: form.short_description.trim() || null,
      image_url: form.image_url.trim() || null,
      status: form.status,
    };

    setIsSaving(true);
    try {
      const savedPet = pet
        ? await updatePetForAdoption(pet.id, payload)
        : await createPetForAdoption(payload);
      toast.success(pet ? "Adopcion actualizada" : "Adopcion creada");
      onSaved(savedPet);
    } catch (error) {
      toast.error("No se pudo guardar", {
        description: getSupabaseErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nombre"
          value={form.name}
          onChange={(value) => updateField("name", value)}
          required
        />
        <TextField
          label="Especie"
          value={form.species}
          onChange={(value) => updateField("species", value)}
          required
        />
        <TextField
          label="Raza"
          value={form.breed}
          onChange={(value) => updateField("breed", value)}
        />
        <TextField
          label="Edad"
          value={form.age}
          onChange={(value) => updateField("age", value)}
        />
        <TextField
          label="Sexo"
          value={form.sex}
          onChange={(value) => updateField("sex", value)}
        />
        <label>
          <span className="mb-2 block text-sm font-semibold text-[#5B3A63]">
            Status
          </span>
          <select
            aria-label="Status de adopcion"
            value={form.status}
            onChange={(event) =>
              updateField("status", event.target.value as PetAdoptionStatus)
            }
            className="h-12 w-full rounded-2xl border border-[#E8D6DE] bg-white px-3 text-sm text-[#2F2433]"
          >
            {petStatusOptions.map((status) => (
              <option key={status} value={status}>
                {petStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <TextField
        label="Imagen URL"
        value={form.image_url}
        onChange={(value) => updateField("image_url", value)}
      />

      <label>
        <span className="mb-2 block text-sm font-semibold text-[#5B3A63]">
          Descripcion breve
        </span>
        <Textarea
          value={form.short_description}
          onChange={(event) =>
            updateField("short_description", event.target.value)
          }
          className="min-h-28 rounded-2xl border-[#E8D6DE] bg-white"
        />
      </label>

      <Button
        disabled={isSaving}
        className="h-12 rounded-full bg-[#A7353F] text-[#FFFDFB] hover:bg-[#8E2D36]"
      >
        {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
        {pet ? "Guardar cambios" : "Crear adopcion"}
      </Button>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-[#5B3A63]">
        {label}
      </span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        aria-label={label}
        className="h-12 rounded-2xl border-[#E8D6DE] bg-white"
      />
    </label>
  );
}
