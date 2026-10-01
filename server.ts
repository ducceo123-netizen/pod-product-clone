import express from "express";
import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { z } from "zod";
import { compilePodCloneJob } from "./src/compiler.js";
import { POD_CLONE_SYSTEM } from "./src/system.js";

export const app = express();
app.use(express.json({ limit: "20mb" }));

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, openWorldHint: false } as const;
const PENDING_WRITE = { readOnlyHint: false, destructiveHint: false, openWorldHint: false } as const;

function createServer() {
  const server = new McpServer(
    { name: "POD Product Clone", version: POD_CLONE_SYSTEM.version },
    {
      capabilities: { tools: { listChanged: false } },
      instructions:
        "POD Product Clone converts proven competitor POD demand into commercially distinct Give Mories product variants. It is completely isolated from Creative DNA. Never use Creative DNA as a hidden fallback. Analyze source truth first; produce 3 differentiated directions; build production asset layers, variants, thumbnail plan, and ad-angle bridge; package reusable memory only after explicit user approval."
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
    async () => ({
      content: [{ type: "text" as const, text: JSON.stringify(POD_CLONE_SYSTEM, null, 2) }]
    })
  );

  server.registerTool(
    "compile_pod_clone_job",
    {
      title: "Compile POD Clone Job",
      description: "Compile competitor/product inputs into a compact POD Clone execution contract before research or generation.",
      inputSchema: {
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
      annotations: READ_ONLY
    },
    async (input) => ({
      content: [{ type: "text" as const, text: JSON.stringify(compilePodCloneJob(input), null, 2) }]
    })
  );

  server.registerTool(
    "list_pod_clone_routes",
    {
      title: "List POD Clone Routes",
      description: "List isolated POD Clone memory branches.",
      inputSchema: {},
      annotations: READ_ONLY
    },
    async () => ({
      content: [{
        type: "text" as const,
        text: JSON.stringify({ system: POD_CLONE_SYSTEM.id, routes: POD_CLONE_SYSTEM.branches }, null, 2)
      }]
    })
  );

  server.registerTool(
    "submit_pod_clone_feedback",
    {
      title: "Submit POD Clone Feedback",
      description: "Create a Pending POD Clone learning proposal only after the user explicitly asks to save/train/package a reviewed case. Never changes canonical memory directly.",
      inputSchema: {
        case_id: z.string().min(1).max(200),
        feedback: z.string().min(3).max(10000),
        proposed_scope: z.string().max(200).optional(),
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
      annotations: PENDING_WRITE
    },
    async (payload) => {
      const url = process.env.POD_CLONE_FEEDBACK_UPSTREAM_URL;
      if (!url) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              status: "not_configured",
              message: "POD_CLONE_FEEDBACK_UPSTREAM_URL is not configured yet.",
              payload
            }, null, 2)
          }],
          isError: true
        };
      }

      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await r.json();

      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
        isError: !r.ok
      };
    }
  );

  return server;
}

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>POD Product Clone</title>
  <style>
    body{margin:0;background:#0b0b0c;color:#f5f5f5;font:16px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{max-width:860px;margin:0 auto;padding:72px 28px}
    .badge{display:inline-block;padding:6px 10px;border:1px solid #2d2d30;border-radius:999px;color:#b9f6ca;background:#111214}
    h1{font-size:44px;line-height:1.05;margin:22px 0 14px}
    p{color:#b8b8bd;max-width:700px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:34px}
    a{display:block;padding:18px;border:1px solid #2d2d30;border-radius:14px;color:#fff;text-decoration:none;background:#121214}
    a:hover{border-color:#555}
    code{color:#d7ffd9}
  </style>
</head>
<body>
  <main>
    <span class="badge">● Live</span>
    <h1>POD Product Clone</h1>
    <p>Standalone POD opportunity system for competitor analysis, differentiated product directions, production asset decomposition, Give Mories PDP thumbnails, and ad-angle development.</p>
    <div class="grid">
      <a href="/api/health"><strong>Health</strong><br><code>/api/health</code></a>
      <a href="/api/system"><strong>System Spec</strong><br><code>/api/system</code></a>
      <a href="/api/mcp"><strong>MCP Endpoint</strong><br><code>/api/mcp</code></a>
    </div>
  </main>
</body>
</html>`);
});

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "pod-product-clone", version: POD_CLONE_SYSTEM.version })
);
app.get("/api/system", (_req, res) => res.json(POD_CLONE_SYSTEM));

const mcp = createMcpHandler(() => createServer());
app.all("/api/mcp", toNodeHandler(mcp));

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`POD Product Clone listening on :${port}`));
}

export default app;
