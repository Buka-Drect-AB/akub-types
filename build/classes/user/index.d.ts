import { DocumentSchema } from "../..";
import { Model } from "../model";
export type AuthProviderKind = "pasby" | "google" | "email" | "custom";
export type User = DocumentSchema & {
    email: string;
    naming: {
        first: string;
        last: string;
        middle?: string;
    };
    photoUrl?: string | null | undefined;
    eid?: string;
    phone?: string | null | undefined;
    security: {
        emailVerified: boolean;
        phoneVerified: boolean;
        authProvider: AuthProviderKind[];
    };
};
export declare class UserModel extends Model<User> {
    get fullname(): string;
    get accountIsValid(): boolean;
    static createFullName(name: {
        first: string;
        last: string;
        middle?: string;
    }): string;
}
