
import type { Mapping, MappingSets, XsdNode } from '@/types';

// Simple mock data for preview
const mockSourceData: { [key: string]: string } = {
  'source-order-id': 'ORD-12345',
  'source-first-name': 'John',
  'source-last-name': 'Doe',
  'source-email': 'john.doe@example.com',
  'source-street': '123 Main St',
  'source-city': 'Anytown',
  'source-zip': '12345',
  'source-order-status': 'Completed',
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

export const generateXmlPreview = (mappingSets: MappingSets, targetSchema: XsdNode | null): string => {
  if (!targetSchema) return '<preview/>';
  
  const allMappings = [...mappingSets.set1, ...mappingSets.set2, ...mappingSets.set3];

  const generateNode = (node: XsdNode, indent: string): string => {
    let childXml = '';
    
    const relevantMappings = allMappings.filter(m => m.targetId === node.id);
    
    let nodeValue = '';
    if (relevantMappings.length > 0) {
      if (relevantMappings.length > 1) {
        // CONCAT multiple sources
        nodeValue = relevantMappings.map(m => mockSourceData[m.sourceId] || `[${m.sourceId}]`).join(' ');
      } else {
        const mapping = relevantMappings[0];
        const sourceValue = mockSourceData[mapping.sourceId] || `[${mapping.sourceId}]`;
        
        switch (mapping.transformation?.type) {
          case 'UPPERCASE':
            nodeValue = sourceValue.toUpperCase();
            break;
          case 'CONCAT':
            // This is now handled by the multi-mapping logic, but we'll keep a simplified version
            // for when CONCAT is explicitly set on a single mapping for some reason.
            nodeValue = `${mockSourceData['source-first-name'] || ''} ${mockSourceData['source-last-name'] || ''}`.trim();
            break;
          case 'CONDITION':
            if (sourceValue === mapping.transformation.params?.conditionValue) {
              nodeValue = mapping.transformation.params?.outputValue || '';
            } else {
              nodeValue = ''; // Or some default/empty value
            }
            break;
          default:
            nodeValue = sourceValue;
        }
      }
    }

    if (node.children && node.children.length > 0) {
      childXml = node.children.map(child => generateNode(child, indent + '  ')).join('\n');
      return `${indent}<${node.name}>\n${childXml}\n${indent}</${node.name}>`;
    } else {
      return `${indent}<${node.name}>${nodeValue || ''}</${node.name}>`;
    }
  };

  const prettyPrint = (xml: string) => {
    const xmlDoc = new DOMParser().parseFromString(xml, 'application/xml');
    const xsltDoc = new DOMParser().parseFromString(
      [
        '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
        '  <xsl:output method="xml" indent="yes"/>',
        '  <xsl:strip-space elements="*"/>',
        '  <xsl/template match="node()|@*">',
        '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
        '  </xsl/template>',
        '</xsl:stylesheet>',
      ].join('\n'),
      'application/xml'
    );
    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsltDoc);
    const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    return new XMLSerializer().serializeToString(resultDoc);
  };
  
  // The generator creates a flat structure, so we need to rebuild the hierarchy
  // This is a simplified reconstruction for preview purposes.
  const buildHierarchy = (mappings: Mapping[], schema: XsdNode): any => {
      const output: any = {};

      const findPath = (targetId: string, currentNode: XsdNode, path: string[] = []): string[] | null => {
        const newPath = [...path, currentNode.name];
        if(currentNode.id === targetId) return newPath;
        if(currentNode.children){
          for(const child of currentNode.children){
            const result = findPath(targetId, child, newPath);
            if(result) return result;
          }
        }
        return null;
      }

      const setValue = (obj: any, path: string[], value: any) => {
        let current = obj;
        for(let i = 1; i < path.length -1; i++){
          current = current[path[i]] = current[path[i]] || {};
        }
        current[path[path.length -1]] = value;
      }
      
      const tempOutput : any = {};

      mappings.forEach(m => {
        const path = findPath(m.targetId, schema);
        if(!path) return;
        
        let nodeValue = '';
        const sourceValue = mockSourceData[m.sourceId] || `[${m.sourceId}]`;

        switch (m.transformation?.type) {
            case 'UPPERCASE':
              nodeValue = sourceValue.toUpperCase();
              break;
            case 'CONDITION':
               if (sourceValue === m.transformation.params?.conditionValue) {
                  nodeValue = m.transformation.params?.outputValue || '';
               } else {
                  nodeValue = '';
               }
               break;
            default:
              nodeValue = sourceValue;
          }

        const targetId = m.targetId;
        if(!tempOutput[targetId]){
          tempOutput[targetId] = { path: path, values: [] };
        }
        tempOutput[targetId].values.push(nodeValue);
      });

      Object.values(tempOutput).forEach((item: any) => {
          setValue(output, item.path, item.values.join(' '));
      });
      
      return output;
  }

  const objToXml = (obj: any, rootName: string): string => {
      const toXml = (o: any, name: string): string => {
          let xml = '';
          if (Array.isArray(o)) {
              o.forEach(v => (xml += toXml(v, name)));
          } else if (typeof o === 'object' && o !== null) {
              let hasChild = false;
              xml += `<${name}>`;
              for (const key in o) {
                  if (o.hasOwnProperty(key)) {
                      hasChild = true;
                      xml += toXml(o[key], key);
                  }
              }
              xml += `</${name}>`;
          } else {
              xml = `<${name}>${o}</${name}>`;
          }
          return xml;
      };
      return toXml(obj, rootName);
  }

  const hierarchy = buildHierarchy(allMappings, targetSchema);
  const rawXml = objToXml(hierarchy, targetSchema.name);
  
  try {
     return prettyPrint(`<?xml version="1.0" encoding="UTF-8"?>${rawXml}`);
  } catch(e) {
    console.error("XML Pretty print failed", e);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${rawXml}`; // fallback
  }
};
