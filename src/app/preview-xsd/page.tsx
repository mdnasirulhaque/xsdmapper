"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wand2, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { postApi } from '@/lib/handlers/api-handlers';

const CodePreview = ({ title, content, language, isLoading = false }: { title: string; content: string | null; language: string; isLoading?: boolean }) => (
    <Card className="flex-1 flex flex-col">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
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
    
    const generateXsd = async (xml: string): Promise<{ xsd: string }> => {
        // This function now calls our internal Next.js API route
        return postApi('/api/generate-xsd', { xml });
    };

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
            title: "Generating Schemas",
            description: "Contacting backend to generate your XML schemas. This may take a moment...",
        });

        try {
            const [inputResult, responseResult] = await Promise.all([
                generateXsd(inputXml),
                generateXsd(responseXml)
            ]);
            
            setInputXsd(inputResult.xsd);
            setResponseXsd(responseResult.xsd);

            toast({
                title: "Schemas Generated",
                description: "Successfully generated XSDs for both files.",
            });
        } catch (error) {
            console.error("Error generating XSDs", error);
            toast({
                variant: 'destructive',
                title: "Generation Failed",
                description: "The backend failed to generate the schemas. Please check the console and try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }, [inputXml, responseXml, toast]);

    const handleProceed = () => {
        // This is a temporary placeholder. In a real app, we would parse the XSD
        // strings into the `XsdNode` JSON structure before passing them.
        const sourceSchema = { id: 'source-root', name: 'GeneratedSource', type: 'complexType', children: [] };
        const targetSchema = { id: 'target-root', name: 'GeneratedTarget', type: 'complexType', children: [] };

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
            <div className="flex flex-col flex-1 p-4 sm:p-6 md:p-8 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Preview Generated XSDs</CardTitle>
                        <CardDescription>
                            Click the button below to generate XSD schemas from your uploaded XML files.
                            Review the generated schemas before proceeding to the next step.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                         <Button onClick={handleGenerateXsds} size="lg" disabled={isLoading || (!!inputXsd && !!responseXsd)}>
                            {isLoading ? <Loader className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                            {isLoading ? 'Generating...' : (!!inputXsd && !!responseXsd ? 'Generated' : 'Generate XSDs')}
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
