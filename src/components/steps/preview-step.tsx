
"use client";

import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Wand2, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { parseXsdToXsdNode } from '@/lib/xsd-parser';
import CodeBlock from '../code-block';

// A mock XSD string for preview purposes.
const mockInputXsdString = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="CustomerOrder">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="OrderID" type="xs:string" />
        <xs:element name="CustomerInfo">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="FirstName" type="xs:string" />
              <xs:element name="LastName" type="xs:string" />
              <xs:element name="EmailAddress" type="xs:string" />
            </xs:sequence>
          </xs:complexType>
        </xs:element>
        <xs:element name="ShippingAddress">
            <xs:complexType>
                <xs:sequence>
                    <xs:element name="Street" type="xs:string" />
                    <xs:element name="City" type="xs:string" />
                    <xs:element name="PostalCode" type="xs:integer" />
                </xs:sequence>
            </xs:complexType>
        </xs:element>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
`;

const mockResponseXsdString = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="SalesInvoice">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="InvoiceNumber" type="xs:string" />
                <xs:element name="BuyerInformation">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="FullName" type="xs:string" />
                            <xs:element name="ContactEmail" type="xs:string" />
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="DeliveryLocation">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="AddressLine1" type="xs:string" />
                            <xs:element name="Town" type="xs:string" />
                            <xs:element name="Postcode" type="xs:string" />
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
            </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>
`;


const CodePreview = ({ title, content, language, isLoading = false }: { title: string; content: string | null; language: string; isLoading?: boolean }) => (
    <Card className="flex-1 flex flex-col min-w-[300px]">
        <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex">
            <ScrollArea className="w-full h-96 rounded-md border bg-muted/50">
                <div className="p-4 text-xs relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                            <Loader className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    {content ? (
                        <CodeBlock code={content} language={language} />
                    ) : (
                        <pre><code>No content provided.</code></pre>
                    )}
                </div>
            </ScrollArea>
        </CardContent>
    </Card>
);

export default function PreviewStep() {
    const router = useRouter();
    const { toast } = useToast();
    const { inputXml, responseXml, inputXsd, responseXsd, setState, sourceSchema, targetSchema } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateXsds = useCallback(async () => {
        if (!inputXml || !responseXml) {
            toast({
                variant: 'destructive',
                title: "Missing XML",
                description: "Please go back and upload both XML files.",
            });
            return;
        }

        setIsLoading(true);
        toast({
            title: "Loading Schemas",
            description: "Loading mock schemas for demonstration...",
        });

        // Simulate a network delay
        setTimeout(() => {
            try {
                const parsedSourceSchema = parseXsdToXsdNode(mockInputXsdString, 'source');
                const parsedTargetSchema = parseXsdToXsdNode(mockResponseXsdString, 'target');

                if (!parsedSourceSchema || !parsedTargetSchema) {
                    throw new Error("Could not parse the mock XSDs.");
                }

                setState({
                    inputXsd: mockInputXsdString,
                    responseXsd: mockResponseXsdString,
                    sourceSchema: parsedSourceSchema,
                    targetSchema: parsedTargetSchema
                });
                
                toast({
                    variant: 'success',
                    title: "Schemas Loaded",
                    description: "Successfully loaded mock XSDs for both files.",
                });

            } catch(e: any) {
                 toast({
                    variant: 'destructive',
                    title: "Schema Parsing Failed",
                    description: e.message || "An unknown error occurred.",
                });
            } finally {
                setIsLoading(false);
            }
        }, 1000);
    }, [inputXml, responseXml, toast, setState]);

    const handleProceed = () => {
        if (!sourceSchema || !targetSchema) {
             toast({
                variant: 'destructive',
                title: "XSDs not available",
                description: "Cannot proceed without loaded XSD schemas.",
            });
            return;
        }
        router.push(`/new/swagger`);
    };

    return (
        <div className="flex-1 flex items-center justify-center">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle>Preview XSDs</CardTitle>
                    <CardDescription>
                        Click the button below to load mock XSD schemas based on your uploaded XML files.
                        Review the schemas before proceeding to the next step.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                     <Button onClick={handleGenerateXsds} size="lg" disabled={isLoading || (!!inputXsd && !!responseXsd)}>
                        {isLoading ? <Loader className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                        {isLoading ? 'Loading...' : (!!inputXsd && !!responseXsd ? 'Loaded' : 'Load Mock XSDs')}
                    </Button>
                    <div className="flex flex-col lg:flex-row gap-6">
                       <CodePreview title="Input XML" content={inputXml} language="xml" />
                       <CodePreview title="Generated Input XSD" content={inputXsd} language="xml" isLoading={isLoading && !inputXsd} />
                    </div>
                    <div className="flex flex-col lg:flex-row gap-6">
                       <CodePreview title="Response XML" content={responseXml} language="xml" />
                       <CodePreview title="Generated Response XSD" content={responseXsd} language="xml" isLoading={isLoading && !responseXsd} />
                    </div>
                     <div className="flex items-center justify-between border-t pt-6">
                        <Button variant="outline" onClick={() => router.push('/new/upload')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={handleProceed} disabled={!inputXsd || !responseXsd}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
