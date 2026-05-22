# Supabase schema y RLS

Estas notas son para ejecutar manualmente en Supabase SQL Editor. No ejecutes
service role ni secret keys desde el frontend.

El frontend usa solo:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`, opcional

Importante: el formulario publico de citas hace un `insert` simple en
`appointments`. No usa `.select()`, `.single()` ni intenta leer la fila creada.

## Admin allowlist

La recomendacion actual es usar una allowlist por correo en `app_admins`.

```sql
create table if not exists public.app_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

insert into public.app_admins (email)
values ('tu-admin@email.com')
on conflict (email) do nothing;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
```

## Schema sugerido

### appointments

```sql
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  phone text not null,
  email text,
  pet_name text not null,
  pet_type text not null,
  service text not null,
  preferred_date date not null,
  preferred_time text not null,
  message text,
  contact_channel text not null default 'whatsapp',
  status text not null default 'nueva',
  created_at timestamptz not null default now(),
  constraint appointments_contact_channel_check
    check (contact_channel in ('whatsapp', 'telefono', 'email')),
  constraint appointments_status_check
    check (status in ('nueva', 'confirmada', 'cancelada', 'atendida'))
);
```

### pets_for_adoption

```sql
create table if not exists public.pets_for_adoption (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  species text not null,
  breed text,
  age text,
  sex text,
  short_description text,
  description text,
  requirements text,
  image_url text,
  status text not null default 'disponible',
  created_at timestamptz not null default now(),
  constraint pets_for_adoption_status_check
    check (status in ('disponible', 'en_proceso', 'adoptado', 'oculto'))
);
```

### services

El codigo actual usa `active boolean`, no `status`.

```sql
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_from numeric,
  duration_minutes integer,
  active boolean not null default true,
  icon text,
  sort_order integer,
  created_at timestamptz not null default now()
);
```

### contact_messages, opcional

```sql
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  message text not null,
  status text not null default 'nuevo',
  created_at timestamptz not null default now(),
  constraint contact_messages_status_check
    check (status in ('nuevo', 'leido', 'respondido', 'archivado'))
);
```

## Servicios iniciales sugeridos

```sql
insert into public.services (name, description, duration_minutes, active, icon, sort_order)
values
  ('Consulta medica', 'Valoracion clinica para perros y gatos con trato sereno.', 45, true, 'stethoscope', 10),
  ('Baño', 'Baño y cuidado de piel y pelaje con mucha delicadeza.', 60, true, 'bath', 20),
  ('Corte de pelo', 'Corte estetico canino con trato tranquilo y profesional.', 75, true, 'scissors', 30),
  ('Baño + corte', 'Servicio completo de baño, corte y cuidado.', 90, true, 'sparkles', 40),
  ('Vacunacion', 'Aplicacion y seguimiento de esquemas preventivos.', 30, true, 'syringe', 50),
  ('Desparasitacion', 'Cuidado preventivo para bienestar y tranquilidad en casa.', 25, true, 'heart-pulse', 60),
  ('Seguimiento medico', 'Revision y acompañamiento posterior a consulta.', 40, true, 'heart-pulse', 70),
  ('Proceso de adopcion', 'Proceso responsable, humano y guiado de principio a fin.', 60, true, 'paw', 80);
```

## RLS recomendado

```sql
alter table public.appointments enable row level security;
alter table public.pets_for_adoption enable row level security;
alter table public.services enable row level security;

-- Si usas contact_messages:
alter table public.contact_messages enable row level security;
```

### appointments

Anon y usuarios autenticados pueden crear citas. Nadie publico puede leer citas.
El panel admin requiere Supabase Auth y `public.is_app_admin()`.

```sql
drop policy if exists "Public can create appointments" on public.appointments;
create policy "Public can create appointments"
on public.appointments
for insert
to anon, authenticated
with check (
  status = 'nueva'
  and contact_channel in ('whatsapp', 'telefono', 'email')
);

drop policy if exists "Admins can create appointments" on public.appointments;
create policy "Admins can create appointments"
on public.appointments
for insert
to authenticated
with check (
  public.is_app_admin()
  and status in ('nueva', 'confirmada', 'cancelada', 'atendida')
  and contact_channel in ('whatsapp', 'telefono', 'email')
);

drop policy if exists "Admins can read appointments" on public.appointments;
create policy "Admins can read appointments"
on public.appointments
for select
to authenticated
using (public.is_app_admin());

drop policy if exists "Admins can update appointments" on public.appointments;
create policy "Admins can update appointments"
on public.appointments
for update
to authenticated
using (public.is_app_admin())
with check (
  public.is_app_admin()
  and status in ('nueva', 'confirmada', 'cancelada', 'atendida')
);

drop policy if exists "Admins can delete appointments" on public.appointments;
create policy "Admins can delete appointments"
on public.appointments
for delete
to authenticated
using (public.is_app_admin());
```

### pets_for_adoption

```sql
drop policy if exists "Public can read available pets" on public.pets_for_adoption;
create policy "Public can read available pets"
on public.pets_for_adoption
for select
to anon, authenticated
using (status = 'disponible');

drop policy if exists "Admins can manage pets" on public.pets_for_adoption;
create policy "Admins can manage pets"
on public.pets_for_adoption
for all
to authenticated
using (public.is_app_admin())
with check (
  public.is_app_admin()
  and status in ('disponible', 'en_proceso', 'adoptado', 'oculto')
);
```

### services

```sql
drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services"
on public.services
for select
to anon, authenticated
using (active = true);

drop policy if exists "Admins can manage services" on public.services;
create policy "Admins can manage services"
on public.services
for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());
```

### contact_messages, opcional

```sql
drop policy if exists "Public can create contact messages" on public.contact_messages;
create policy "Public can create contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (status = 'nuevo');

drop policy if exists "Admins can manage contact messages" on public.contact_messages;
create policy "Admins can manage contact messages"
on public.contact_messages
for all
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());
```

## Notas de verificacion

- `appointments`: el cliente anon solo debe insertar. No agregues policy publica
  de `select`.
- `/admin/citas`: si RLS bloquea, revisa que el usuario este autenticado y que
  su correo exista en `public.app_admins`.
- `services`: la landing consulta servicios con `active = true`.
- `services`: el admin usa `price_from`, `active` y `sort_order`; no usa `status`.
- `pets_for_adoption`: la landing solo debe leer mascotas `disponible`; el admin
  puede cambiar mascotas a `oculto` para archivarlas sin borrarlas.
