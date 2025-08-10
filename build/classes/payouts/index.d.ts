import { DocumentSchema, PaymentStatus, TransactionType } from "../..";
import { Model } from "../model";
export type Payout = {
    reference: string;
    provider: string;
    type: TransactionType;
    relationship: {
        balance_after?: number;
        merchant: string;
        fee: number;
    };
    destination: {
        bank: string;
        account: string;
    };
    amount: number;
    paid_at?: number;
    currency: string;
    customer: string;
    provider_fee?: number;
    domain: 'test' | 'live';
    status: PaymentStatus;
} & DocumentSchema;
export declare class PayoutModel extends Model<Payout> {
}
