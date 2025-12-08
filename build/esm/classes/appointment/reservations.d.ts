import { AppointmentSource, AppointmentStatus, DocumentSchema } from "../..";
import { Model } from "../model";
export type Reservation = {
    tenant: string;
    reservation: {
        paid: number;
        total: number;
        fee: number;
    };
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    services: Array<{
        id: string;
        service: string;
        pricingOptionIndex: number;
        quantity: number;
    }>;
    source: AppointmentSource;
    trxID: string;
    status: AppointmentStatus;
    details: {
        date: string;
        time: string;
    };
    method: 'online' | 'on_arrival';
} & DocumentSchema;
export declare class ReservationModel extends Model<Reservation> {
}
