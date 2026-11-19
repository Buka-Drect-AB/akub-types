/** Akub satellite module identifiers (extensible). */
export type AkubModuleId = "inventory" | "table";
export declare const AKUB_MODULE_IDS: readonly ["inventory", "table"];
export type ModuleEntitlementStatus = "none" | "active" | "expired" | "suspended";
/**
 * Per-module commercial entitlement on `spaces/{id}.modules.<moduleId>`.
 * Module-specific plan strings and limits live here (not shared inventively across modules).
 */
/** Self-serve billing cadence stored on intents + module entitlements. */
export type BillingPeriod = "monthly" | "quarterly" | "yearly";
export declare const BILLING_PERIODS: readonly ["monthly", "quarterly", "yearly"];
export declare const BILLING_PERIOD_MONTHS: Record<BillingPeriod, number>;
export declare function isBillingPeriod(value: string): value is BillingPeriod;
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
export declare const TABLE_PLAN_TYPES: readonly ["freemium", "solo", "business", "custom"];
export declare const PAID_PLAN_TYPES: readonly ["solo", "business"];
export type TablePlanLimits = {
    venue_limit: number;
    table_limit: number;
};
/** Default caps when activating a known Table plan (custom is support-set). */
export declare const TABLE_PLAN_LIMITS: Record<TablePlanType, TablePlanLimits>;
export declare function isPaidPlanType(value: string): value is PaidPlanType;
export declare function isTablePlanType(value: string): value is TablePlanType;
export declare function tableLimitsForPlan(plan: TablePlanType): TablePlanLimits;
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
