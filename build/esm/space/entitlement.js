"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasInventoryRootLicenseEvidence = hasInventoryRootLicenseEvidence;
exports.deriveInventoryEntitlementFromRoot = deriveInventoryEntitlementFromRoot;
exports.getModuleEntitlement = getModuleEntitlement;
exports.isModuleActive = isModuleActive;
exports.buildInventoryModuleEntitlement = buildInventoryModuleEntitlement;
exports.applyInventoryDualWrite = applyInventoryDualWrite;
exports.applyInventoryDualWriteUpdate = applyInventoryDualWriteUpdate;
exports.mirrorInventoryEntitlementToRoot = mirrorInventoryEntitlementToRoot;
exports.normalizeSpaceDocument = normalizeSpaceDocument;
exports.resolvePaymentIntentModule = resolvePaymentIntentModule;
function asRecord(value) {
    if (!value || typeof value !== "object")
        return null;
    return value;
}
function parseModuleEntitlement(raw) {
    var _a;
    const d = asRecord(raw);
    if (!d)
        return undefined;
    const status = (_a = d.status) !== null && _a !== void 0 ? _a : "none";
    const entitlement = { status };
    if (typeof d.activated_at === "number")
        entitlement.activated_at = d.activated_at;
    if (typeof d.license_expires_at === "number") {
        entitlement.license_expires_at = d.license_expires_at;
    }
    if (d.plan_type != null)
        entitlement.plan_type = String(d.plan_type);
    if (d.limits && typeof d.limits === "object") {
        entitlement.limits = d.limits;
    }
    if (d.payment_tx_ref != null)
        entitlement.payment_tx_ref = String(d.payment_tx_ref);
    if (typeof d.flutterwave_transaction_id === "number") {
        entitlement.flutterwave_transaction_id = d.flutterwave_transaction_id;
    }
    if (d.referred_by_affiliate_id != null) {
        entitlement.referred_by_affiliate_id = String(d.referred_by_affiliate_id);
    }
    if (d.affiliate_code != null)
        entitlement.affiliate_code = String(d.affiliate_code);
    if (d.promo_entitlement && typeof d.promo_entitlement === "object") {
        entitlement.promo_entitlement = d.promo_entitlement;
    }
    if (typeof d.updated_at === "number")
        entitlement.updated_at = d.updated_at;
    return entitlement;
}
function parseModulesMap(raw) {
    const d = asRecord(raw);
    if (!d)
        return undefined;
    const out = {};
    for (const key of ["inventory", "table"]) {
        if (d[key] != null) {
            const ent = parseModuleEntitlement(d[key]);
            if (ent)
                out[key] = ent;
        }
    }
    return Object.keys(out).length ? out : undefined;
}
/**
 * True when the space doc shows Inventory was ever licensed via root fields
 * (live Inventory grandfather). Spaces that only activated other modules
 * must not be treated as Inventory-active.
 */
function hasInventoryRootLicenseEvidence(data) {
    return (data.license_status != null ||
        data.plan_type != null ||
        typeof data.product_limit === "number" ||
        typeof data.channel_limit === "number" ||
        typeof data.license_expires_at === "number" ||
        data.payment_tx_ref != null);
}
/**
 * Derive Inventory entitlement from grandfather root license fields
 * when `modules.inventory` is absent.
 */
