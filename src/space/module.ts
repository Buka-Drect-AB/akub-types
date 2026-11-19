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
export type ModuleEntitlement = {
  status: ModuleEntitlementStatus;
  /** First successful activation (unix seconds). */
  activated_at?: number;
  /** Unix seconds; omit if lifetime / none. */
  license_expires_at?: number;
  /** Module-specific plan key (e.g. inventory: solo|business). */
  plan_type?: string;
  /** Module-specific caps (inventory: product_limit; table: venue_quota). */
  limits?: Record<string, number>;
  payment_tx_ref?: string;
  flutterwave_transaction_id?: number;
  referred_by_affiliate_id?: string;
  affiliate_code?: string;
  /** Opaque promo snapshot — apps own the detailed shape. */
  promo_entitlement?: Record<string, unknown>;
  updated_at?: number;
};

export type InventoryPlanType = "solo" | "business";

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
