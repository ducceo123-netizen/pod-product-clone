export type SourceKind =
  | "COMPETITOR_PDP"
  | "PRINT_FILE"
  | "AD_VIDEO"
  | "AD_IMAGE"
  | "AD_COPY"
  | "USER_NOTE"
  | "STORE_REFERENCE";

export type SourceInput = {
  kind: SourceKind;
  reference: string;
  caption?: string;
};

export type CompileJobInput = {
  competitor_url?: string;
  store_url?: string;
  product_type?: string;
  niche?: string;
  supplied_assets?: SourceInput[];
  ad_angles?: string[];
  user_goal?: string;
  output_scope?: string[];
};

export type TrainingSpec = {
  observed_issue: string;
  generalized_rule: string;
  expected_behavior: string;
  reject_conditions: string[];
  scope: string;
  rule_class:
    | "DEMAND_MECHANISM"
    | "DESIGN_LAYER"
    | "PERSONALIZATION"
    | "THUMBNAIL"
    | "AD_ANGLE"
    | "PRODUCTION"
    | "WORKFLOW"
    | "OTHER";
  evidence_summary: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  admin_summary_vi: string;
  admin_reason_vi: string;
  admin_change_vi: string;
};
