import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const ADOPTION_PETS_BUCKET = "adoption-pets";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function validateAdoptionImage(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Sube una imagen PNG, JPG o WebP.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("La imagen no debe pesar más de 5 MB.");
  }
}

export async function uploadAdoptionPetImage(file: File, petName?: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no está configurado.");
  }

  validateAdoptionImage(file);

  const extension = getImageExtension(file);
  const folder = new Date().toISOString().slice(0, 10);
  const safeName = slugify(petName || "mascota");
  const fileName = `${folder}/${safeName}-${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(ADOPTION_PETS_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(ADOPTION_PETS_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

function getImageExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && ["png", "jpg", "jpeg", "webp"].includes(extension)) {
    return extension === "jpeg" ? "jpg" : extension;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "mascota";
}
