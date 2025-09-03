import type { Mapping, XsdNode } from '@/types';

// Simple mock data for preview
const mockSourceData: { [key: string]: string } = {
  'source-order-id': 'ORD-12345',
  'source-first-name': 'John',
  'source-last-name': 'Doe',
  'source-email': 'john.doe@example.com',
  'source-street': '123 Main St',
  'source-city': 'Anytown',
  'source-zip': '12345',
};

const getNodeById = (schema: XsdNode, id: string): XsdNode | null => {
    if (schema.id === id) return schema;
    if (schema.children) {
        for (const child of schema.children) {
            const found = getNodeById(child, id);
            if (found) return found;
        }
    }
    return null;
}

export const generateXmlPreview = (mappings: Mapping[], targetSchema: XsdNode | null): string => {
  if (!targetSchema) return '<preview/>';

  const generateNode = (node: XsdNode, indent: string): string => {
    let childXml = '';
    
    // Check if there is a mapping to this node
    const mapping = mappings.find(m => m.targetId === node.id);
    
    let nodeValue = '';
    if (mapping) {
      const sourceValue = mockSourceData[mapping.sourceId] || `[${mapping.sourceId}]`;
      
      switch (mapping.transformation?.type) {
        case 'UPPERCASE':
          nodeValue = sourceValue.toUpperCase();
          break;
        case 'CONCAT':
          // Simplified Concat example
          nodeValue = `${mockSourceData['source-first-name'] || ''} ${mockSourceData['source-last-name'] || ''}`.trim();
          break;
        default:
          nodeValue = sourceValue;
      }
    }

    if (node.children && node.children.length > 0) {
      childXml = node.children.map(child => generateNode(child, indent + '  ')).join('\n');
      return `${indent}<${node.name}>\n${childXml}\n${indent}</${node.name}>`;
    } else {
      return `${indent}<${node.name}>${nodeValue}</${node.name}>`;
    }
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n${generateNode(targetSchema, '')}`;
};
