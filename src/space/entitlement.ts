import type {
  AkubModuleId,
  InventoryPlanType,
  ModuleEntitlement,
  ModuleEntitlementStatus,
  SpaceDocument,
  SpaceModules,
} from "./module";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function parseModuleEntitlement(raw: unknown): ModuleEntitlement | undefined {
  const d = asRecord(raw);
  if (!d) return undefined;

  const status = (d.status as ModuleEntitlementStatus) ?? "none";
  const entitlement: ModuleEntitlement = { status };

  if (typeof d.activated_at === "number") entitlement.activated_at = d.activated_at;
  if (typeof d.license_expires_at === "number") {
    entitlement.license_expires_at = d.license_expires_at;
  }
  if (d.plan_type != null) entitlement.plan_type = String(d.plan_type);
  if (
    d.billing_period === "monthly" ||
    d.billing_period === "quarterly" ||
    d.billing_period === "yearly"
  ) {
    entitlement.billing_period = d.billing_period;
  }
  if (d.limits && typeof d.limits === "object") {
    entitlement.limits = d.limits as Record<string, number>;
  }
  if (d.payment_tx_ref != null) entitlement.payment_tx_ref = String(d.payment_tx_ref);
  if (typeof d.flutterwave_transaction_id === "number") {
    entitlement.flutterwave_transaction_id = d.flutterwave_transaction_id;
  }
  if (d.referred_by_affiliate_id != null) {
    entitlement.referred_by_affiliate_id = String(d.referred_by_affiliate_id);
  }
  if (d.affiliate_code != null) entitlement.affiliate_code = String(d.affiliate_code);
  if (d.promo_entitlement && typeof d.promo_entitlement === "object") {
    entitlement.promo_entitlement = d.promo_entitlement as Record<string, unknown>;
  }
  if (typeof d.updated_at === "number") entitlement.updated_at = d.updated_at;

  return entitlement;
}

