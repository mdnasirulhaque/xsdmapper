"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { XsdNode } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, ArrowRight, CheckCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import AppLayout from '@/components/layout';

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
    const [targetSchema, setTargetSchema] = useState<XsdNode | null>(null);
    const [swaggerSchema, setSwaggerSchema] = useState<XsdNode | null>(null);

    useEffect(() => {
        const sourceSchemaParam = searchParams.get('sourceSchema');
        if (sourceSchemaParam) {
            setSourceSchema(JSON.parse(decodeURIComponent(sourceSchemaParam)));
        }
        const targetSchemaParam = searchParams.get('targetSchema');
        if(targetSchemaParam) {
            setTargetSchema(JSON.parse(decodeURIComponent(targetSchemaParam)));
        }
    }, [searchParams]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const schema = parseSwaggerToXsdNode(content);
                    if(!schema) {
                         throw new Error("Could not derive a schema from the file.");
                    }
                    setSwaggerSchema(schema);
                    toast({
                        title: "Upload Successful",
                        description: `${file.name} has been processed.`,
                    })
                } catch (error) {
                    console.error("Error processing YAML/JSON file:", error);
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
        <AppLayout currentStep={2}>
            <div className="flex items-center justify-center flex-1 bg-background">
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
                        </div>

                        <Button onClick={handleProceed} size="lg" className="w-full" disabled={!swaggerSchema}>
                            Proceed to Mapper <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
