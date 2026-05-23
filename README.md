# Chiens et Chats

Web app y landing mobile-first para una veterinaria boutique enfocada en:

- citas veterinarias
- estetica canina
- adopciones responsables
- panel admin privado para gestion diaria

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Supabase (DB + Auth + Storage)
- react-hook-form + zod
- sonner
- lucide-react
- Resend

## Requisitos

- Node.js compatible con Next.js 16
- npm
- Proyecto de Supabase
- Cuenta de Resend (si quieres correos)

## Instalacion

```bash
npm install
```

## Variables de entorno

Crea `/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
NEXT_PUBLIC_WHATSAPP_NUMBER=525500000000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Solo server-side (NO frontend)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
RESEND_API_KEY=tu-api-key-de-resend
ADMIN_EMAIL=admin@tudominio.com
ADMIN_LOGIN_USERNAME=lizeth
ADMIN_LOGIN_EMAIL=correo-real-de-lizeth@gmail.com
RESEND_FROM_EMAIL="Chiens et Chats <citas@tudominio.com>"
```

Notas:

- `NEXT_PUBLIC_WHATSAPP_NUMBER` es opcional.
- `RESEND_FROM_EMAIL` es opcional (si falta, usa `onboarding@resend.dev`).
- Nunca uses secret keys en frontend.
- `SUPABASE_SERVICE_ROLE_KEY` se usa solo en `/api/appointments/availability`.
- `ADMIN_LOGIN_EMAIL` y `ADMIN_LOGIN_USERNAME` son solo server-side.
- En `/admin/login`, Lizeth escribe `ADMIN_LOGIN_USERNAME` + password.
- El login server-side mapea ese usuario a `ADMIN_LOGIN_EMAIL`.

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

Si el build falla solo por descarga de Google Fonts, repite con conexion o migra
fuentes a local antes de produccion.

## Rutas

- `/` landing
- `/citas` reservacion publica
- `/adopciones` adopciones publicas
- `/admin` resumen
- `/admin/login` login privado
- `/admin/citas` gestion de citas
- `/admin/adopciones` gestion de adopciones
- `/admin/servicios` gestion de servicios

## Flujo de citas

### Publico

1. El usuario envia solicitud.
2. Se guarda en `appointments` con `status = nueva`.
3. Se intenta enviar correo al admin y al cliente (si hay email).
4. Si correo falla, la cita no se pierde.
5. Si canal es WhatsApp, se ofrece CTA para continuar en WhatsApp.

### Admin

- Nuevas: CTA principal `Confirmar cita`.
- Confirmadas: CTA principal `Marcar atendida`.
- Al marcar atendida: modal con opciones:
  - conservar como atendida
  - eliminar cita
  - cancelar

## Disponibilidad de horarios

- Horario laboral: `09:00` a `18:00`.
- Intervalo: cada 30 minutos.
- Se bloquean horarios ocupados por citas `confirmada` del mismo dia.
- Endpoint publico minimo:
  - `GET /api/appointments/availability?date=YYYY-MM-DD`
  - Respuesta: `{ date, booked_times }`
  - No expone datos privados de citas.

## Supabase

Tablas esperadas:

- `appointments`
- `pets_for_adoption`
- `services`
- `app_admins` (allowlist admin)

Storage esperado:

- Bucket publico `adoption-pets`

SQL recomendado de schema y RLS:

- `docs/supabase-policies.md`

## Admin y seguridad

- El admin ya no tiene modo de revision local.
- Solo entra con Supabase Auth.
- Ademas valida allowlist por `public.is_app_admin()` y `app_admins`.
- Si no hay sesion o no esta autorizado, redirige a `/admin/login`.
- El correo real usado en login (`ADMIN_LOGIN_EMAIL`) debe existir en Supabase Auth.
- Ese mismo correo debe estar permitido en `app_admins` (y con `active = true` si tu tabla incluye esa columna).

## Correos con Resend

Endpoint:

- `POST /api/appointments/email`

Comportamiento:

- Si faltan `RESEND_API_KEY` o `ADMIN_EMAIL`, responde controlado (503).
- El formulario muestra mensaje discreto, sin romper reserva.
- Admin siempre se intenta notificar.
- Cliente recibe correo si registro email.

## Upload de fotos en adopciones

- Desde `/admin/adopciones`.
- Sube archivo a `adoption-pets`.
- Guarda URL publica en `pets_for_adoption.image_url`.
- Tipos: PNG/JPG/WebP.
- Limite recomendado: 5 MB.

## Preparacion para deploy en Vercel

1. Sube repo a Git provider.
2. Crea proyecto en Vercel.
3. Configura todas las variables de entorno.
4. Ejecuta SQL de `docs/supabase-policies.md` en Supabase.
5. Crea bucket `adoption-pets` y valida policies de Storage.
6. Verifica build en Vercel.

## WhatsApp automatico (pendiente)

El proyecto hoy usa `wa.me` y acciones manuales para WhatsApp.

Para automatizar notificaciones reales se requiere integrar:

- WhatsApp Business API (Meta Cloud API) o Twilio.

No hay envio automatico real mientras esa integracion no exista.
