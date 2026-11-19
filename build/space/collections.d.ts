/**
 * Akub central collections on Firestore `(default)`.
 * Does not replace legacy monolith `collections` in enums.ts.
 */
export declare const akubCollections: {
    readonly users: "users";
    readonly spaces: "spaces";
    readonly paymentIntents: "paymentIntents";
    readonly pendingSpaceLicenses: "pendingSpaceLicenses";
    readonly affiliates: "affiliates";
    readonly affiliateCommissions: "affiliateCommissions";
    readonly affiliatePayouts: "affiliatePayouts";
    readonly promoCodes: "promoCodes";
    readonly promoRedemptions: "promoRedemptions";
    readonly platformAdmins: "platform_admins";
    /** Inventory module data (grandfathered on default under spaces). */
    readonly products: "products";
    readonly sales: "sales";
};
/** Named Firestore database ids in project akub-prod. */
export declare const akubDatabases: {
    readonly default: "(default)";
    readonly tables: "tables";
};
export type AkubDatabaseId = (typeof akubDatabases)[keyof typeof akubDatabases];
export declare function spaceProductsPath(spaceId: string): string;
export declare function spaceSalesPath(spaceId: string): string;
