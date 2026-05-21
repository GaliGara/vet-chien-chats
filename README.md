# Chiens & Chats

Landing y web app mobile-first para reservacion de citas y procesos de adopcion,
con Next.js App Router, Tailwind CSS, shadcn/ui, Framer Motion, Supabase,
react-hook-form, zod y sonner.

## Rutas principales

- `/` landing completa
- `/citas` formulario de reservacion
- `/adopciones` adopciones conectadas a Supabase
- `/admin` dashboard
- `/admin/login` login con Supabase Auth
- `/admin/citas` gestion de citas
- `/admin/adopciones` gestion de adopciones
- `/admin/servicios` vista de servicios

## Getting Started

Primero configura `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_WHATSAPP_NUMBER=525500000000 # opcional
```

Luego corre el servidor local:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase

Tablas esperadas:

- `appointments`
- `pets_for_adoption`
- `services`

Las columnas y policies sugeridas estan en:

- `docs/supabase-policies.md`

## Admin

El login usa `supabase.auth.signInWithPassword`. Si todavia no tienes usuarios,
el panel permite una "Revision local" para revisar UI, pero las escrituras reales
dependen de las policies de Supabase.

## Verificacion

```bash
npm run lint
npm run build
```

`next/font/google` necesita acceso a internet durante `next build` para resolver
Playfair Display e Inter.
