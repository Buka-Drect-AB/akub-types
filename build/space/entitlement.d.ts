import type { AkubModuleId, InventoryPlanType, ModuleEntitlement, SpaceDocument } from "./module";
/**
 * True when the space doc shows Inventory was ever licensed via root fields
 * (live Inventory grandfather). Spaces that only activated other modules
 * must not be treated as Inventory-active.
 */
export declare function hasInventoryRootLicenseEvidence(data: Record<string, unknown>): boolean;
/**
 * Derive Inventory entitlement from grandfather root license fields
 * when `modules.inventory` is absent.
 */
export declare function deriveInventoryEntitlementFromRoot(data: Record<string, unknown>, now?: number): ModuleEntitlement;
/**
 * Resolve module entitlement. Inventory: if `modules.inventory` missing, derive from root.
 * If both exist, `modules.inventory` wins.
 */
export declare function getModuleEntitlement(space: SpaceDocument | Record<string, unknown>, moduleId: AkubModuleId, now?: number): ModuleEntitlement;
export declare function isModuleActive(space: SpaceDocument | Record<string, unknown>, moduleId: AkubModuleId, now?: number): boolean;
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
export declare function buildInventoryModuleEntitlement(input: InventoryLicenseWriteInput): ModuleEntitlement;
/**
 * Document body for create/set: Inventory root fields + nested `modules.inventory`
 * (safe for `.add()` / `.set()` — does not use dotted field names).
 */
export declare function applyInventoryDualWrite(input: InventoryLicenseWriteInput): Record<string, unknown>;
/**
 * Partial update that dual-writes Inventory without clobbering `modules.table`
 * (uses Firestore dotted path `modules.inventory`).
 */
export declare function applyInventoryDualWriteUpdate(input: InventoryLicenseWriteInput): Record<string, unknown>;
/**
 * Mirror winning inventory entitlement onto root fields for old Inventory UI.
 * When entitlement is `none`, root license fields are left undefined.
 */
export declare function mirrorInventoryEntitlementToRoot(entitlement: ModuleEntitlement): Partial<Pick<SpaceDocument, "license_status" | "plan_type" | "product_limit" | "license_expires_at" | "payment_tx_ref" | "flutterwave_transaction_id" | "referred_by_affiliate_id" | "affiliate_code" | "promo_entitlement">>;
/**
 * Normalise a raw Firestore space doc into `SpaceDocument`.
 * Inventory: modules.inventory wins when present; else derive; always mirror root.
 */
export declare function normalizeSpaceDocument(id: string, data: Record<string, unknown>, now?: number): SpaceDocument;
/** Default module for payment intents missing `module` (live Inventory). */
export declare function resolvePaymentIntentModule(module: unknown): AkubModuleId;
