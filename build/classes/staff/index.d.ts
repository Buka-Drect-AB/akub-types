import { DocumentSchema } from "../..";
import { Model } from "../model";
export type Staff = {
    org: string;
    createdBy: string;
    whatsapp?: string;
    name: string;
    venues: string[];
    pin: string;
    imageUrl?: string;
} & DocumentSchema;
export declare class StaffItemModel extends Model<Staff> {
}
