import express from "express";
import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { z } from "zod";
import { POD_CLONE_SYSTEM } from "./src/system.js";

export const app = express();
app.use(express.json({ limit: "20mb" }));

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, openWorldHint: false } as const;
const WRITE = { readOnlyHint: false, destructiveHint: false, openWorldHint: false } as const;

const PROJECT_REF = "oujvyectdpswyfvnsdph";
const PUBLIC_UPSTREAM =
  process.env.POD_CLONE_PUBLIC_UPSTREAM_URL ||
  `https://${PROJECT_REF}.supabase.co/functions/v1/pod-clone-public`;
const FEEDBACK_UPSTREAM =
  process.env.POD_CLONE_FEEDBACK_UPSTREAM_URL ||
  `https://${PROJECT_REF}.supabase.co/functions/v1/pod-clone-feedback-submit`;

async function postJson(url: string, payload: unknown) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "POD-Clone-Gateway/1.0" },
    body: JSON.stringify(payload)
  });
  const data = await r.json();
  return { ok: r.ok, status: r.status, data };
}

function result(data: unknown, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    isError
  };
}

function createServer() {
  const server = new McpServer(
    { name: "POD Product Clone", version: POD_CLONE_SYSTEM.version },
    {
      capabilities: { tools: { listChanged: false } },
      instructions:
        "POD Product Clone is a standalone POD product opportunity and production system for Give Mories. ALWAYS compile a new case before deep analysis when the user supplies a competitor product or asks to create a differentiated clone. Source truth comes before ideation. Preserve demand mechanisms, not competitor artwork/copy. Generate 3 materially differentiated directions by default. Build a production asset layer blueprint, scalable variants, Give Mories PDP thumbnail plan, and ad-angle bridge. Save the completed analysis back to its case. Do not package reusable memory until the user explicitly approves and asks to Package/Train/Save the case. POD Clone is completely isolated from Creative DNA and must never use Creative DNA as a hidden fallback."
    }
  );

  server.registerTool(
    "resolve_pod_clone_system",
    {
      title: "Resolve POD Clone System",
      description: "Return the canonical POD Product Clone execution contract and isolated memory branches.",
      inputSchema: {},
      annotations: READ_ONLY
    },
    async () => {
      const u = await postJson(PUBLIC_UPSTREAM, { action: "resolve" });
      return result(u.data, !u.ok);
    }
  );

  server.registerTool(
    "compile_pod_clone_job",
    {
      title: "Compile POD Clone Job",
      description:
        "MANDATORY first step for a new competitor-based POD Clone case. Creates a real case in the isolated POD Clone database and returns case_id plus the execution contract.",
      inputSchema: {
        title: z.string().max(300).optional(),
        competitor_url: z.string().url().max(3000).optional(),
        store_url: z.string().url().max(3000).optional(),
        product_type: z.string().max(160).optional(),
        niche: z.string().max(160).optional(),
        ad_angles: z.array(z.string().max(1000)).max(20).optional(),
        user_goal: z.string().max(3000).optional(),
        output_scope: z.array(z.string().max(120)).max(20).optional(),
        supplied_assets: z.array(z.object({
          kind: z.enum(["COMPETITOR_PDP","PRINT_FILE","AD_VIDEO","AD_IMAGE","AD_COPY","USER_NOTE","STORE_REFERENCE"]),
          reference: z.string().max(4000),
          caption: z.string().max(1000).optional()
        })).max(30).optional()
      },
      annotations: WRITE
    },
    async (input) => {
      const u = await postJson(PUBLIC_UPSTREAM, { action: "compile", ...input });
      return result(u.data, !u.ok);
    }
  );

  server.registerTool(
    "get_pod_clone_case",
    {
      title: "Get POD Clone Case",
      description: "Read a saved POD Clone case by case_id.",
      inputSchema: { case_id: z.string().uuid() },
      annotations: READ_ONLY
    },
    async ({ case_id }) => {
      const u = await postJson(PUBLIC_UPSTREAM, { action: "get_case", case_id });
      return result(u.data, !u.ok);
    }
  );

  server.registerTool(
    "save_pod_clone_analysis",
    {
      title: "Save POD Clone Analysis",
      description:
        "Save the completed/revised analysis for a case. Use after generating Source Truth, Opportunity Map, variant directions, asset blueprint, variant matrix, thumbnail plan, and ad-angle bridge.",
      inputSchema: {
        case_id: z.string().uuid(),
        version: z.number().int().min(1).optional(),
        source_truth: z.unknown().optional(),
        opportunity_map: z.unknown().optional(),
        variant_directions: z.unknown().optional(),
        asset_blueprint: z.unknown().optional(),
        variant_matrix: z.unknown().optional(),
        thumbnail_plan: z.unknown().optional(),
        ad_angle_bridge: z.unknown().optional()
      },
      annotations: WRITE
    },
    async (payload) => {
      const u = await postJson(PUBLIC_UPSTREAM, { action: "save_analysis", ...payload });
      return result(u.data, !u.ok);
    }
  );

  server.registerTool(
    "search_pod_clone_memory",
    {
      title: "Search POD Clone Memory",
      description:
        "Read approved canonical POD Clone learnings. Optionally filter by a memory branch. Never reads Creative DNA.",
      inputSchema: {
        branch: z.enum([
          "product_opportunities","competitor_cases","demand_mechanisms",
          "design_layer_patterns","personalization_patterns","thumbnail_patterns",
          "ad_angle_patterns","production_constraints","approved_variants",
          "rejected_variants","learnings"
        ]).optional()
      },
      annotations: READ_ONLY
    },
    async ({ branch }) => {
      const u = await postJson(PUBLIC_UPSTREAM, { action: "search_memory", branch });
      return result(u.data, !u.ok);
    }
  );

  server.registerTool(
    "list_pod_clone_routes",
    {
      title: "List POD Clone Routes",
      description: "List isolated POD Clone memory branches.",
      inputSchema: {},
      annotations: READ_ONLY
    },
    async () => {
      const u = await postJson(PUBLIC_UPSTREAM, { action: "routes" });
      return result(u.data, !u.ok);
    }
  );

  server.registerTool(
    "submit_pod_clone_feedback",
    {
      title: "Package POD Clone Case",
      description:
        "Use ONLY after explicit user approval/request to Package, Train, Save, or Learn a reviewed case. Creates a Pending proposal for admin review and never mutates canonical memory directly.",
      inputSchema: {
        case_id: z.string().uuid(),
        feedback: z.string().min(3).max(10000),
        proposed_scope: z.string().max(200).optional(),
        submitted_by: z.string().max(200).optional(),
        training_spec: z.object({
          observed_issue: z.string().min(1).max(4000),
          generalized_rule: z.string().min(1).max(4000),
          expected_behavior: z.string().min(1).max(4000),
          reject_conditions: z.array(z.string().max(800)).max(12),
          scope: z.string().min(1).max(500),
          rule_class: z.enum(["DEMAND_MECHANISM","DESIGN_LAYER","PERSONALIZATION","THUMBNAIL","AD_ANGLE","PRODUCTION","WORKFLOW","OTHER"]),
          evidence_summary: z.string().min(1).max(4000),
          confidence: z.enum(["HIGH","MEDIUM","LOW"]),
          admin_summary_vi: z.string().min(1).max(700),
          admin_reason_vi: z.string().min(1).max(900),
          admin_change_vi: z.string().min(1).max(900)
        })
      },
      annotations: WRITE
    },
    async (payload) => {
      const u = await postJson(FEEDBACK_UPSTREAM, payload);
      return result(u.data, !u.ok);
    }
  );

  return server;
}

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>POD Product Clone</title><style>
body{margin:0;background:#0b0b0c;color:#f5f5f5;font:16px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
main{max-width:900px;margin:0 auto;padding:72px 28px}.badge{display:inline-block;padding:6px 10px;border:1px solid #2d2d30;border-radius:999px;color:#b9f6ca;background:#111214}
h1{font-size:44px;line-height:1.05;margin:22px 0 14px}p{color:#b8b8bd;max-width:740px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:34px}
a{display:block;padding:18px;border:1px solid #2d2d30;border-radius:14px;color:#fff;text-decoration:none;background:#121214}a:hover{border-color:#555}code{color:#d7ffd9}
</style></head><body><main><span class="badge">● Live · Supabase connected</span><h1>POD Product Clone</h1>
<p>Standalone system for competitor demand analysis, differentiated POD concepts, production layer decomposition, Give Mories PDP imagery, ad-angle development, and reviewed reusable memory.</p>
<div class="grid"><a href="/api/health"><strong>Health</strong><br><code>/api/health</code></a><a href="/api/system"><strong>System</strong><br><code>/api/system</code></a><a href="/api/mcp"><strong>MCP</strong><br><code>/api/mcp</code></a></div></main></body></html>`);
});

app.get("/api/health", async (_req, res) => {
  try {
    const u = await postJson(PUBLIC_UPSTREAM, { action: "resolve" });
    res.status(u.ok ? 200 : 503).json({
      ok: u.ok,
      service: "pod-product-clone",
      version: POD_CLONE_SYSTEM.version,
      database: u.ok ? "connected" : "unavailable",
      project_ref: PROJECT_REF
    });
  } catch {
    res.status(503).json({ ok: false, service: "pod-product-clone", database: "unavailable" });
  }
});
app.get("/api/system", (_req, res) => res.json(POD_CLONE_SYSTEM));

const mcp = createMcpHandler(() => createServer());
app.all("/api/mcp", toNodeHandler(mcp));

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`POD Product Clone listening on :${port}`));
}

export default app;
