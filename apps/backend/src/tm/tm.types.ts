/**
 * TM (T-shaped ER) Modeling Types
 * These match the protocol defined in the TM modeling frontend
 */

// WebSocket command/response
export interface TMCommand {
  id: string;
  command: string;
  params: Record<string, any>;
}

export interface TMResponse {
  id: string;
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// TM domain types
export type EntityType = 'resource' | 'event';
export type EntitySubtype = 'basic' | 'recursive' | 'correspondence';
export type Cardinality = '1:1' | '1:N' | 'N:1';

export interface TMEntity {
  id: string;
  name: string;
  type: EntityType;
  subtype: EntitySubtype;
  color: string;
  x: number;
  y: number;
  comment: string;
  attributes: TMAttribute[];
}

export type IdentifierType = 'own' | 'reference' | null;

export interface TMAttribute {
  id: string;
  name: string;
  dataType: string;
  isIdentifier: boolean;
  identifierType: IdentifierType;
  referenceId: string | null;
  identifierOrder: number | null;
  isRequired: boolean;
  default: string;
  comment: string;
}

export interface TMReference {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  sourceAttributeId: string;
  targetAttributeId: string;
  cardinality: Cardinality;
  label: string;
  comment: string;
}

export interface TMNote {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface RejectedTerm {
  term: string;
  reason: string;
}

export interface TMTerm {
  id: string;
  name: string;
  definition: string;
  context: string;
  rejected: RejectedTerm[];
  entityRef: string | null;
}

export interface TMDiagram {
  entities: TMEntity[];
  references: TMReference[];
  notes: TMNote[];
  metadata: {
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}