function parseModulesMap(raw: unknown): SpaceModules | undefined {
  const d = asRecord(raw);
  if (!d) return undefined;
  const out: SpaceModules = {};
  for (const key of ["inventory", "table"] as AkubModuleId[]) {
    if (d[key] != null) {
      const ent = parseModuleEntitlement(d[key]);
      if (ent) out[key] = ent;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * True when the space doc shows Inventory was ever licensed via root fields
 * (live Inventory grandfather). Spaces that only activated other modules
 * must not be treated as Inventory-active.
 */
export function hasInventoryRootLicenseEvidence(
  data: Record<string, unknown>,
): boolean {
  return (
    data.license_status != null ||
    data.plan_type != null ||
    typeof data.product_limit === "number" ||
    typeof data.channel_limit === "number" ||
    typeof data.license_expires_at === "number" ||
    data.payment_tx_ref != null
  );
}

/**
 * Derive Inventory entitlement from grandfather root license fields
 * when `modules.inventory` is absent.
 */
export function deriveInventoryEntitlementFromRoot(
  data: Record<string, unknown>,
  now = Math.floor(Date.now() / 1000),
): ModuleEntitlement {
  if (!hasInventoryRootLicenseEvidence(data)) {
    return { status: "none" };
  }

  const productLimit =
    typeof data.product_limit === "number"
      ? data.product_limit
      : typeof data.channel_limit === "number"
        ? data.channel_limit
        : 50;

  const licenseExpiresAt =
    typeof data.license_expires_at === "number"
      ? data.license_expires_at
      : undefined;

  let status: ModuleEntitlementStatus =
    (data.license_status as ModuleEntitlementStatus) ?? "active";
  if (status === "active" || status === "expired" || !status) {
    if (licenseExpiresAt != null && licenseExpiresAt < now) {
      status = "expired";
    } else if (!data.license_status) {
      status = "active";
    } else {
      status = data.license_status as ModuleEntitlementStatus;
    }
  }

  const planType = data.plan_type != null ? String(data.plan_type) : "solo";

  const entitlement: ModuleEntitlement = {
    status,
    plan_type: planType,
    limits: { product_limit: productLimit },
  };

  if (licenseExpiresAt != null) entitlement.license_expires_at = licenseExpiresAt;
  if (data.payment_tx_ref != null) {
    entitlement.payment_tx_ref = String(data.payment_tx_ref);
  }
  if (typeof data.flutterwave_transaction_id === "number") {
    entitlement.flutterwave_transaction_id = data.flutterwave_transaction_id;
  }
  if (data.referred_by_affiliate_id != null) {
    entitlement.referred_by_affiliate_id = String(data.referred_by_affiliate_id);
  }
  if (data.affiliate_code != null) {
    entitlement.affiliate_code = String(data.affiliate_code);
  }
  if (data.promo_entitlement && typeof data.promo_entitlement === "object") {
    entitlement.promo_entitlement = data.promo_entitlement as Record<string, unknown>;
  }
  if (typeof data.created_at === "number") {
    entitlement.activated_at = data.created_at;
  }

  return entitlement;
}

function normaliseEntitlementExpiry(
  entitlement: ModuleEntitlement,
  now: number,
): ModuleEntitlement {
  if (
    entitlement.status === "active" &&
    entitlement.license_expires_at != null &&
    entitlement.license_expires_at < now
  ) {
    return { ...entitlement, status: "expired" };
  }
  return entitlement;
}

/**
 * Resolve module entitlement. Inventory: if `modules.inventory` missing, derive from root.
 * If both exist, `modules.inventory` wins.
 */
export function getModuleEntitlement(
  space: SpaceDocument | Record<string, unknown>,
  moduleId: AkubModuleId,
  now = Math.floor(Date.now() / 1000),
): ModuleEntitlement {
  const data = space as Record<string, unknown>;
  const modules: SpaceModules =
    ("modules" in space && space.modules
      ? space.modules
      : parseModulesMap(data.modules)) ?? {};

  const fromMap = modules[moduleId];
  if (fromMap) {
    return normaliseEntitlementExpiry(fromMap, now);
  }

  if (moduleId === "inventory") {
    return normaliseEntitlementExpiry(
      deriveInventoryEntitlementFromRoot(data, now),
      now,
    );
  }

  return { status: "none" };
}

export function isModuleActive(
  space: SpaceDocument | Record<string, unknown>,
  moduleId: AkubModuleId,
  now = Math.floor(Date.now() / 1000),
): boolean {
  const ent = getModuleEntitlement(space, moduleId, now);
  if (ent.status !== "active") return false;
  if (ent.license_expires_at != null && ent.license_expires_at < now) {
    return false;
  }
  return true;
}

export type InventoryLicenseWriteInput = {
  plan_type: InventoryPlanType | string;
  product_limit: number;
  license_status?: "active" | "expired";
  license_expires_at?: number;
  payment_tx_ref?: string;
  flutterwave_transaction_id?: number;
  referred_by_affiliate_id?: string;
  affiliate_code?: string;
  promo_entitlement?: Record<string, unknown>;
  /** Preserve existing activated_at when renewing. */
  activated_at?: number;
  now?: number;
};

/**
 * Build Inventory `ModuleEntitlement` for dual-write onto `modules.inventory`.
 */
export function buildInventoryModuleEntitlement(
  input: InventoryLicenseWriteInput,
): ModuleEntitlement {
  const now = input.now ?? Math.floor(Date.now() / 1000);
  const entitlement: ModuleEntitlement = {
    status: input.license_status ?? "active",
    plan_type: String(input.plan_type),
    limits: { product_limit: input.product_limit },
    activated_at: input.activated_at ?? now,
    updated_at: now,
  };
  if (input.license_expires_at != null) {
    entitlement.license_expires_at = input.license_expires_at;
  }
  if (input.payment_tx_ref) entitlement.payment_tx_ref = input.payment_tx_ref;
  if (input.flutterwave_transaction_id != null) {
    entitlement.flutterwave_transaction_id = input.flutterwave_transaction_id;
  }
  if (input.referred_by_affiliate_id) {
    entitlement.referred_by_affiliate_id = input.referred_by_affiliate_id;
  }
  if (input.affiliate_code) entitlement.affiliate_code = input.affiliate_code;
  if (input.promo_entitlement) {
    entitlement.promo_entitlement = input.promo_entitlement;
  }
  return entitlement;
}

function inventoryRootLicenseFields(
  input: InventoryLicenseWriteInput,
  now: number,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {
    license_status: input.license_status ?? "active",
    plan_type: input.plan_type,
    product_limit: input.product_limit,
    updatedAt: now,
  };

  if (input.license_expires_at != null) {
    patch.license_expires_at = input.license_expires_at;
  }
  if (input.payment_tx_ref) patch.payment_tx_ref = input.payment_tx_ref;
  if (input.flutterwave_transaction_id != null) {
    patch.flutterwave_transaction_id = input.flutterwave_transaction_id;
  }
  if (input.referred_by_affiliate_id) {
    patch.referred_by_affiliate_id = input.referred_by_affiliate_id;
  }
  if (input.affiliate_code) patch.affiliate_code = input.affiliate_code;
  if (input.promo_entitlement) {
    patch.promo_entitlement = input.promo_entitlement;
  }

  return patch;
}

/**
 * Document body for create/set: Inventory root fields + nested `modules.inventory`
 * (safe for `.add()` / `.set()` — does not use dotted field names).
 */
export function applyInventoryDualWrite(
  input: InventoryLicenseWriteInput,
): Record<string, unknown> {
  const now = input.now ?? Math.floor(Date.now() / 1000);
  const modulesInventory = buildInventoryModuleEntitlement({ ...input, now });

  return {
    ...inventoryRootLicenseFields(input, now),
    modules: {
      inventory: modulesInventory,
    },
  };
}

/**
 * Partial update that dual-writes Inventory without clobbering `modules.table`
 * (uses Firestore dotted path `modules.inventory`).
 */
export function applyInventoryDualWriteUpdate(
  input: InventoryLicenseWriteInput,
): Record<string, unknown> {
  const now = input.now ?? Math.floor(Date.now() / 1000);
  const modulesInventory = buildInventoryModuleEntitlement({ ...input, now });

  return {
    ...inventoryRootLicenseFields(input, now),
    "modules.inventory": modulesInventory,
  };
}

/**
 * Mirror winning inventory entitlement onto root fields for old Inventory UI.
 * When entitlement is `none`, root license fields are left undefined.
 */
export function mirrorInventoryEntitlementToRoot(
  entitlement: ModuleEntitlement,
): Partial<
  Pick<
    SpaceDocument,
    | "license_status"
    | "plan_type"
    | "product_limit"
    | "license_expires_at"
    | "payment_tx_ref"
    | "flutterwave_transaction_id"
    | "referred_by_affiliate_id"
    | "affiliate_code"
    | "promo_entitlement"
  >
> {
  if (entitlement.status === "none") {
    return {};
  }

  const productLimit =
    typeof entitlement.limits?.product_limit === "number"
      ? entitlement.limits.product_limit
      : 50;

  return {
    license_status:
      entitlement.status === "expired" ? "expired" : "active",
    plan_type: (entitlement.plan_type as InventoryPlanType) ?? "solo",
    product_limit: productLimit,
    license_expires_at: entitlement.license_expires_at,
    payment_tx_ref: entitlement.payment_tx_ref,
    flutterwave_transaction_id: entitlement.flutterwave_transaction_id,
    referred_by_affiliate_id: entitlement.referred_by_affiliate_id,
    affiliate_code: entitlement.affiliate_code,
    promo_entitlement: entitlement.promo_entitlement,
  };
}

/**
 * Normalise a raw Firestore space doc into `SpaceDocument`.
 * Inventory: modules.inventory wins when present; else derive; always mirror root.
 */
export function normalizeSpaceDocument(
  id: string,
  data: Record<string, unknown>,
  now = Math.floor(Date.now() / 1000),
): SpaceDocument {
  const modulesFromDoc = parseModulesMap(data.modules);
  const inventory = getModuleEntitlement(
    { ...data, modules: modulesFromDoc, id, owner_uid: String(data.owner_uid ?? ""), name: String(data.name ?? ""), slug: String(data.slug ?? ""), created_at: Number(data.created_at ?? 0), iat: Number(data.iat ?? 0) },
    "inventory",
    now,
  );
  const mirrored = mirrorInventoryEntitlementToRoot(inventory);

  const modules: SpaceModules = { ...(modulesFromDoc ?? {}) };
  modules.inventory = inventory;

  if (modulesFromDoc?.table) {
    modules.table = normaliseEntitlementExpiry(modulesFromDoc.table, now);
  }

  return {
    id,
    owner_uid: String(data.owner_uid),
    name: String(data.name),
    slug: String(data.slug),
    logo_url:
      data.logo_url === null || data.logo_url === undefined
        ? (data.logo_url as string | null | undefined)
        : String(data.logo_url),
    created_at: Number(data.created_at),
    iat: Number(data.iat),
    updatedAt: data.updatedAt != null ? Number(data.updatedAt) : undefined,
    modules,
    ...mirrored,
    sku_seq: typeof data.sku_seq === "number" ? data.sku_seq : undefined,
    channel_limit:
      typeof data.channel_limit === "number" ? data.channel_limit : undefined,
    stripe_checkout_session_id:
      data.stripe_checkout_session_id != null
        ? String(data.stripe_checkout_session_id)
        : undefined,
    stripe_customer_id:
      data.stripe_customer_id != null
        ? String(data.stripe_customer_id)
        : undefined,
  };
}

/** Default module for payment intents missing `module` (live Inventory). */
export function resolvePaymentIntentModule(
  module: unknown,
): AkubModuleId {
  if (module === "table" || module === "inventory") return module;
  return "inventory";
}
