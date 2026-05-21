# Chiens & Chats

Web app / landing mobile-first para reservacion de citas y procesos de adopcion.
La experiencia visual busca sentirse premium, calida, femenina, humana y
profesional.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Supabase
- react-hook-form
- zod
- sonner
- lucide-react

## Requisitos

- Node.js compatible con Next.js 16
- npm
- Proyecto de Supabase con anon key publica
- Acceso a internet durante `next build` si usas `next/font/google`

## Instalacion

```bash
npm install
```

## Variables de entorno

Crea `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
NEXT_PUBLIC_WHATSAPP_NUMBER=525500000000
```

`NEXT_PUBLIC_WHATSAPP_NUMBER` es opcional. Usalo sin espacios, signos ni guiones.
Nunca pongas `service_role`, secret keys ni credenciales privadas en frontend.

## Desarrollo local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Verificacion

```bash
npm run lint
npm run build
```

En Windows, si PowerShell bloquea `npm.ps1`, usa:

```bash
npm.cmd run lint
npm.cmd run build
```

`next/font/google` descarga Inter y Playfair Display durante build. Si el build
falla solo por red al descargar fuentes, repitelo con conexion o cambia a fuentes
locales antes de produccion.

## Rutas

- `/` landing completa
- `/citas` formulario de reservacion
- `/adopciones` adopciones conectadas a Supabase
- `/admin` dashboard mobile-first
- `/admin/login` login con Supabase Auth
- `/admin/citas` gestion de citas
- `/admin/adopciones` gestion de adopciones
- `/admin/servicios` vista de servicios

## Supabase

Tablas esperadas:

- `appointments`
- `pets_for_adoption`
- `services`

El SQL sugerido para schema y RLS esta en:

- `docs/supabase-policies.md`

El formulario publico inserta en `appointments` con status `nueva`.
La landing lee mascotas `disponible` y servicios `activo`.
El panel admin usa Supabase Auth para leer/editar datos.

## Crear usuario admin

1. En Supabase, ve a Authentication.
2. Crea un usuario con email y password.
3. Usa esas credenciales en `/admin/login`.
4. Antes de produccion, restringe las policies a usuarios admin reales si no
   quieres que cualquier usuario autenticado administre datos.

## Modo Revision local

El panel tiene un modo "Revision local" para revisar la interfaz sin configurar
Auth todavia. Este modo solo desbloquea visualmente el admin en el navegador.
Las escrituras reales siguen dependiendo de Supabase y sus policies.

Antes de produccion, considera remover este modo o protegerlo con una variable
de entorno si no quieres exponer una vista de revision.

## Deploy en Vercel

1. Sube el repo a GitHub/GitLab/Bitbucket.
2. Crea un proyecto en Vercel.
3. Configura las variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` opcional
4. Ejecuta el SQL de `docs/supabase-policies.md` en Supabase.
5. Verifica `npm run build` en Vercel.

No necesitas secret keys para esta version.

## Pendientes para produccion

- Definir politicas de admin mas estrictas por rol o allowlist.
- Revisar textos finales, telefono, email y redes reales.
- Cargar servicios y mascotas reales en Supabase.
- Decidir si el modo "Revision local" se elimina o se protege.
- Configurar dominio y metadata social final.