function deriveInventoryEntitlementFromRoot(data, now = Math.floor(Date.now() / 1000)) {
    var _a;
    if (!hasInventoryRootLicenseEvidence(data)) {
        return { status: "none" };
    }
    const productLimit = typeof data.product_limit === "number"
        ? data.product_limit
        : typeof data.channel_limit === "number"
            ? data.channel_limit
            : 50;
    const licenseExpiresAt = typeof data.license_expires_at === "number"
        ? data.license_expires_at
        : undefined;
    let status = (_a = data.license_status) !== null && _a !== void 0 ? _a : "active";
    if (status === "active" || status === "expired" || !status) {
        if (licenseExpiresAt != null && licenseExpiresAt < now) {
            status = "expired";
        }
        else if (!data.license_status) {
            status = "active";
        }
        else {
            status = data.license_status;
        }
    }
    const planType = data.plan_type != null ? String(data.plan_type) : "solo";
    const entitlement = {
        status,
        plan_type: planType,
        limits: { product_limit: productLimit },
    };
    if (licenseExpiresAt != null)
        entitlement.license_expires_at = licenseExpiresAt;
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
        entitlement.promo_entitlement = data.promo_entitlement;
    }
    if (typeof data.created_at === "number") {
        entitlement.activated_at = data.created_at;
    }
    return entitlement;
}
function normaliseEntitlementExpiry(entitlement, now) {
    if (entitlement.status === "active" &&
        entitlement.license_expires_at != null &&
        entitlement.license_expires_at < now) {
        return Object.assign(Object.assign({}, entitlement), { status: "expired" });
    }
    return entitlement;
}
/**
 * Resolve module entitlement. Inventory: if `modules.inventory` missing, derive from root.
 * If both exist, `modules.inventory` wins.
 */
function getModuleEntitlement(space, moduleId, now = Math.floor(Date.now() / 1000)) {
    var _a;
    const data = space;
    const modules = (_a = ("modules" in space && space.modules
        ? space.modules
        : parseModulesMap(data.modules))) !== null && _a !== void 0 ? _a : {};
    const fromMap = modules[moduleId];
    if (fromMap) {
        return normaliseEntitlementExpiry(fromMap, now);
    }
    if (moduleId === "inventory") {
        return normaliseEntitlementExpiry(deriveInventoryEntitlementFromRoot(data, now), now);
    }
    return { status: "none" };
}
function isModuleActive(space, moduleId, now = Math.floor(Date.now() / 1000)) {
    const ent = getModuleEntitlement(space, moduleId, now);
    if (ent.status !== "active")
        return false;
    if (ent.license_expires_at != null && ent.license_expires_at < now) {
        return false;
    }
    return true;
}
/**
 * Build Inventory `ModuleEntitlement` for dual-write onto `modules.inventory`.
 */
function buildInventoryModuleEntitlement(input) {
    var _a, _b, _c;
    const now = (_a = input.now) !== null && _a !== void 0 ? _a : Math.floor(Date.now() / 1000);
    const entitlement = {
        status: (_b = input.license_status) !== null && _b !== void 0 ? _b : "active",
        plan_type: String(input.plan_type),
        limits: { product_limit: input.product_limit },
        activated_at: (_c = input.activated_at) !== null && _c !== void 0 ? _c : now,
        updated_at: now,
    };
    if (input.license_expires_at != null) {
        entitlement.license_expires_at = input.license_expires_at;
    }
    if (input.payment_tx_ref)
        entitlement.payment_tx_ref = input.payment_tx_ref;
    if (input.flutterwave_transaction_id != null) {
        entitlement.flutterwave_transaction_id = input.flutterwave_transaction_id;
    }
    if (input.referred_by_affiliate_id) {
        entitlement.referred_by_affiliate_id = input.referred_by_affiliate_id;
    }
    if (input.affiliate_code)
        entitlement.affiliate_code = input.affiliate_code;
    if (input.promo_entitlement) {
        entitlement.promo_entitlement = input.promo_entitlement;
    }
    return entitlement;
}
function inventoryRootLicenseFields(input, now) {
    var _a;
    const patch = {
        license_status: (_a = input.license_status) !== null && _a !== void 0 ? _a : "active",
        plan_type: input.plan_type,
        product_limit: input.product_limit,
        updatedAt: now,
    };
    if (input.license_expires_at != null) {
        patch.license_expires_at = input.license_expires_at;
    }
    if (input.payment_tx_ref)
        patch.payment_tx_ref = input.payment_tx_ref;
    if (input.flutterwave_transaction_id != null) {
        patch.flutterwave_transaction_id = input.flutterwave_transaction_id;
    }
    if (input.referred_by_affiliate_id) {
        patch.referred_by_affiliate_id = input.referred_by_affiliate_id;
    }
    if (input.affiliate_code)
        patch.affiliate_code = input.affiliate_code;
    if (input.promo_entitlement) {
        patch.promo_entitlement = input.promo_entitlement;
    }
    return patch;
}
/**
 * Document body for create/set: Inventory root fields + nested `modules.inventory`
 * (safe for `.add()` / `.set()` — does not use dotted field names).
 */
