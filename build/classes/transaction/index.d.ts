import { DocumentSchema, PaymentStatus, TransactionType } from "../..";
import { Model } from "../model";
export interface TransactionRelationship {
    balance_after?: number;
    merchant: string;
    fee: number;
}
export interface LineItem {
    price: string;
    quantity: number;
}
export type Transaction = {
    reference: string;
    provider: string;
    relationship: TransactionRelationship;
    amount: number;
    paid_at?: number;
    currency: string;
    customer: string;
    type: TransactionType;
    provider_fee?: number;
    redirect_url: string;
    domain: 'test' | 'live';
    status: PaymentStatus;
    metadata?: {
        line_items: LineItem[] | undefined | null;
    };
} & DocumentSchema;
export declare class TransactionModel extends Model<Transaction> {
}
