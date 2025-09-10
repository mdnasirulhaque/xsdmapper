"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { XsdNode } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import { useRef } from 'react';

function xmlToXsdNode(element: Element, prefix: string, index: number): XsdNode {
  const nodeName = element.localName;
  const children: XsdNode[] = [];
  
  if (element.children.length > 0) {
      const elementChildren = Array.from(element.children);
      const childNames = new Map<string, number>();

      elementChildren.forEach(child => {
        const childName = child.localName;
        const count = childNames.get(childName) || 0;
        childNames.set(childName, count + 1);
      });
      
      const uniqueChildren = new Map<string, Element>();
      elementChildren.forEach(child => {
        if (!uniqueChildren.has(child.localName)) {
            uniqueChildren.set(child.localName, child);
        }
      });

      Array.from(uniqueChildren.values()).forEach((child, i) => {
        children.push(xmlToXsdNode(child, `${prefix}-${nodeName}`, i));
      });
  }
  
  const dataType = children.length > 0 ? 'complexType' : 'xs:string';

  return {
    id: `${prefix}-${nodeName}-${index}`,
    name: nodeName,
    type: dataType,
    children: children.length > 0 ? children : undefined,
  };
}

export default function Welcome() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(content, "application/xml");
          
          if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            throw new Error("Failed to parse XML.");
          }

          const rootElement = xmlDoc.documentElement;
          const sourceSchema = xmlToXsdNode(rootElement, 'source', 0);
          
          const schemaString = encodeURIComponent(JSON.stringify(sourceSchema));
          router.push(`/mapper?sourceSchema=${schemaString}`);

        } catch (error) {
          console.error("Error processing XML file:", error);
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Could not process the XML file. Please ensure it is well-formed.",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to XSD Mapper</CardTitle>
          <CardDescription>Start by uploading your source XML file to generate a schema.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            We'll analyze your XML and create a source schema for you to begin mapping.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".xml"
          />
          <Button onClick={handleClick} size="lg" className="w-full">
            <FileUp className="mr-2 h-5 w-5" />
            Upload Source XML
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
