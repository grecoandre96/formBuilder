export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "file"
  | "date"
  | "time"
  | "heading"
  | "section";

export interface BaseField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  order: number;
}

export interface TextLikeField extends BaseField {
  type: "text" | "textarea" | "email" | "phone" | "number";
  placeholder?: string;
  helperText?: string;
  minLength?: number;
  maxLength?: number;
}

export interface SelectField extends BaseField {
  type: "select" | "radio";
  options: { label: string; value: string }[];
  placeholder?: string;
}

export interface CheckboxField extends BaseField {
  type: "checkbox";
  options: { label: string; value: string }[];
}

export interface FileField extends BaseField {
  type: "file";
  accept?: string;
  maxSizeMb?: number;
}

export interface DateField extends BaseField {
  type: "date" | "time";
  minDate?: string;
  maxDate?: string;
}

export interface HeadingField extends BaseField {
  type: "heading" | "section";
  content: string;
  level?: 1 | 2 | 3;
}

export type FieldDefinition =
  | TextLikeField
  | SelectField
  | CheckboxField
  | FileField
  | DateField
  | HeadingField;

export interface FormWithFields {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  webhookUrl: string | null;
  webhookHeaders: Record<string, string> | null;
  fields: FieldDefinition[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: { submissions: number };
}
