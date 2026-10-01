import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, x-client-info, apikey, content-type"
    }
  });
}

const allowedClasses = new Set([
  "DEMAND_MECHANISM","DESIGN_LAYER","PERSONALIZATION","THUMBNAIL",
  "AD_ANGLE","PRODUCTION","WORKFLOW","OTHER"
]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  try {
    const body = await req.json();
    const caseId = String(body?.case_id || "").trim();
    const feedback = String(body?.feedback || "").trim();
    const spec = body?.training_spec;

    if (!caseId) return json({ error: "case_id is required" }, 400);
    if (feedback.length < 3 || feedback.length > 10000) return json({ error: "invalid feedback" }, 400);
    if (!spec || typeof spec !== "object") return json({ error: "training_spec is required" }, 400);

    const required = [
      "observed_issue","generalized_rule","expected_behavior","scope",
      "evidence_summary","confidence","admin_summary_vi","admin_reason_vi","admin_change_vi"
    ];
    for (const k of required) {
      if (!String(spec?.[k] || "").trim()) return json({ error: `training_spec.${k} is required` }, 400);
    }
    if (!Array.isArray(spec.reject_conditions)) return json({ error: "training_spec.reject_conditions must be an array" }, 400);
    if (!allowedClasses.has(String(spec.rule_class))) return json({ error: "invalid training_spec.rule_class" }, 400);

    const { data: existing, error: caseError } = await db
      .from("pod_clone_cases").select("id,status").eq("id", caseId).single();

    if (caseError || !existing) return json({ error: "case not found" }, 404);

    const branch = String(body?.proposed_scope || spec.scope || "learnings").slice(0, 200);
    const { data, error } = await db
      .from("pod_clone_proposals")
      .insert({
        case_id: caseId,
        branch,
        raw_feedback: feedback,
        training_spec: spec,
        status: "pending",
        submitted_by: body?.submitted_by ? String(body.submitted_by).slice(0, 200) : null
      })
      .select("id,status,branch,created_at").single();

    if (error) throw error;
    await db.from("pod_clone_cases").update({ status: "packaged" }).eq("id", caseId);

    return json({
      ok: true,
      proposal: data,
      canonical_memory_changed: false,
      next_step: "admin_review"
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "unknown error" }, 500);
  }
});