function applyInventoryDualWrite(input) {
    var _a;
    const now = (_a = input.now) !== null && _a !== void 0 ? _a : Math.floor(Date.now() / 1000);
    const modulesInventory = buildInventoryModuleEntitlement(Object.assign(Object.assign({}, input), { now }));
    return Object.assign(Object.assign({}, inventoryRootLicenseFields(input, now)), { modules: {
            inventory: modulesInventory,
        } });
}
/**
 * Partial update that dual-writes Inventory without clobbering `modules.table`
 * (uses Firestore dotted path `modules.inventory`).
 */
function applyInventoryDualWriteUpdate(input) {
    var _a;
    const now = (_a = input.now) !== null && _a !== void 0 ? _a : Math.floor(Date.now() / 1000);
    const modulesInventory = buildInventoryModuleEntitlement(Object.assign(Object.assign({}, input), { now }));
    return Object.assign(Object.assign({}, inventoryRootLicenseFields(input, now)), { "modules.inventory": modulesInventory });
}
/**
 * Mirror winning inventory entitlement onto root fields for old Inventory UI.
 * When entitlement is `none`, root license fields are left undefined.
 */
function mirrorInventoryEntitlementToRoot(entitlement) {
    var _a, _b;
    if (entitlement.status === "none") {
        return {};
    }
    const productLimit = typeof ((_a = entitlement.limits) === null || _a === void 0 ? void 0 : _a.product_limit) === "number"
        ? entitlement.limits.product_limit
        : 50;
    return {
        license_status: entitlement.status === "expired" ? "expired" : "active",
        plan_type: (_b = entitlement.plan_type) !== null && _b !== void 0 ? _b : "solo",
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
function normalizeSpaceDocument(id, data, now = Math.floor(Date.now() / 1000)) {
    var _a, _b, _c, _d, _e;
    const modulesFromDoc = parseModulesMap(data.modules);
    const inventory = getModuleEntitlement(Object.assign(Object.assign({}, data), { modules: modulesFromDoc, id, owner_uid: String((_a = data.owner_uid) !== null && _a !== void 0 ? _a : ""), name: String((_b = data.name) !== null && _b !== void 0 ? _b : ""), slug: String((_c = data.slug) !== null && _c !== void 0 ? _c : ""), created_at: Number((_d = data.created_at) !== null && _d !== void 0 ? _d : 0), iat: Number((_e = data.iat) !== null && _e !== void 0 ? _e : 0) }), "inventory", now);
    const mirrored = mirrorInventoryEntitlementToRoot(inventory);
    const modules = Object.assign({}, (modulesFromDoc !== null && modulesFromDoc !== void 0 ? modulesFromDoc : {}));
    modules.inventory = inventory;
    if (modulesFromDoc === null || modulesFromDoc === void 0 ? void 0 : modulesFromDoc.table) {
        modules.table = normaliseEntitlementExpiry(modulesFromDoc.table, now);
    }
    return Object.assign(Object.assign({ id, owner_uid: String(data.owner_uid), name: String(data.name), slug: String(data.slug), logo_url: data.logo_url === null || data.logo_url === undefined
            ? data.logo_url
            : String(data.logo_url), created_at: Number(data.created_at), iat: Number(data.iat), updatedAt: data.updatedAt != null ? Number(data.updatedAt) : undefined, modules }, mirrored), { sku_seq: typeof data.sku_seq === "number" ? data.sku_seq : undefined, channel_limit: typeof data.channel_limit === "number" ? data.channel_limit : undefined, stripe_checkout_session_id: data.stripe_checkout_session_id != null
            ? String(data.stripe_checkout_session_id)
            : undefined, stripe_customer_id: data.stripe_customer_id != null
            ? String(data.stripe_customer_id)
            : undefined });
}
/** Default module for payment intents missing `module` (live Inventory). */
function resolvePaymentIntentModule(module) {
    if (module === "table" || module === "inventory")
        return module;
    return "inventory";
}
//# sourceMappingURL=entitlement.js.map