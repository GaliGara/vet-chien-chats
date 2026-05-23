"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Cat,
  Dog,
  Edit3,
  EyeOff,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  petStatusLabels,
  petStatusOptions,
} from "@/constants/site";
import type {
  PetAdoptionStatus,
  PetForAdoption,
  PetForAdoptionInput,
} from "@/types/database";
import {
  archivePetForAdoption,
  createPetForAdoption,
  getPetsForAdoption,
  updatePetForAdoption,
} from "@/lib/supabase-queries";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import {
  uploadAdoptionPetImage,
  validateAdoptionImage,
} from "@/lib/supabase-storage";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminNotice } from "@/components/admin/admin-notice";
import { PetStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  description: string;
  requirements: string;
  image_url: string;
  status: PetAdoptionStatus;
};

const emptyPetForm: PetFormState = {
  name: "",
  species: "Perro",
  breed: "",
  age: "",
  sex: "",
  description: "",
  requirements: "",
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

  async function handleArchive(pet: PetForAdoption) {
    const confirmed = window.confirm(
      `¿Ocultar el perfil de ${pet.name}? Ya no aparecerá como disponible para adopción.`
    );

    if (!confirmed) return;

    try {
      const updated = await archivePetForAdoption(pet.id);
      setPets((current) =>
        current.map((item) => (item.id === pet.id ? { ...item, ...updated } : item))
      );
      toast.success("Mascota oculta");
    } catch (error) {
      toast.error("No se pudo ocultar", {
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
      description="Crea, edita y mantiene perfiles visuales para mascotas en adopción, con estados fáciles de cambiar desde el celular."
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
            <DialogContent className="h-[min(90dvh,780px)] overflow-hidden rounded-[2rem] border-[#E8D6DE] bg-[#FFFDFB] p-0 sm:max-w-2xl">
              <DialogHeader className="border-b border-[#E8D6DE] bg-[#FFFDFB] px-5 pb-3 pt-5">
                <DialogTitle className="font-heading text-3xl text-[#2F2433]">
                  {editingPet ? "Editar adopción" : "Nueva adopción"}
                </DialogTitle>
                <DialogDescription className="text-sm text-[#7B6A80]">
                  Crea o edita perfiles para adopcion con foto, estado y requisitos.
                </DialogDescription>
              </DialogHeader>
              <div className="modal-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-5">
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
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-[1.4rem] bg-[#FFF6F8]"
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
              onArchive={handleArchive}
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
  onArchive,
  onStatusChange,
}: {
  pet: PetForAdoption;
  onEdit: (pet: PetForAdoption) => void;
  onArchive: (pet: PetForAdoption) => void;
  onStatusChange: (pet: PetForAdoption, status: PetAdoptionStatus) => void;
}) {
  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-[#E8D6DE] bg-white shadow-[0_12px_30px_rgb(91_58_99/0.07)]">
      <div className="relative aspect-[16/10] bg-[#F7F1FA]">
        <PetAdminMedia pet={pet} />
        <div className="absolute left-3 top-3">
          <PetStatusBadge status={pet.status} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl leading-tight text-[#2F2433]">
              {pet.name}
            </h2>
            <p className="mt-0.5 text-sm font-semibold text-[#A7353F]">
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
              onClick={() => onArchive(pet)}
              className="rounded-full border-[#E8D6DE] bg-white text-[#A7353F]"
              aria-label={`Ocultar ${pet.name}`}
            >
              <EyeOff className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#7B6A80]">
          {pet.age ? <span className="rounded-full bg-[#F7F1FA] px-3 py-1">{pet.age}</span> : null}
          {pet.sex ? <span className="rounded-full bg-[#F7F1FA] px-3 py-1">{pet.sex}</span> : null}
        </div>

        <p className="mt-3 text-sm leading-6 text-[#7B6A80]">
          {pet.description ?? "Sin descripción breve."}
        </p>
        {pet.requirements ? (
          <div className="mt-3 rounded-[1rem] bg-[#FFF6F8] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A7353F]">
              Requisitos
            </p>
            <p className="mt-1.5 text-sm leading-6 text-[#7B6A80]">
              {pet.requirements}
            </p>
          </div>
        ) : null}

        <select
          aria-label={`Cambiar status de adopción de ${pet.name}`}
          value={pet.status}
          onChange={(event) =>
            onStatusChange(pet, event.target.value as PetAdoptionStatus)
          }
          className="mt-3 h-10 w-full rounded-full border border-[#E8D6DE] bg-[#FFFDFB] px-3 text-sm font-semibold text-[#5B3A63] focus-visible:ring-3 focus-visible:ring-[#DFA2BA]/45"
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

function PetAdminMedia({ pet }: { pet: PetForAdoption }) {
  const [hasImage, setHasImage] = useState(Boolean(pet.image_url));

  if (hasImage && pet.image_url) {
    return (
      <img
        src={pet.image_url}
        alt={`Foto de ${pet.name}`}
        onError={() => setHasImage(false)}
        className="h-full w-full object-cover"
      />
    );
  }

  const Icon = pet.species.toLowerCase().includes("gato") ? Cat : Dog;

  return (
    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#F7F1FA_0%,#FFFDFB_52%,#FFF6F8_100%)]">
      <div className="rounded-[1.5rem] border border-white/80 bg-white/60 p-5 text-center shadow-xl backdrop-blur">
        <Icon className="mx-auto size-10 text-[#A7353F]" />
        <p className="mt-3 font-heading text-2xl text-[#2F2433]">{pet.name}</p>
      </div>
    </div>
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
          description: pet.description ?? "",
          requirements: pet.requirements ?? "",
          image_url: pet.image_url ?? "",
          status: pet.status,
        }
      : emptyPetForm
  );
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(pet?.image_url ?? "");
  const [imageRemoved, setImageRemoved] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function updateField(field: keyof PetFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      validateAdoptionImage(file);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setImageRemoved(false);
    } catch (error) {
      event.currentTarget.value = "";
      toast.error("Imagen no válida", {
        description:
          error instanceof Error
            ? error.message
            : "Sube una imagen PNG, JPG o WebP de máximo 5 MB.",
      });
    }
  }

  function removeImage() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setImageRemoved(true);
    setForm((current) => ({ ...current, image_url: "" }));
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.species.trim()) {
      toast.error("Nombre y especie son obligatorios");
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = imageRemoved ? null : form.image_url.trim() || null;

      if (selectedFile) {
        imageUrl = await uploadAdoptionPetImage(selectedFile, form.name.trim());
      }

      const payload: PetForAdoptionInput = {
        name: form.name.trim(),
        species: form.species.trim(),
        breed: form.breed.trim() || null,
        age: form.age.trim() || null,
        sex: form.sex.trim() || null,
        description: form.description.trim() || null,
        requirements: form.requirements.trim() || null,
        image_url: imageUrl,
        status: form.status,
      };

      const savedPet = pet
        ? await updatePetForAdoption(pet.id, payload)
        : await createPetForAdoption(payload);
      toast.success(pet ? "Adopción actualizada" : "Adopción creada");
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
            aria-label="Status de adopción"
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

      <div className="rounded-[1.4rem] border border-dashed border-[#E8D6DE] bg-[#FFF6F8]/55 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#5B3A63]">
              Foto de adopción
            </p>
            <p className="mt-1 text-xs leading-5 text-[#7B6A80]">
              PNG, JPG o WebP. Tamaño máximo 5 MB.
            </p>
          </div>
          {previewUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={removeImage}
              className="rounded-full text-[#A7353F] hover:bg-white"
              aria-label="Quitar imagen"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>

        {previewUrl ? (
          <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-white/80 bg-white shadow-sm">
            <img
              src={previewUrl}
              alt="Preview de foto de adopción"
              className="aspect-[5/3] w-full object-cover"
            />
          </div>
        ) : (
          <div className="mt-4 grid min-h-36 place-items-center rounded-[1.2rem] border border-white/80 bg-white/75 text-center">
            <div>
              <ImagePlus className="mx-auto size-8 text-[#A7353F]" />
              <p className="mt-2 text-sm font-semibold text-[#5B3A63]">
                Agrega una foto luminosa
              </p>
              <p className="mt-1 text-xs text-[#7B6A80]">
                También puedes guardar sin imagen.
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="sr-only"
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={openFilePicker}
            className="h-10 rounded-full border-[#E8D6DE] bg-white text-[#5B3A63] hover:bg-[#FFFDFB]"
          >
            <ImagePlus className="size-4" />
            {selectedFile || previewUrl ? "Cambiar foto" : "Elegir foto"}
          </Button>
          {selectedFile ? (
            <p
              className="max-w-[14rem] truncate text-xs text-[#7B6A80]"
              title={selectedFile.name}
            >
              {selectedFile.name}
            </p>
          ) : null}
        </div>
      </div>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[#5B3A63]">
          Descripcion breve
        </span>
        <Textarea
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          className="min-h-28 rounded-2xl border-[#E8D6DE] bg-white"
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-semibold text-[#5B3A63]">
          Requisitos
        </span>
        <Textarea
          value={form.requirements}
          onChange={(event) => updateField("requirements", event.target.value)}
          className="min-h-24 rounded-2xl border-[#E8D6DE] bg-white"
          placeholder="Ej. hogar seguro, entrevista, seguimiento..."
        />
      </label>

      <div className="sticky bottom-0 z-10 bg-[#FFFDFB] pt-1">
        <Button
          disabled={isSaving}
          className="h-12 w-full rounded-full bg-[#A7353F] text-[#FFFDFB] hover:bg-[#8E2D36]"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
          {isSaving && selectedFile
            ? "Subiendo imagen..."
            : pet
              ? "Guardar cambios"
              : "Crear adopción"}
        </Button>
      </div>
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
