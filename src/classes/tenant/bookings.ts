import { DocumentSchema, PaymentLogicType } from "../..";
import { Model } from "../model";

export interface BookingOpeningHours {
  [day: string]: Array<{
    open: string;
    close: string;
  }>;
}

export interface BookingReservationLogic {
  amount: number;
  type: PaymentLogicType;
}

/** Customer-facing booking paywall options a tenant can activate. */
export type BookingPaymentMethod = "on_arrival" | "online";

export interface BookingTenantAppointmentsConfig {
  services?: string[];
  location?: [string, string, string];
  about?: string;
  hours?: BookingOpeningHours;
  reservationLogic?: BookingReservationLogic;
  /**
   * @deprecated Prefer `activatedPaymentMethods`. Kept for existing tenants.
   * `pay_now` ≈ online only; `reserve_only` ≈ on arrival only.
   */
  reservationMode?: "pay_now" | "reserve_only";
  /**
   * Which paywall options appear on the public booking checkout.
   * Defaults to `["on_arrival"]` when unset.
   */
  activatedPaymentMethods?: BookingPaymentMethod[];
  gallery?: { url: string; position: number }[];
}

export type BookingTenantExtension = DocumentSchema & {
  tenantId: string;
  appointments?: BookingTenantAppointmentsConfig;
};

export class BookingTenantExtensionModel extends Model<BookingTenantExtension> {}
