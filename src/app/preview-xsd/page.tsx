
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wand2, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sourceSchema as mockSourceNode, targetSchema as mockTargetNode } from '@/lib/mock-data';

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
    <Card className="flex-1 flex flex-col">
        <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex">
            <ScrollArea className="w-full h-96 rounded-md border bg-muted/50">
                <pre className="p-4 text-xs relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Loader className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    <code>{content || `No content provided.`}</code>
                </pre>
            </ScrollArea>
        </CardContent>
    </Card>
);

export default function PreviewXsdPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const [inputXml, setInputXml] = useState<string | null>(null);
    const [responseXml, setResponseXml] = useState<string | null>(null);
    const [inputXsd, setInputXsd] = useState<string | null>(null);
    const [responseXsd, setResponseXsd] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const input = searchParams.get('inputXml');
        if (input) setInputXml(decodeURIComponent(input));

        const response = searchParams.get('responseXml');
        if (response) setResponseXml(decodeURIComponent(response));
    }, [searchParams]);
    

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
            setInputXsd(mockInputXsdString);
            setResponseXsd(mockResponseXsdString);
            setIsLoading(false);
            toast({
                variant: 'success',
                title: "Schemas Loaded",
                description: "Successfully loaded mock XSDs for both files.",
            });
        }, 1000);
    }, [inputXml, responseXml, toast]);

    const handleProceed = () => {
        if (!inputXsd || !responseXsd) {
             toast({
                variant: 'destructive',
                title: "XSDs not available",
                description: "Cannot proceed without loaded XSD schemas.",
            });
            return;
        }
        
        // In a real app, you'd parse, but here we can use the pre-parsed mock nodes
        const sourceSchema = mockSourceNode;
        const targetSchema = mockTargetNode;

        if(!sourceSchema || !targetSchema) {
            toast({
                variant: 'destructive',
                title: "Schema Parsing Failed",
                description: "Could not parse the generated XSDs. Check the console for errors.",
            });
            return;
        }

        const queryParams = new URLSearchParams();
        queryParams.set('sourceSchema', encodeURIComponent(JSON.stringify(sourceSchema)));
        queryParams.set('targetSchema', encodeURIComponent(JSON.stringify(targetSchema)));
        // We'll also pass the raw XSDs for potential use/display
        if(inputXsd) queryParams.set('sourceXsd', encodeURIComponent(inputXsd));
        if(responseXsd) queryParams.set('targetXsd', encodeURIComponent(responseXsd));

        router.push(`/swagger?${queryParams.toString()}`);
    };


    return (
        <AppLayout currentStep={2}>
            <div className="flex flex-col flex-1 p-4 sm:p-6 md:p-8 gap-6 overflow-auto">
                <Card>
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                           <CodePreview title="Input XML" content={inputXml} language="xml" />
                           <CodePreview title="Generated Input XSD" content={inputXsd} language="xml" isLoading={isLoading && !inputXsd} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                           <CodePreview title="Response XML" content={responseXml} language="xml" />
                           <CodePreview title="Generated Response XSD" content={responseXsd} language="xml" isLoading={isLoading && !responseXsd} />
                        </div>
                         <Button onClick={handleProceed} size="lg" className="w-full" disabled={!inputXsd || !responseXsd}>
                            Proceed to Next Step <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
