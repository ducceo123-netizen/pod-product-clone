import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

const SYSTEM = {
  id: "pod_clone",
  version: "0.1.0",
  title: "POD Product Clone",
  default_store_url: "https://af1xsf-ny.myshopify.com/",
  creative_dna_fallback: false,
  packaging_requires_explicit_user_approval: true,
  default_variant_count: 3,
  branches: [
    "product_opportunities","competitor_cases","demand_mechanisms",
    "design_layer_patterns","personalization_patterns","thumbnail_patterns",
    "ad_angle_patterns","production_constraints","approved_variants",
    "rejected_variants","learnings"
  ]
};

const HARD_GATES = [
  "Extract source truth before ideation.",
  "Separate observed facts from inference.",
  "Clone demand mechanism, not competitor artwork/copy.",
  "Generate materially differentiated product directions.",
  "Produce a production-ready asset layer blueprint.",
  "Verify product/personalization fidelity before PDP imagery.",
  "Reapply thumbnails into Give Mories storefront language.",
  "Wait for explicit user approval before memory packaging.",
  "Never silently resolve Creative DNA as fallback.",
  "Every reusable learning must retain source-case evidence."
];

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  try {
    const body = await req.json();
    const action = String(body?.action || "");

    if (action === "resolve") return json({ system: SYSTEM, hard_gates: HARD_GATES });
    if (action === "routes") return json({ system: SYSTEM.id, routes: SYSTEM.branches });

    if (action === "compile") {
      const job = {
        competitor_url: body?.competitor_url ?? null,
        store_url: body?.store_url ?? SYSTEM.default_store_url,
        product_type: body?.product_type ?? null,
        niche: body?.niche ?? null,
        supplied_assets: Array.isArray(body?.supplied_assets) ? body.supplied_assets : [],
        ad_angles: Array.isArray(body?.ad_angles) ? body.ad_angles : [],
        user_goal: body?.user_goal ?? "Create a commercially distinct POD variant for Give Mories while preserving proven demand mechanisms.",
        output_scope: body?.output_scope ?? [
          "source_truth","opportunity_map","three_variant_directions",
          "asset_layer_blueprint","variant_matrix","thumbnail_pdp_plan","ad_angle_bridge"
        ]
      };

      const { data, error } = await db.from("pod_clone_cases").insert({
        title: body?.title ?? null,
        status: "draft",
        competitor_url: job.competitor_url,
        store_url: job.store_url,
        product_type: job.product_type,
        niche: job.niche
      }).select("id,created_at").single();

      if (error) throw error;
      return json({
        system: SYSTEM,
        hard_gates: HARD_GATES,
        execution_stages: [
          "SOURCE_TRUTH","OPPORTUNITY_MAP","THREE_VARIANT_DIRECTIONS",
          "ASSET_LAYER_BLUEPRINT","VARIANT_MATRIX","THUMBNAIL_PDP_PLAN",
          "AD_ANGLE_BRIDGE","USER_REVIEW","OPTIONAL_MEMORY_PACKAGE"
        ],
        case_id: data.id,
        created_at: data.created_at,
        job
      });
    }

    if (action === "get_case") {
      const caseId = String(body?.case_id || "");
      if (!caseId) return json({ error: "case_id is required" }, 400);
      const { data, error } = await db.from("pod_clone_cases").select("*").eq("id", caseId).single();
      if (error) return json({ error: error.message }, 404);
      return json({ case: data });
    }

    if (action === "save_analysis") {
      const caseId = String(body?.case_id || "");
      if (!caseId) return json({ error: "case_id is required" }, 400);
      const patch: Record<string, unknown> = { status: "analyzed" };
      for (const k of ["source_truth","opportunity_map","variant_directions","asset_blueprint","variant_matrix","thumbnail_plan","ad_angle_bridge"]) {
        if (body?.[k] !== undefined) patch[k] = body[k];
      }
      const { data, error } = await db.from("pod_clone_cases").update(patch).eq("id", caseId).select("*").single();
      if (error) throw error;
      const version = Number(body?.version || 1);
      await db.from("pod_clone_case_versions").upsert({
        case_id: caseId,
        version,
        snapshot: data
      }, { onConflict: "case_id,version" });
      return json({ ok: true, case: data });
    }

    if (action === "search_memory") {
      const branch = body?.branch ? String(body.branch) : null;
      let q = db.from("pod_clone_knowledge_nodes").select("*").eq("is_active", true).order("updated_at", { ascending: false }).limit(50);
      if (branch) q = q.eq("branch", branch);
      const { data, error } = await q;
      if (error) throw error;
      return json({ nodes: data ?? [] });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "unknown error" }, 500);
  }
});
