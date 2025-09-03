import type { Mapping, XsdNode } from '@/types';

const findNodePath = (schema: XsdNode | null, nodeId: string): string => {
  if (!schema) return '';
  const path: string[] = [];

  function search(node: XsdNode, targetId: string): boolean {
    path.push(node.name);
    if (node.id === targetId) {
      return true;
    }
    if (node.children) {
      for (const child of node.children) {
        if (search(child, targetId)) {
          return true;
        }
      }
    }
    path.pop();
    return false;
  }

  search(schema, nodeId);
  return path.join('/');
};

export const generateXslt = (
  mappings: Mapping[],
  sourceSchema: XsdNode | null,
  targetSchema: XsdNode | null
): string => {
  if (!sourceSchema || !targetSchema) {
    return '<!-- Load schemas to generate XSLT -->';
  }

  const rootSourcePath = sourceSchema.name;
  
  const mappingsByTarget = mappings.reduce((acc, mapping) => {
    if (!acc[mapping.targetId]) {
      acc[mapping.targetId] = [];
    }
    acc[mapping.targetId].push(mapping);
    return acc;
  }, {} as { [key: string]: Mapping[] });


  const mappingTemplates = Object.entries(mappingsByTarget)
    .map(([targetId, relatedMappings]) => {
      const targetPath = findNodePath(targetSchema, targetId);
      const targetElementName = targetPath.split('/').pop() || '';
      
      let valueOf = '';

      if (relatedMappings.length > 1) {
        const sourcePaths = relatedMappings.map(m => findNodePath(sourceSchema, m.sourceId).replace(`${rootSourcePath}/`, ''));
        valueOf = `<xsl:value-of select="concat(${sourcePaths.join(", ' ', ")})" />`;
      } else {
        const mapping = relatedMappings[0];
        const sourcePath = findNodePath(sourceSchema, mapping.sourceId).replace(`${rootSourcePath}/`, '');

        if (mapping.transformation) {
          switch (mapping.transformation.type) {
            case 'UPPERCASE':
              valueOf = `<xsl:value-of select="translate(${sourcePath}, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')" />`;
              break;
            case 'CONCAT':
               // This is now handled by multi-mapping.
              valueOf = `<!-- CONCAT Transformation logic for ${sourcePath} -->`;
              break;
            case 'SPLIT':
              valueOf = `<!-- SPLIT Transformation logic for ${sourcePath} -->`;
              break;
            case 'MERGE':
               valueOf = `<!-- MERGE Transformation logic for ${sourcePath} -->`;
              break;
            default:
              valueOf = `<xsl:value-of select="${sourcePath}" />`;
          }
        } else {
           valueOf = `<xsl:value-of select="${sourcePath}" />`;
        }
      }

      return `
      <xsl:element name="${targetElementName}">
        ${valueOf}
      </xsl:element>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/${rootSourcePath}">
    <xsl:element name="${targetSchema.name}">
      ${mappingTemplates}
    </xsl:element>
  </xsl:template>

</xsl:stylesheet>
`;
};
