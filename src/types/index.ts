

export interface XsdNode {
  id: string;
  name: string;
  type: string;
  children?: XsdNode[];
}

export interface Mapping {
  id: string;
  sourceId: string;
  targetId: string;
  transformation?: Transformation;
}

export type MappingSet = 'set1' | 'set2' | 'set3';

export type MappingSets = {
  [key in MappingSet]: Mapping[];
};

export type SchemasBySet = {
  [key in MappingSet]: XsdNode | null;
}

export type TransformationType = 'NONE' | 'CONCAT' | 'UPPERCASE' | 'SPLIT' | 'MERGE' | 'CONDITION';

export interface Transformation {
  type: TransformationType;
  params?: { [key: string]: any };
}
