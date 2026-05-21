# Supabase schema y policies sugeridas

Estas notas asumen que el frontend usa solo `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. No uses service role keys en el navegador.

## Variables

En `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_WHATSAPP_NUMBER=525500000000 # opcional, sin signos ni espacios
```

## Columnas esperadas

### appointments

```sql
create table if not exists appointments (
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
  created_at timestamptz not null default now()
);
```

### pets_for_adoption

```sql
create table if not exists pets_for_adoption (
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
  created_at timestamptz not null default now()
);
```

### services

```sql
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric,
  duration_minutes integer,
  status text not null default 'activo',
  icon text,
  created_at timestamptz not null default now()
);
```

## RLS recomendado

El panel admin usa Supabase Auth. La opcion "Revision local" solo desbloquea la
interfaz para revisar UI; las escrituras seguras requieren policies para usuarios
autenticados.

```sql
alter table appointments enable row level security;
alter table pets_for_adoption enable row level security;
alter table services enable row level security;

create policy "Public can create appointments"
on appointments for insert
to anon, authenticated
with check (
  status = 'nueva'
  and contact_channel in ('whatsapp', 'telefono', 'email')
);

create policy "Authenticated can read appointments"
on appointments for select
to authenticated
using (true);

create policy "Authenticated can update appointments"
on appointments for update
to authenticated
using (true)
with check (status in ('nueva', 'confirmada', 'cancelada', 'atendida'));

create policy "Public can read available pets"
on pets_for_adoption for select
to anon, authenticated
using (status = 'disponible');

create policy "Authenticated can read all pets"
on pets_for_adoption for select
to authenticated
using (true);

create policy "Authenticated can manage pets"
on pets_for_adoption for all
to authenticated
using (true)
with check (status in ('disponible', 'en_proceso', 'adoptado'));

create policy "Public can read active services"
on services for select
to anon, authenticated
using (status = 'activo');

create policy "Authenticated can read all services"
on services for select
to authenticated
using (true);
```

Si prefieres que el admin use roles mas estrictos, crea una tabla de perfiles y
agrega checks por `auth.uid()` antes de usar el panel en produccion.
