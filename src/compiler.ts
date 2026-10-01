import { POD_CLONE_SYSTEM, HARD_GATES } from "./system.js";
import type { CompileJobInput } from "./types.js";

export function compilePodCloneJob(input: CompileJobInput) {
  return {
    system: POD_CLONE_SYSTEM,
    hard_gates: HARD_GATES,
    execution_stages: [
      "SOURCE_TRUTH",
      "OPPORTUNITY_MAP",
      "THREE_VARIANT_DIRECTIONS",
      "ASSET_LAYER_BLUEPRINT",
      "VARIANT_MATRIX",
      "THUMBNAIL_PDP_PLAN",
      "AD_ANGLE_BRIDGE",
      "USER_REVIEW",
      "OPTIONAL_MEMORY_PACKAGE"
    ],
    job: {
      competitor_url: input.competitor_url ?? null,
      store_url: input.store_url ?? POD_CLONE_SYSTEM.defaultStoreUrl,
      product_type: input.product_type ?? null,
      niche: input.niche ?? null,
      supplied_assets: input.supplied_assets ?? [],
      ad_angles: input.ad_angles ?? [],
      user_goal:
        input.user_goal ??
        "Create a commercially distinct POD variant for Give Mories while preserving proven demand mechanisms.",
      output_scope:
        input.output_scope ?? [
          "source_truth",
          "opportunity_map",
          "three_variant_directions",
          "asset_layer_blueprint",
          "variant_matrix",
          "thumbnail_pdp_plan",
          "ad_angle_bridge"
        ]
    }
  };
}
