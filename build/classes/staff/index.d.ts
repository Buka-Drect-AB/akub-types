import { DocumentSchema, StaffRoles } from "../..";
import { Model } from "../model";
export type Staff = {
    org: string;
    createdBy: string;
    whatsapp?: string;
    shortCode: string;
    name: string;
    venues: string[];
    pin: string;
    role: StaffRoles;
    imageUrl?: string;
} & DocumentSchema;
export declare class StaffModel extends Model<Staff> {
    static generateShortCode(orgShortCode: string, staffData: {
        fullName: string;
        email?: string;
        phone?: string;
    }): string;
}
