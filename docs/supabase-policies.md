# Supabase schema y RLS

Estas notas son para ejecutar manualmente en Supabase SQL Editor.

El frontend usa solo:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

No uses `service_role` ni secret keys en el navegador.

## Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
NEXT_PUBLIC_WHATSAPP_NUMBER=525500000000 # opcional
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
  image_url text,
  status text not null default 'disponible',
  created_at timestamptz not null default now(),
  constraint pets_for_adoption_status_check
    check (status in ('disponible', 'en_proceso', 'adoptado'))
);
```

### services

```sql
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric,
  duration_minutes integer,
  status text not null default 'activo',
  icon text,
  created_at timestamptz not null default now(),
  constraint services_status_check
    check (status in ('activo', 'inactivo'))
);
```

### Servicios iniciales sugeridos

```sql
insert into public.services (name, description, duration_minutes, status, icon)
values
  ('Consulta médica veterinaria', 'Valoración clínica para perros y gatos con trato sereno.', 45, 'activo', 'stethoscope'),
  ('Estética canina, baño y cuidado', 'Baño, corte y cuidado de piel y pelaje con mucha delicadeza.', 90, 'activo', 'bath'),
  ('Vacunación', 'Aplicación y seguimiento de esquemas preventivos.', 30, 'activo', 'syringe'),
  ('Desparasitación', 'Cuidado preventivo para bienestar y tranquilidad en casa.', 25, 'activo', 'heart-pulse'),
  ('Acompañamiento en adopciones', 'Proceso responsable, humano y guiado de principio a fin.', 60, 'activo', 'paw');
```

## RLS básico

Este bloque permite:

1. insertar citas desde anon
2. leer adopciones disponibles desde anon
3. leer servicios activos desde anon
4. leer/editar citas con usuario autenticado
5. crear/editar/eliminar adopciones con usuario autenticado

Importante: estas policies tratan a cualquier usuario autenticado como admin.
Para producción, agrega una tabla de perfiles/roles o allowlist.

```sql
alter table public.appointments enable row level security;
alter table public.pets_for_adoption enable row level security;
alter table public.services enable row level security;

drop policy if exists "Public can create appointments" on public.appointments;
create policy "Public can create appointments"
on public.appointments
for insert
to anon, authenticated
with check (
  status = 'nueva'
  and contact_channel in ('whatsapp', 'telefono', 'email')
);

drop policy if exists "Authenticated can read appointments" on public.appointments;
create policy "Authenticated can read appointments"
on public.appointments
for select
to authenticated
using (true);

drop policy if exists "Authenticated can update appointments" on public.appointments;
create policy "Authenticated can update appointments"
on public.appointments
for update
to authenticated
using (true)
with check (status in ('nueva', 'confirmada', 'cancelada', 'atendida'));

drop policy if exists "Public can read available pets" on public.pets_for_adoption;
create policy "Public can read available pets"
on public.pets_for_adoption
for select
to anon, authenticated
using (status = 'disponible');

drop policy if exists "Authenticated can read all pets" on public.pets_for_adoption;
create policy "Authenticated can read all pets"
on public.pets_for_adoption
for select
to authenticated
using (true);

drop policy if exists "Authenticated can insert pets" on public.pets_for_adoption;
create policy "Authenticated can insert pets"
on public.pets_for_adoption
for insert
to authenticated
with check (status in ('disponible', 'en_proceso', 'adoptado'));

drop policy if exists "Authenticated can update pets" on public.pets_for_adoption;
create policy "Authenticated can update pets"
on public.pets_for_adoption
for update
to authenticated
using (true)
with check (status in ('disponible', 'en_proceso', 'adoptado'));

drop policy if exists "Authenticated can delete pets" on public.pets_for_adoption;
create policy "Authenticated can delete pets"
on public.pets_for_adoption
for delete
to authenticated
using (true);

drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services"
on public.services
for select
to anon, authenticated
using (status = 'activo');

drop policy if exists "Authenticated can read all services" on public.services;
create policy "Authenticated can read all services"
on public.services
for select
to authenticated
using (true);
```

## Opcion mas segura para admin

Antes de producción, puedes crear una tabla `admin_users` y reemplazar las
policies autenticadas por checks de admin:

```sql
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;
```

Luego cambia `using (true)` por `using (public.is_admin())` y los `with check`
por `with check (public.is_admin() and ...)` donde aplique.
