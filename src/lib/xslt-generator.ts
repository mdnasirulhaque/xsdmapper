
import type { Mapping, MappingSets, SchemasBySet, XsdNode } from '@/types';

const findNodePath = (schema: XsdNode | null, nodeId: string): string => {
  if (!schema) return '';
  const path: string[] = [];

  function search(node: XsdNode, targetId: string): boolean {
    if (node.id === targetId) {
      path.push(node.name);
      return true;
    }
    if (node.children) {
      for (const child of node.children) {
        if (search(child, targetId)) {
          path.unshift(node.name);
          return true;
        }
      }
    }
    return false;
  }

  search(schema, nodeId);
  return path.join('/');
};

const generateRecursiveTemplates = (
  targetNode: XsdNode,
  mappingsByTarget: { [key: string]: Mapping[] },
  sourceSchema: XsdNode,
) => {
  let template = '';
  const children = targetNode.children || [];

  template += `<xsl:element name="${targetNode.name}">\n`;

  // Process direct mappings for this node
  const directMappings = mappingsByTarget[targetNode.id];
  if(directMappings) {
      // This is a leaf node with a mapping.
      if (directMappings.length > 1) {
        const sourcePaths = directMappings.map(m => findNodePath(sourceSchema, m.sourceId).replace(`${sourceSchema.name}/`, ''));
        template += `    <xsl:value-of select="concat(${sourcePaths.join(", ' ', ")})" />\n`;
      } else {
        const mapping = directMappings[0];
        const sourcePath = findNodePath(sourceSchema, mapping.sourceId).replace(`${sourceSchema.name}/`, '');

        if (mapping.transformation) {
          switch (mapping.transformation.type) {
            case 'UPPERCASE':
              template += `      <xsl:value-of select="translate(${sourcePath}, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')" />\n`;
              break;
            case 'CONDITION':
              const { conditionValue = '', outputValue = '' } = mapping.transformation.params || {};
              template += `      <xsl:if test="${sourcePath} = '${conditionValue}'">\n`;
              template += `        <xsl:value-of select="'${outputValue}'"/>\n`;
              template += `      </xsl:if>\n`;
              break;
            default:
              template += `      <xsl:value-of select="${sourcePath}" />\n`;
          }
        } else {
           template += `      <xsl:value-of select="${sourcePath}" />\n`;
        }
      }
  }

  // Process children
  children.forEach(child => {
    // A child should be generated if it or any of its descendants has a mapping
    const hasMapping = (node: XsdNode): boolean => {
       if (mappingsByTarget[node.id]) return true;
       if (node.children) {
           return node.children.some(hasMapping);
       }
       return false;
    }

    if(hasMapping(child)){
      template += generateRecursiveTemplates(child, mappingsByTarget, sourceSchema);
    }
  });

  template += `</xsl:element>\n`;
  return template;
};


export const generateXslt = (
  mappingSets: MappingSets,
  sourceSchemas: SchemasBySet,
  targetSchemas: SchemasBySet
): string => {
  const set1Source = sourceSchemas.set1;
  const set1Target = targetSchemas.set1;

  if (!set1Source || !set1Target) {
    return '<!-- Load schemas for Set 1 to generate XSLT -->';
  }

  const allMappings = [...mappingSets.set1, ...mappingSets.set2, ...mappingSets.set3];
  
  const rootSourcePath = set1Source.name;
  
  const mappingsByTarget = allMappings.reduce((acc, mapping) => {
    if (!acc[mapping.targetId]) {
      acc[mapping.targetId] = [];
    }
    acc[mapping.targetId].push(mapping);
    return acc;
  }, {} as { [key: string]: Mapping[] });


  const mappingTemplates = set1Target.children?.map(childNode => {
      const hasMapping = (node: XsdNode): boolean => {
       if (mappingsByTarget[node.id]) return true;
       if (node.children) {
           return node.children.some(hasMapping);
       }
       return false;
    }
    if(hasMapping(childNode)){
        return generateRecursiveTemplates(childNode, mappingsByTarget, set1Source)
    }
    return '';
  }).join('');
  

  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/${rootSourcePath}">
    <xsl:element name="${set1Target.name}">
${mappingTemplates}
    </xsl:element>
  </xsl:template>

</xsl:stylesheet>
`;
};
