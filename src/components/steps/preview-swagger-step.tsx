
"use client"

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Eye, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import CodeBlock from '../code-block';
import FilePreviewDialog from '../file-preview-dialog';
import { prettyPrintXml } from '@/lib/formatter';


interface CodePreviewProps {
    title: string;
    content: string | null;
    language: 'xml' | 'json' | 'yaml';
    isLoading?: boolean;
    onPreviewClick: () => void;
}

const CodePreview = ({ title, content, language, isLoading = false, onPreviewClick }: CodePreviewProps) => {
    const formattedContent = content && language === 'xml' ? prettyPrintXml(content) : content;
    const snippet = formattedContent ? formattedContent.split('\n').slice(0, 7).join('\n') : 'No content available.';
    const canShowMore = content && content.split('\n').length > 7;

    return (
        <Card className="flex-1 flex flex-col min-w-[300px]">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div className="relative flex-1 p-4 text-xs rounded-md border bg-muted/50">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                            <Loader className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    <CodeBlock code={isLoading ? '' : snippet} language={language} />
                </div>
                {canShowMore && (
                    <Button variant="secondary" className="mt-2" onClick={onPreviewClick}>
                        <Eye className="mr-2 h-4 w-4" /> Show full preview
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};


export default function PreviewSwaggerStep() {
    const router = useRouter();
    const { swaggerFile, endpoint, method, setIsLoading } = useAppContext();
    const [previewing, setPreviewing] = useState<{ content: string; title: string; language: 'xml' | 'json' | 'yaml' } | null>(null);

    // A placeholder for the generated XSD from swagger for demonstration
    const swaggerXsdPreview = swaggerFile 
        ? `<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <!-- This is a simulated XSD generated from the Swagger/OpenAPI file -->
  <xs:element name="SwaggerApi">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="/example-endpoint">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="id" type="xs:string" />
              <xs:element name="name" type="xs:string" />
              <xs:element name="value" type="xs:number" />
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
`
        : 'Upload a Swagger/OpenAPI file in the previous step to see a preview.';
    
    const swaggerFileLanguage = swaggerFile?.trim().startsWith('{') ? 'json' : 'yaml';

    const openPreview = (content: string | null, title: string, language: 'xml' | 'json' | 'yaml') => {
        if (content) {
            setPreviewing({ content, title, language });
        }
    };

    const handleProceed = () => {
        setIsLoading(true);
        router.push('/new/mapper');
    }

    const handleBack = () => {
        setIsLoading(true);
        router.push('/new/swagger');
    }


    return (
        <div className="flex-1 flex flex-col items-center justify-center">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle>Preview Swagger and Generated XSD</CardTitle>
                    <CardDescription>
                        Review the uploaded Swagger/OpenAPI file and the simulated XSD generated from it.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    
                    {endpoint && method && (
                        <div className="flex items-center gap-6 p-4 rounded-lg bg-muted border">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">Method:</span>
                                <span className="inline-flex items-center rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">{method}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <span className="font-semibold">Endpoint:</span>
                                <span className="font-mono text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-md">{endpoint}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6">
                       <CodePreview 
                            title="Uploaded Swagger/OpenAPI" 
                            content={swaggerFile} 
                            language={swaggerFileLanguage}
                            onPreviewClick={() => openPreview(swaggerFile, 'Uploaded Swagger/OpenAPI', swaggerFileLanguage)}
                        />
                       <CodePreview 
                            title="Generated Swagger XSD" 
                            content={swaggerXsdPreview} 
                            language="xml" 
                            onPreviewClick={() => openPreview(swaggerXsdPreview, 'Generated Swagger XSD Preview', 'xml')}
                        />
                    </div>

                    <div className="flex items-center justify-between border-t pt-6">
                         <Button variant="outline" onClick={handleBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to API Config
                        </Button>
                        <Button onClick={handleProceed} disabled={!swaggerFile}>
                            Next: Start Mapping <ArrowRight className="ml-2 h-4 w-4" />
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
