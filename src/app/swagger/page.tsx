
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { XsdNode } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, ArrowRight, CheckCircle, Eye } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import AppLayout from '@/components/layout';
import FilePreviewDialog from '@/components/file-preview-dialog';
import { parseXsdToXsdNode } from '@/lib/xsd-parser';


// Basic YAML parsing to find paths and schemas.
// In a real app, you'd use a robust library like 'js-yaml'.
const parseSwaggerToXsdNode = (yamlContent: string): XsdNode | null => {
    // This is a very simplified parser for demonstration.
    // It looks for a 'paths' section and extracts a schema from the first post operation.
    try {
        const lines = yamlContent.split('\n');
        const pathsIndex = lines.findIndex(line => line.trim().startsWith('paths:'));
        if (pathsIndex === -1) throw new Error("No 'paths' found in Swagger/OpenAPI file.");

        // A simple way to get a schema-like object. We'll simulate a schema.
        return {
            id: 'target-swagger-root',
            name: 'Swagger API',
            type: 'complexType',
            children: [
                { id: 'target-swagger-endpoint1', name: '/example-endpoint', type: 'complexType', children: [
                    { id: 'target-swagger-field1', name: 'id', type: 'string' },
                    { id: 'target-swagger-field2', name: 'name', type: 'string' },
                    { id: 'target-swagger-field3', name: 'value', type: 'number' },
                ]}
            ]
        };
    } catch (e) {
        console.error("Failed to parse swagger file", e);
        return null;
    }
}


export default function SwaggerUploadPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [sourceSchema, setSourceSchema] = useState<XsdNode | null>(null);
    const [sourceXsd, setSourceXsd] = useState<string | null>(null);
    const [targetXsd, setTargetXsd] = useState<string | null>(null);

    const [swaggerSchema, setSwaggerSchema] = useState<XsdNode | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        // The schemas are now passed as raw XSD strings
        const sourceXsdParam = searchParams.get('sourceXsd');
        if (sourceXsdParam) {
            const decodedSourceXsd = decodeURIComponent(sourceXsdParam);
            setSourceXsd(decodedSourceXsd);
            const parsedSchema = parseXsdToXsdNode(decodedSourceXsd, 'source');
            setSourceSchema(parsedSchema);
        }
        
        const targetXsdParam = searchParams.get('targetXsd');
        if(targetXsdParam) {
           const decodedTargetXsd = decodeURIComponent(targetXsdParam);
           setTargetXsd(decodedTargetXsd);
           // We don't parse the target XSD to a node here, as it will be replaced by the swagger schema
        }

    }, [searchParams]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    setFileContent(content);
                    const schema = parseSwaggerToXsdNode(content);
                    if(!schema) {
                         throw new Error("Could not derive a schema from the file.");
                    }
                    setSwaggerSchema(schema);
                    toast({
                        variant: "success",
                        title: "Upload Successful",
                        description: `${file.name} has been processed.`,
                    })
                } catch (error) {
                    console.error("Error processing YAML/JSON file:", error);
                    setFileContent(null);
                    setFileName(null);
                    toast({
                        variant: "destructive",
                        title: "Upload Failed",
                        description: `Could not process ${file.name}.`,
                    });
                }
            };
            reader.readAsText(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleProceed = () => {
        const sourceSchemaString = encodeURIComponent(JSON.stringify(sourceSchema));
        // Now the target schema is the one from swagger
        const targetSchemaString = encodeURIComponent(JSON.stringify(swaggerSchema));
        router.push(`/mapper?sourceSchema=${sourceSchemaString}&targetSchema=${targetSchemaString}`);
    }

    return (
        <AppLayout currentStep={3}>
            <div className="flex items-center justify-center flex-1 bg-background p-4 sm:p-6 md:p-8">
                <Card className="w-full max-w-2xl shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Upload Swagger/OpenAPI File</CardTitle>
                        <CardDescription>Upload a YAML or JSON file to define the target structure.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".yaml,.yml,.json"
                            />
                            <h3 className="font-semibold">Swagger/OpenAPI File</h3>
                            <p className="text-sm text-muted-foreground text-center">This will be used as the target schema.</p>
                            <Button onClick={handleClick} size="lg" className="w-full" variant={swaggerSchema ? "secondary" : "default"}>
                                {swaggerSchema ? <CheckCircle className="mr-2 h-5 w-5" /> : <FileUp className="mr-2 h-5 w-5" />}
                                {swaggerSchema ? "Uploaded" : 'Upload File'}
                            </Button>
                             {fileContent && (
                                <Button variant="ghost" className="w-full text-sm" onClick={() => setIsPreviewOpen(true)}>
                                    <Eye className="mr-2 h-4 w-4" /> Preview File
                                </Button>
                            )}
                        </div>

                        <Button onClick={handleProceed} size="lg" className="w-full" disabled={!swaggerSchema || !sourceSchema}>
                            Proceed to Mapper <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
                 {fileContent && (
                    <FilePreviewDialog
                        isOpen={isPreviewOpen}
                        onOpenChange={setIsPreviewOpen}
                        content={fileContent}
                        title={fileName || 'File Preview'}
                    />
                )}
            </div>
        </AppLayout>
    );
}
