"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { XsdNode } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, ArrowRight, CheckCircle } from 'lucide-react';
import { useRef, useState } from 'react';

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

const FileUploadSection = ({ title, description, onFileUpload, uploadComplete, prefix }: {
    title: string;
    description: string;
    onFileUpload: (schema: XsdNode, prefix: string) => void;
    uploadComplete: boolean;
    prefix: 'source' | 'target';
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                    const schema = xmlToXsdNode(rootElement, prefix, 0);
                    onFileUpload(schema, prefix);
                    toast({
                        title: "Upload Successful",
                        description: `${file.name} has been processed.`,
                    })

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
        <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".xml"
            />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground text-center">{description}</p>
            <Button onClick={handleClick} size="lg" className="w-full" variant={uploadComplete ? "secondary" : "default"}>
                {uploadComplete ? <CheckCircle className="mr-2 h-5 w-5" /> : <FileUp className="mr-2 h-5 w-5" />}
                {uploadComplete ? "Uploaded" : `Upload ${title}`}
            </Button>
        </div>
    )
}

export default function Welcome() {
  const router = useRouter();
  const [sourceSchema, setSourceSchema] = useState<XsdNode | null>(null);
  const [targetSchema, setTargetSchema] = useState<XsdNode | null>(null);

  const handleFileUpload = (schema: XsdNode, prefix: string) => {
    if (prefix === 'source') {
        setSourceSchema(schema);
    } else {
        setTargetSchema(schema);
    }
  }

  const handleProceed = () => {
    const sourceSchemaString = encodeURIComponent(JSON.stringify(sourceSchema));
    const targetSchemaString = encodeURIComponent(JSON.stringify(targetSchema));
    router.push(`/swagger?sourceSchema=${sourceSchemaString}&targetSchema=${targetSchemaString}`);
  }
  

  return (
    <div className="flex items-center justify-center flex-1 bg-background">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Your XSLT Mapping</CardTitle>
          <CardDescription>Start by uploading your input and response XML files to generate schemas.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploadSection 
                    title="Input XML"
                    description="This will become the source schema."
                    onFileUpload={handleFileUpload}
                    uploadComplete={!!sourceSchema}
                    prefix="source"
                />
                 <FileUploadSection 
                    title="Response XML"
                    description="This will become the target schema (optional)."
                    onFileUpload={handleFileUpload}
                    uploadComplete={!!targetSchema}
                    prefix="target"
                />
            </div>

            <Button onClick={handleProceed} size="lg" className="w-full" disabled={!sourceSchema}>
                Proceed to Next Step <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
