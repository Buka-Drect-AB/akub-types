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

export type MenuCategory = {
  id: string;
  space_id: string;
  venue_id: string;
  name: string;
  sort_order?: number;
  iat: number;
  updatedAt?: number;
};

export type MenuItem = {
  id: string;
  space_id: string;
  venue_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  image_url?: string | null;
  available: boolean;
  variants?: Record<string, unknown>[];
  iat: number;
  updatedAt?: number;
};

export type FloorTable = {
  id: string;
  space_id: string;
  venue_id: string;
  label: string;
  active: boolean;
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

export type TableOrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

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

export type ServiceRequestType =
  | "waiter"
  | "water"
  | "bill"
  | "assistance"
  | string;

export type ServiceRequestStatus =
  | "pending"
  | "acknowledged"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "dismissed";

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
export const tableCollections = {
  members: "members",
  venues: "venues",
  menuCategories: "menuCategories",
  menuItems: "menuItems",
  floorTables: "floorTables",
  tableSessions: "tableSessions",
  orders: "orders",
  serviceRequests: "serviceRequests",
  paymentRecords: "paymentRecords",
} as const;
