export type VaultStatus = "unauthenticated" | "locked" | "unlocked";
export type VaultState = {
  userEmail?: string;
  status: VaultStatus;
};
export interface OpAccount {
  url: string;
  email: string;
  user_uuid: string;
  account_uuid: string;
  shorthand: string;
}

export type OpFieldType =
  | "ADDRESS"
  | "CONCEALED"
  | "CREDITCARDNUMBER"
  | "CREDITCARDTYPE"
  | "DATE"
  | "EMAIL"
  | "FILE"
  | "GENDER"
  | "MENU"
  | "MONTHYEAR"
  | "OTP"
  | "PHONE"
  | "REFERENCE"
  | "STRING"
  | "URL";
export type OpFieldPurpose = "PASSWORD" | "USERNAME";
export type OpItemCategory = "PASSWORD" | "LOGIN";

export interface OpField {
  id: string;
  type: OpFieldType;
  purpose?: OpFieldPurpose;
  label: string;
  value: string;
}
export interface OpUrl {
  label: string;
  href: string;
}

export interface OpVAult {
  id: string;
  name: string;
}

export interface OpItem {
  id: string;
  title: string;
  favorite: string;
  category: OpItemCategory;
  vault: OpVAult;
  additional_information: string;
  urls: OpUrl[];
}

export interface OpVAult {
  id: string;
  name: string;
  content_version: number;
}
