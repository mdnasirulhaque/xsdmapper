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

export type TransformationType = 'NONE' | 'CONCAT' | 'UPPERCASE' | 'SPLIT' | 'MERGE';

export interface Transformation {
  type: TransformationType;
  params?: { [key: string]: any };
}
