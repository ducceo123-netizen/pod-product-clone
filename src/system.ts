export const POD_CLONE_SYSTEM = {
  id: "pod_clone",
  version: "0.1.0",
  title: "POD Product Clone",
  defaultStoreUrl: "https://af1xsf-ny.myshopify.com/",
  packagingRequiresExplicitUserApproval: true,
  creativeDnaFallback: false,
  defaultVariantCount: 3,
  branches: [
    "product_opportunities",
    "competitor_cases",
    "demand_mechanisms",
    "design_layer_patterns",
    "personalization_patterns",
    "thumbnail_patterns",
    "ad_angle_patterns",
    "production_constraints",
    "approved_variants",
    "rejected_variants",
    "learnings"
  ]
} as const;

export const HARD_GATES = [
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
] as const;
