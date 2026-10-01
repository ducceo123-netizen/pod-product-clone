create table if not exists pod_clone_admin_actions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references pod_clone_proposals(id) on delete set null,
  action text not null check (action in ('accept','reject','merge')),
  actor text,
  note text,
  created_at timestamptz not null default now()
);

alter table pod_clone_admin_actions enable row level security;

create or replace function public.pod_clone_review_proposal(
  p_proposal_id uuid,
  p_decision text,
  p_actor text default null,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
begin
  if p_decision not in ('accept','reject') then
    raise exception 'decision must be accept or reject';
  end if;

  select status into v_status
  from pod_clone_proposals
  where id = p_proposal_id
  for update;

  if v_status is null then raise exception 'proposal not found'; end if;
  if v_status <> 'pending' then raise exception 'proposal must be pending'; end if;

  update pod_clone_proposals
  set status = case when p_decision='accept' then 'accepted' else 'rejected' end,
      reviewed_by = p_actor,
      review_note = p_note,
      reviewed_at = now()
  where id = p_proposal_id;

  insert into pod_clone_admin_actions(proposal_id, action, actor, note)
  values (p_proposal_id, p_decision, p_actor, p_note);

  return jsonb_build_object(
    'ok', true,
    'proposal_id', p_proposal_id,
    'status', case when p_decision='accept' then 'accepted' else 'rejected' end
  );
end;
$$;

create or replace function public.pod_clone_merge_proposal(
  p_proposal_id uuid,
  p_actor text default null,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_prop pod_clone_proposals%rowtype;
  v_title text;
  v_node_id uuid;
begin
  select * into v_prop
  from pod_clone_proposals
  where id = p_proposal_id
  for update;

  if v_prop.id is null then raise exception 'proposal not found'; end if;
  if v_prop.status <> 'accepted' then raise exception 'proposal must be accepted before merge'; end if;

  v_title := coalesce(nullif(v_prop.training_spec->>'generalized_rule',''), 'POD Clone learning');

  insert into pod_clone_knowledge_nodes(
    branch, title, content, source_case_id, evidence, version, is_active
  )
  values(
    v_prop.branch,
    left(v_title, 300),
    v_prop.training_spec,
    v_prop.case_id,
    jsonb_build_array(
      jsonb_build_object(
        'proposal_id', v_prop.id,
        'raw_feedback', v_prop.raw_feedback
      )
    ),
    1,
    true
  )
  returning id into v_node_id;

  update pod_clone_proposals
  set status='merged', merged_at=now()
  where id=p_proposal_id;

  insert into pod_clone_admin_actions(proposal_id, action, actor, note)
  values (p_proposal_id, 'merge', p_actor, p_note);

  return jsonb_build_object(
    'ok', true,
    'proposal_id', p_proposal_id,
    'knowledge_node_id', v_node_id,
    'status', 'merged'
  );
end;
$$;

revoke all on function public.pod_clone_review_proposal(uuid,text,text,text) from public, anon, authenticated;
revoke all on function public.pod_clone_merge_proposal(uuid,text,text) from public, anon, authenticated;
grant execute on function public.pod_clone_review_proposal(uuid,text,text,text) to service_role;
grant execute on function public.pod_clone_merge_proposal(uuid,text,text) to service_role;
