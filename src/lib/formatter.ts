
"use client";

export const prettyPrintXml = (xmlString: string): string => {
    try {
        if (typeof window === 'undefined') return xmlString;

        const parser = new window.DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");

        // Check for parsing errors which can occur with malformed XML
        const a = xmlDoc.getElementsByTagName("parsererror");
        if (a.length > 0) {
            console.warn("XML formatting failed due to parsing error. Returning original string.");
            return xmlString; // Return original string if it's not valid XML
        }

        const xsltString = `
            <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
                <xsl:output method="xml" indent="yes" omit-xml-declaration="yes"/>
                <xsl:strip-space elements="*"/>
                <xsl:template match="node()|@*">
                    <xsl:copy>
                        <xsl:apply-templates select="node()|@*"/>
                    </xsl:copy>
                </xsl:template>
            </xsl:stylesheet>
        `;

        const xsltDoc = parser.parseFromString(xsltString, "application/xml");
        const xsltProcessor = new window.XSLTProcessor();
        xsltProcessor.importStylesheet(xsltDoc);

        const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
        if (resultDoc) {
            const serializer = new window.XMLSerializer();
            // Handle browser differences in serialization
            const serializedXml = serializer.serializeToString(resultDoc);
            // Some browsers (like Firefox) might add a namespace to the root element. We can clean it up.
            return serializedXml.replace(/xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, '').trim();
        }

        return xmlString;
    } catch (error) {
        console.error("Error during XML pretty printing:", error);
        return xmlString; // Fallback to original string on error
    }
};
