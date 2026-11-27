-- À coller dans Supabase : menu « SQL Editor » > New query > Run

create table public.scans (
  id      uuid primary key default gen_random_uuid(),
  contenu text not null,
  poste   text,
  lu_le   timestamptz not null default now()
);

alter table public.scans enable row level security;

-- Le lecteur de l'entrée (sans connexion) peut seulement AJOUTER des lectures
create policy "ajout par le lecteur" on public.scans
  for insert to anon with check (true);

-- Seules les personnes connectées (compte créé par vous) peuvent LIRE et SUPPRIMER
create policy "lecture par la direction" on public.scans
  for select to authenticated using (true);

create policy "suppression par la direction" on public.scans
  for delete to authenticated using (true);
