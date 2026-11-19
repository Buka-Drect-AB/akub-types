"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.akubDatabases = exports.akubCollections = void 0;
exports.spaceProductsPath = spaceProductsPath;
exports.spaceSalesPath = spaceSalesPath;
/**
 * Akub central collections on Firestore `(default)`.
 * Does not replace legacy monolith `collections` in enums.ts.
 */
exports.akubCollections = {
    users: "users",
    spaces: "spaces",
    paymentIntents: "paymentIntents",
    pendingSpaceLicenses: "pendingSpaceLicenses",
    affiliates: "affiliates",
    affiliateCommissions: "affiliateCommissions",
    affiliatePayouts: "affiliatePayouts",
    promoCodes: "promoCodes",
    promoRedemptions: "promoRedemptions",
    platformAdmins: "platform_admins",
    /** Inventory module data (grandfathered on default under spaces). */
    products: "products",
    sales: "sales",
};
/** Named Firestore database ids in project akub-prod. */
exports.akubDatabases = {
    default: "(default)",
    tables: "tables",
};
function spaceProductsPath(spaceId) {
    return `${exports.akubCollections.spaces}/${spaceId}/${exports.akubCollections.products}`;
}
function spaceSalesPath(spaceId) {
    return `${exports.akubCollections.spaces}/${spaceId}/${exports.akubCollections.sales}`;
}
//# sourceMappingURL=collections.js.map