import type { XsdNode } from '@/types';

/**
 * Parses an XSD string into a hierarchical XsdNode structure.
 * This is a simplified parser for demonstration purposes.
 * 
 * @param xsdString The raw XSD content as a string.
 * @param type A string ('source' or 'target') to prefix unique IDs.
 * @returns An XsdNode object representing the schema hierarchy, or null if parsing fails.
 */
export const parseXsdToXsdNode = (xsdString: string, type: 'source' | 'target'): XsdNode | null => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xsdString, "application/xml");

    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName("parsererror");
    if (parserError.length > 0) {
        console.error("XSD Parsing Error:", parserError[0].textContent);
        throw new Error("Failed to parse XSD string. Check console for details.");
    }

    const simpleId = (name: string, index: number) => `${type}-${name.toLowerCase().replace(/[:\s]+/g, '-')}-${index}`;

    function processNode(element: Element, index: number): XsdNode {
      const nodeName = element.getAttribute('name') || element.localName;
      const children: XsdNode[] = [];
      
      // Look for complexType and sequence within the current element
      const complexType = element.querySelector(":scope > complexType, :scope > xs\\:complexType, :scope > xsd\\:complexType");
      const sequence = complexType 
        ? complexType.querySelector(":scope > sequence, :scope > xs\\:sequence, :scope > xsd\\:sequence") 
        : element.querySelector(":scope > sequence, :scope > xs\\:sequence, :scope > xsd\\:sequence");

      if (sequence) {
        Array.from(sequence.children).forEach((child, i) => {
          // Process only 'element' tags within a sequence
          if (child.localName === 'element' || child.tagName.endsWith('element')) {
            children.push(processNode(child, i));
          }
        });
      }

      return {
        id: simpleId(nodeName, index),
        name: nodeName,
        type: element.getAttribute('type') || (children.length > 0 ? 'complexType' : 'xs:string'),
        children: children.length > 0 ? children : undefined
      };
    }

    // Find the root 'element' tag of the schema
    const rootElement = xmlDoc.querySelector("element, xs\\:element, xsd\\:element");
    if (!rootElement) {
      throw new Error("No root <element> found in XSD. The schema must define a root element.");
    }

    return processNode(rootElement, 0);
  } catch(e) {
    console.error("Error parsing XSD for node structure:", e);
    // Return null to allow the caller to handle the error gracefully
    return null;
  }
}
