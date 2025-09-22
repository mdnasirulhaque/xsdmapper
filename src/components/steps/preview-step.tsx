
"use client";

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Wand2, Loader, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { parseXsdToXsdNode } from '@/lib/xsd-parser';
import CodeBlock from '../code-block';
import FilePreviewDialog from '../file-preview-dialog';
import { prettyPrintXml } from '@/lib/formatter';

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

interface CodePreviewProps {
    title: string;
    content: string | null;
    language: 'xml' | 'json' | 'yaml';
    isLoading?: boolean;
    onPreviewClick?: () => void;
}

const CodePreview = ({ title, content, language, isLoading = false, onPreviewClick }: CodePreviewProps) => {
    const formattedContent = content && language === 'xml' ? prettyPrintXml(content) : content;
    const snippet = formattedContent ? formattedContent.split('\n').slice(0, 7).join('\n') : 'No content provided.';
    const canShowMore = content && content.split('\n').length > 7;

    return (
        <Card className="flex-1 flex flex-col min-w-[300px]">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div className="relative flex-1 p-4 text-xs rounded-md border bg-muted/50 overflow-auto">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                            <Loader className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    <CodeBlock code={isLoading ? '' : snippet} language={language} />
                </div>
                {canShowMore && onPreviewClick && (
                    <Button variant="secondary" className="mt-2" onClick={onPreviewClick}>
                        <Eye className="mr-2 h-4 w-4" /> Show full preview
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};


export default function PreviewStep() {
    const router = useRouter();
    const { toast } = useToast();
    const { 
        inputXml, 
        responseXml, 
        inputXsd, 
        responseXsd, 
        setState, 
        sourceSchemas, 
        targetSchemas, 
        lastVisitedStep,
        isRequestMapperSelected,
        isResponseMapperSelected,
    } = useAppContext();

    const [isGenerating, setIsGenerating] = useState(false);
    const [previewing, setPreviewing] = useState<{ content: string; title: string; language: 'xml' | 'yaml' | 'json' } | null>(null);

    const showInputXsdFlow = !isRequestMapperSelected || isResponseMapperSelected;
    const showResponseXsdFlow = !isResponseMapperSelected || isRequestMapperSelected;

    const handleGenerateXsds = useCallback(async () => {
        setIsGenerating(true);
        toast({
            title: "Loading Schemas",
            description: "Loading mock schemas for demonstration...",
        });

        // Simulate a network delay
        setTimeout(() => {
            try {
                const newState: Partial<ReturnType<typeof useAppContext>> = {};

                if (showInputXsdFlow) {
                    const parsedSourceSchema = parseXsdToXsdNode(mockInputXsdString, 'source');
                     if (!parsedSourceSchema) throw new Error("Could not parse the mock Input XSD.");
                    newState.inputXsd = mockInputXsdString;
                    newState.sourceSchemas = { ...sourceSchemas, set1: parsedSourceSchema };
                }

                if (showResponseXsdFlow) {
                    const parsedTargetSchema = parseXsdToXsdNode(mockResponseXsdString, 'target');
                    if (!parsedTargetSchema) throw new Error("Could not parse the mock Response XSD.");
                    newState.responseXsd = mockResponseXsdString;
                    newState.targetSchemas = { ...targetSchemas, set1: parsedTargetSchema };
                }

                setState(newState);
                
                toast({
                    variant: 'success',
                    title: "Schemas Loaded",
                    description: "Successfully loaded mock XSDs.",
                });

            } catch(e: any) {
                 toast({
                    variant: 'destructive',
                    title: "Schema Parsing Failed",
                    description: e.message || "An unknown error occurred.",
                });
            } finally {
                setIsGenerating(false);
            }
        }, 1000);
    }, [toast, setState, sourceSchemas, targetSchemas, showInputXsdFlow, showResponseXsdFlow]);

    const handleProceed = () => {
        let isReady = true;
        if (showInputXsdFlow && !sourceSchemas.set1) isReady = false;
        if (showResponseXsdFlow && !targetSchemas.set1) isReady = false;
        
        if (!isReady) {
             toast({
                variant: 'destructive',
                title: "XSDs not available",
                description: "Cannot proceed without loaded XSD schemas.",
            });
            return;
        }

        setState({ lastVisitedStep: '/new/preview-xsd' });
        router.push(`/new/swagger`);
    };
    
    const openPreview = (content: string | null, title: string, language: 'xml' | 'json' | 'yaml') => {
        if (content) {
            setPreviewing({ content, title, language });
        }
    };

    const handleBack = () => {
        router.push(lastVisitedStep || '/new/upload');
    }

    const isLoadButtonDisabled = (isGenerating) || (showInputXsdFlow && !!inputXsd) || (showResponseXsdFlow && !!responseXsd);
    
    let loadButtonText = 'Load Mock XSDs';
    if (isGenerating) {
        loadButtonText = 'Loading...';
    } else if (isLoadButtonDisabled) {
        loadButtonText = 'Loaded';
    }

    const isProceedDisabled = (showInputXsdFlow && !inputXsd) || (showResponseXsdFlow && !responseXsd);

    return (
        <div className="flex-1 flex items-center justify-center">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle>Preview XSDs</CardTitle>
                    <CardDescription>
                        Click the button below to load mock XSD schemas.
                        Review the schemas before proceeding to the next step.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                     <Button onClick={handleGenerateXsds} size="lg" disabled={isLoadButtonDisabled}>
                        {isGenerating ? <Loader className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                        {loadButtonText}
                    </Button>

                    {showInputXsdFlow && (
                        <div className="flex flex-col lg:flex-row gap-6">
                           <CodePreview 
                                title="Input XML" 
                                content={inputXml} 
                                language="xml" 
                                onPreviewClick={() => openPreview(inputXml, 'Input XML Preview', 'xml')}
                            />
                           <CodePreview 
                                title="Generated Input XSD" 
                                content={inputXsd} 
                                language="xml" 
                                isLoading={isGenerating && !inputXsd}
                                onPreviewClick={() => openPreview(inputXsd, 'Generated Input XSD Preview', 'xml')}
                            />
                        </div>
                    )}

                    {showResponseXsdFlow && (
                        <div className="flex flex-col lg:flex-row gap-6">
                           <CodePreview 
                                title="Response XML" 
                                content={responseXml} 
                                language="xml"
                                onPreviewClick={() => openPreview(responseXml, 'Response XML Preview', 'xml')}
                            />
                           <CodePreview 
                                title="Generated Response XSD" 
                                content={responseXsd} 
                                language="xml" 
                                isLoading={isGenerating && !responseXsd} 
                                onPreviewClick={() => openPreview(responseXsd, 'Generated Response XSD Preview', 'xml')}
                            />
                        </div>
                    )}

                     <div className="flex items-center justify-between border-t pt-6">
                        <Button variant="outline" onClick={handleBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={handleProceed} disabled={isProceedDisabled}>
                            Next: Configure API <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {previewing && (
                 <FilePreviewDialog
                    isOpen={!!previewing}
                    onOpenChange={() => setPreviewing(null)}
                    content={previewing.content}
                    title={previewing.title}
                    language={previewing.language}
                />
            )}
        </div>
    );
}
