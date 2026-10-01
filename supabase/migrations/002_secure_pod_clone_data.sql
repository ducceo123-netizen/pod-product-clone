alter table pod_clone_cases enable row level security;
alter table pod_clone_sources enable row level security;
alter table pod_clone_knowledge_nodes enable row level security;
alter table pod_clone_proposals enable row level security;
alter table pod_clone_case_versions enable row level security;

insert into storage.buckets (id, name, public, file_size_limit)
values ('pod-clone-assets','pod-clone-assets',false,20971520)
on conflict (id) do update set public=false, file_size_limit=20971520;

create or replace function pod_clone_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pod_clone_cases_updated_at on pod_clone_cases;
create trigger trg_pod_clone_cases_updated_at
before update on pod_clone_cases
for each row execute function pod_clone_touch_updated_at();

drop trigger if exists trg_pod_clone_knowledge_updated_at on pod_clone_knowledge_nodes;
create trigger trg_pod_clone_knowledge_updated_at
before update on pod_clone_knowledge_nodes
for each row execute function pod_clone_touch_updated_at();
