/** Akub satellite module identifiers (extensible). */
export type AkubModuleId = "inventory" | "table";

export const AKUB_MODULE_IDS = ["inventory", "table"] as const satisfies readonly AkubModuleId[];

export type ModuleEntitlementStatus =
  | "none"
  | "active"
  | "expired"
  | "suspended";

/**
 * Per-module commercial entitlement on `spaces/{id}.modules.<moduleId>`.
 * Module-specific plan strings and limits live here (not shared inventively across modules).
 */
/** Self-serve billing cadence stored on intents + module entitlements. */
export type BillingPeriod = "monthly" | "quarterly" | "yearly";

export const BILLING_PERIODS = [
  "monthly",
  "quarterly",
  "yearly",
] as const satisfies readonly BillingPeriod[];

export const BILLING_PERIOD_MONTHS: Record<BillingPeriod, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

export function isBillingPeriod(value: string): value is BillingPeriod {
  return value === "monthly" || value === "quarterly" || value === "yearly";
}

export type ModuleEntitlement = {
  status: ModuleEntitlementStatus;
  /** First successful activation (unix seconds). */
  activated_at?: number;
  /** Unix seconds; omit if lifetime / none. */
  license_expires_at?: number;
  /** Module-specific plan key (shared paid keys: solo|business; table also freemium|custom). */
  plan_type?: string;
  /** Cadence used for the latest paid activation / renew (table + future modules). */
  billing_period?: BillingPeriod;
  /** Module-specific caps (inventory: product_limit; table: venue_limit + table_limit). */
  limits?: Record<string, number>;
  payment_tx_ref?: string;
  flutterwave_transaction_id?: number;
  referred_by_affiliate_id?: string;
  affiliate_code?: string;
  /** Opaque promo snapshot — apps own the detailed shape. */
  promo_entitlement?: Record<string, unknown>;
  updated_at?: number;
};

/** Shared paid self-serve plan keys across Akub modules. */
export type PaidPlanType = "solo" | "business";

export type InventoryPlanType = PaidPlanType;

/**
 * Akub Table commercial plans.
 * Paid tiers reuse shared `solo` | `business` keys; freemium/custom are Table-only.
 */
export type TablePlanType = "freemium" | PaidPlanType | "custom";

export const TABLE_PLAN_TYPES = [
  "freemium",
  "solo",
  "business",
  "custom",
] as const satisfies readonly TablePlanType[];

export const PAID_PLAN_TYPES = ["solo", "business"] as const satisfies readonly PaidPlanType[];

export type TablePlanLimits = {
  venue_limit: number;
  table_limit: number;
};

/** Default caps when activating a known Table plan (custom is support-set). */
export const TABLE_PLAN_LIMITS: Record<TablePlanType, TablePlanLimits> = {
  freemium: { venue_limit: 1, table_limit: 2 },
  solo: { venue_limit: 1, table_limit: 10 },
  business: { venue_limit: 5, table_limit: 50 },
  custom: { venue_limit: 0, table_limit: 0 },
};

export function isPaidPlanType(value: string): value is PaidPlanType {
  return value === "solo" || value === "business";
}

export function isTablePlanType(value: string): value is TablePlanType {
  return (
    value === "freemium" ||
    value === "solo" ||
    value === "business" ||
    value === "custom"
  );
}

export function tableLimitsForPlan(plan: TablePlanType): TablePlanLimits {
  return { ...TABLE_PLAN_LIMITS[plan] };
}

export type SpaceModules = Partial<Record<AkubModuleId, ModuleEntitlement>>;

/**
 * Shared space (business) document on Firestore `(default)`.
 * Inventory grandfather root fields remain for live Inventory compatibility.
 */
export type SpaceDocument = {
  id: string;
  owner_uid: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  created_at: number;
  iat: number;
  updatedAt?: number;
  modules?: SpaceModules;

  // —— Inventory grandfather root fields ——
  license_status?: "active" | "expired";
  plan_type?: InventoryPlanType | string;
  product_limit?: number;
  sku_seq?: number;
  /** @deprecated mapped to product_limit on read */
  channel_limit?: number;
  payment_tx_ref?: string;
  flutterwave_transaction_id?: number;
  license_expires_at?: number;
  referred_by_affiliate_id?: string;
  affiliate_code?: string;
  promo_entitlement?: Record<string, unknown>;
  /** @deprecated legacy Stripe */
  stripe_checkout_session_id?: string;
  stripe_customer_id?: string;
};

/** Alias preferred by satellites. */
export type Space = SpaceDocument;
