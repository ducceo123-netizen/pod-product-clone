create index if not exists idx_pod_clone_knowledge_source_case on pod_clone_knowledge_nodes(source_case_id);
create index if not exists idx_pod_clone_proposals_case on pod_clone_proposals(case_id);

create or replace function public.pod_clone_touch_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
