/**
 * Akub central collections on Firestore `(default)`.
 * Does not replace legacy monolith `collections` in enums.ts.
 */
export const akubCollections = {
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
} as const;

/** Named Firestore database ids in project akub-prod. */
export const akubDatabases = {
  default: "(default)",
  tables: "tables",
} as const;

export type AkubDatabaseId = (typeof akubDatabases)[keyof typeof akubDatabases];

export function spaceProductsPath(spaceId: string): string {
  return `${akubCollections.spaces}/${spaceId}/${akubCollections.products}`;
}

export function spaceSalesPath(spaceId: string): string {
  return `${akubCollections.spaces}/${spaceId}/${akubCollections.sales}`;
}
