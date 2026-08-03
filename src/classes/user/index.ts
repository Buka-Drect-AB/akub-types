import { DocumentSchema } from "../..";
import { Model } from "../model";

export type AuthProviderKind = "pasby" | "google" | "email" | "custom";

export type User = DocumentSchema & {
  email: string;
  naming: { first: string; last: string; middle?: string };
  photoUrl?: string | null | undefined;
  eid?: string;
  phone?: string | null | undefined;
  security: {
    emailVerified: boolean;
    phoneVerified: boolean;
    authProvider: AuthProviderKind[];
  };
};

export class UserModel extends Model<User> {
  get fullname(): string {
    const { first, last } = this.schema.naming;
    return [first, last].filter(Boolean).join(" ").trim() || this.data.email;
  }

  get accountIsValid(): boolean {
    return (
      this.data.naming.first.length > 1 && this.data.naming.last.length > 1
    );
  }

  static createFullName(name: {
    first: string;
    last: string;
    middle?: string;
  }): string {
    return `${name.first}${name.middle ? ` ${name.middle}` : ""} ${name.last}`;
  }
}
