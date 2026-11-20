/**
 * Akub Table operational types for the named Firestore database `tables`.
 * These do not live on `(default)`.
 */
export type TableMemberStatus = "active" | "revoked";
export type TableMember = {
    id: string;
    space_id: string;
    uid: string;
    status: TableMemberStatus;
    display_name?: string;
    email?: string;
    privileges: string[];
    /** Venues this person may act on; empty = none. */
    venue_ids: string[];
    invited_by?: string;
    iat: number;
    updatedAt?: number;
};
export type TableVenueStatus = "active" | "inactive";
export type TableVenue = {
    id: string;
    space_id: string;
    name: string;
    description?: string;
    location?: Record<string, unknown>;
    contact?: Record<string, unknown>;
    operating?: Record<string, unknown>;
    status: TableVenueStatus;
    iat: number;
    updatedAt?: number;
};
export type MenuStatus = "draft" | "published" | "archived";
export type Menu = {
    id: string;
    space_id: string;
    venue_id: string;
    name: string;
    description?: string;
    status: MenuStatus;
    /** ISO currency; prices are major units (e.g. naira). */
    currency: string;
    sort_order?: number;
    iat: number;
    updatedAt?: number;
};
export type MenuAccompaniment = {
    name: string;
    /** Absolute price when the accompaniment is priced on its own. */
    price: number | null;
    required?: boolean;
};
export type MenuInclusion = {
    name: string;
    quantity?: string;
};
export type MenuCategory = {
    id: string;
    space_id: string;
    venue_id: string;
    menu_id: string;
    name: string;
    /** Section note printed under the heading. */
    note?: string;
    sort_order?: number;
    iat: number;
    updatedAt?: number;
};
export type ItemVariant = {
    id: string;
    name: string;
    /** Major units. Null when not yet priced. */
    price: number | null;
    available?: boolean;
};
export type Modifier = {
    id: string;
    name: string;
    /** Added to the item price. Null when unknown. */
    price_delta: number | null;
};
export type ModifierGroup = {
    id: string;
    space_id: string;
    venue_id: string;
    name: string;
    required: boolean;
    min_select: number;
    max_select: number;
    modifiers: Modifier[];
    iat: number;
    updatedAt?: number;
};
export type MenuItem = {
    id: string;
    space_id: string;
    venue_id: string;
    menu_id: string;
    category_id: string;
    name: string;
    description?: string;
    /** Major units. Draft imports may be 0 until a price is confirmed. */
    price: number;
    /** True when price was not confidently known (import review). */
    price_unconfirmed?: boolean;
    currency?: string;
    image_url?: string | null;
    available: boolean;
    variants?: ItemVariant[];
    modifier_group_ids?: string[];
    /** Portion as printed, e.g. "3 pcs". */
    portion?: string;
    /** Daypart or weekend note. Not a hard availability window. */
    availability_note?: string;
    /** Sides chosen with the item, such as a swallow with soup. */
    accompaniments?: MenuAccompaniment[];
    /** Fixed bundle contents, such as a box of chops. */
    includes?: MenuInclusion[];
    iat: number;
    updatedAt?: number;
};
export type FloorTable = {
    id: string;
    space_id: string;
    venue_id: string;
    /** Display name / number; unique within venue. */
    label: string;
    active: boolean;
    /** Opaque customer-entry token; stable across renames. */
    qr_token: string;
    section?: string;
    capacity?: number;
    description?: string;
    /** @deprecated Prefer qr_token + URL helper. */
    qr_payload?: string;
    iat: number;
    updatedAt?: number;
};
export type TableSessionStatus = "open" | "closed";
export type TableSession = {
    id: string;
    space_id: string;
    venue_id: string;
    floor_table_id: string;
    status: TableSessionStatus;
    opened_at: number;
    closed_at?: number;
    iat: number;
    updatedAt?: number;
};
export type TableOrderStatus = "pending" | "accepted" | "preparing" | "ready" | "served" | "cancelled";
export type TableOrderItem = {
    menu_item_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
    customizations?: Record<string, unknown>;
};
export type TableOrder = {
    id: string;
    space_id: string;
    venue_id: string;
    floor_table_id: string;
    session_id: string;
    reference?: string;
    items: TableOrderItem[];
    total: number;
    currency?: string;
    status: TableOrderStatus;
    iat: number;
    updatedAt?: number;
};
export type ServiceRequestType = "waiter" | "water" | "bill" | "assistance" | string;
export type ServiceRequestStatus = "pending" | "acknowledged" | "in_progress" | "completed" | "cancelled" | "dismissed";
export type ServiceRequest = {
    id: string;
    space_id: string;
    venue_id: string;
    floor_table_id: string;
    session_id: string;
    type: ServiceRequestType;
    message?: string;
    status: ServiceRequestStatus;
    iat: number;
    resolved_at?: number;
    updatedAt?: number;
};
export type PaymentRecordMethod = "cash" | "bank_transfer" | "card_pos" | string;
export type PaymentRecord = {
    id: string;
    space_id: string;
    venue_id: string;
    order_id?: string;
    amount: number;
    currency?: string;
    method: PaymentRecordMethod;
    note?: string;
    recorded_by?: string;
    iat: number;
    updatedAt?: number;
};
/** Collections inside the `tables` named database. */
export declare const tableCollections: {
    readonly members: "members";
    readonly venues: "venues";
    readonly menus: "menus";
    readonly menuCategories: "menuCategories";
    readonly menuItems: "menuItems";
    readonly modifierGroups: "modifierGroups";
    readonly menuImports: "menuImports";
    readonly floorTables: "floorTables";
    readonly tableSessions: "tableSessions";
    readonly orders: "orders";
    readonly serviceRequests: "serviceRequests";
    readonly paymentRecords: "paymentRecords";
};
