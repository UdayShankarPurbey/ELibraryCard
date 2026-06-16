export type FieldDataType = 'string' | 'number' | 'boolean' | 'date' | 'enum';

export interface FieldDefinition {
  _id: string;
  institution: string;
  fieldKey: string;
  label: string;
  dataType: FieldDataType;
  isRequired: boolean;
  options: string[];
  sortOrder: number;
}
