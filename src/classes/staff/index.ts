import { DocumentSchema } from "../..";
import { Model } from "../model";

export type Staff = {
  org: string; // org id
  createdBy: string; // user id
  whatsapp?: string;
  name: string;
  venues: string[]; // venues this inventory apply to
  pin: string;
  imageUrl?: string;
} & DocumentSchema;

export class StaffItemModel extends Model<Staff> { }