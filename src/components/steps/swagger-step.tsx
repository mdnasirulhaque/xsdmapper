
"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { XsdNode } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, ArrowRight, CheckCircle, Eye, ArrowLeft } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import FilePreviewDialog from '@/components/file-preview-dialog';
import { useAppContext } from '@/context/AppContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type EndpointInfo = {
    path: string;
    methods: string[];
};

const parseSwaggerForEndpoints = (yamlContent: string): EndpointInfo[] => {
    try {
        const lines = yamlContent.split('\n');
        const pathsIndex = lines.findIndex(line => line.trim() === 'paths:');
        if (pathsIndex === -1) return [];

        const endpoints: EndpointInfo[] = [];
        let currentPath = '';
        let currentMethods: string[] = [];

        for (let i = pathsIndex + 1; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Stop if we hit the next top-level key that is not indented
            if (line.match(/^\S/)) {
                 if (currentPath) {
                    endpoints.push({ path: currentPath, methods: currentMethods });
                    currentPath = '';
                    currentMethods = [];
                }
                // Break if we're clearly outside the paths block
                 if (!line.startsWith('  ')) {
                    const nextTopLevel = lines.slice(i).find(l => l.match(/^\S/));
                    if (nextTopLevel && !nextTopLevel.trim().startsWith('/')) break;
                }
            }
            
            if (trimmedLine.startsWith('/') && trimmedLine.endsWith(':')) {
                if (currentPath) {
                    endpoints.push({ path: currentPath, methods: currentMethods });
                }
                currentPath = trimmedLine.slice(0, -1);
                currentMethods = [];
            } else if (currentPath && /^(get|post|put|delete|patch|options|head):$/i.test(trimmedLine)) {
                currentMethods.push(trimmedLine.slice(0, -1).toUpperCase());
            }
        }
        if (currentPath) {
            endpoints.push({ path: currentPath, methods: currentMethods });
        }
        return endpoints;
    } catch (e) {
        console.error("Failed to parse endpoints from swagger", e);
        return [];
    }
};

const generateSchemaFromEndpoint = (endpoint: string): XsdNode => {
     // This is a very simplified parser for demonstration.
    return {
        id: 'target-swagger-root',
        name: 'SwaggerApi',
        type: 'complexType',
        children: [
            { id: `target-swagger-${endpoint}`, name: endpoint, type: 'complexType', children: [
                { id: `target-swagger-field1-${endpoint}`, name: 'id', type: 'string' },
                { id: `target-swagger-field2-${endpoint}`, name: 'name', type: 'string' },
                { id: `target-swagger-field3-${endpoint}`, name: 'value', type: 'number' },
            ]}
        ]
    };
}

const allRestMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];


export default function SwaggerStep() {
    const router = useRouter();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { swaggerFile, endpoint, method, setState, targetSchemas, mappings } = useAppContext();
    
    const [fileName, setFileName] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [availableEndpoints, setAvailableEndpoints] = useState<EndpointInfo[]>([]);
    const [isCustomEndpoint, setIsCustomEndpoint] = useState(false);

    useEffect(() => {
        if (swaggerFile) {
            const endpoints = parseSwaggerForEndpoints(swaggerFile);
            setAvailableEndpoints(endpoints);
            // If the current endpoint is no longer in the list (e.g. new file upload), check if it's custom
            if (endpoint && !endpoints.some(e => e.path === endpoint)) {
                setIsCustomEndpoint(true);
            }
        }
    }, [swaggerFile, endpoint]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    // When a new swagger file is uploaded, reset relevant subsequent state
                    setState({ 
                        swaggerFile: content, 
                        endpoint: null, 
                        method: null, 
                        targetSchemas: { ...targetSchemas, set2: null, set3: null },
                        mappings: { ...mappings, set2: [], set3: [] }
                    });
                    toast({
                        variant: "success",
                        title: "Upload Successful",
                        description: `${file.name} has been processed.`,
                    })
                } catch (error) {
                    console.error("Error processing YAML/JSON file:", error);
                    setState({ swaggerFile: null, endpoint: null, method: null });
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

    const handleEndpointChange = (value: string) => {
        if (value === 'custom') {
            setIsCustomEndpoint(true);
            setState({ endpoint: '', method: null });
        } else {
            setIsCustomEndpoint(false);
            const schema = generateSchemaFromEndpoint(value);
            const endpointInfo = availableEndpoints.find(e => e.path === value);
            // Auto-select the first method found for the endpoint, but don't filter the dropdown.
            const newMethod = endpointInfo && endpointInfo.methods.length > 0 ? endpointInfo.methods[0] : null;

            // When the endpoint changes, clear the mappings for the affected sets
            setState({ 
                endpoint: value, 
                targetSchemas: { ...targetSchemas, set2: schema, set3: schema }, 
                method: newMethod,
                mappings: { ...mappings, set2: [], set3: [] }
            });
        }
    }

    const handleCustomEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const schema = generateSchemaFromEndpoint(value);
        setState({ 
            endpoint: value, 
            targetSchemas: { ...targetSchemas, set2: schema, set3: schema },
            mappings: { ...mappings, set2: [], set3: [] }
        });
    }

    const handleMethodChange = (value: string) => {
        setState({ method: value });
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleProceed = () => {
        if (!swaggerFile || !endpoint || !method) {
             toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide a swagger file, select an endpoint, and choose a method.',
            });
            return;
        }
        router.push(`/new/preview-swagger-xsd`);
    }

    const fileExtension = fileName?.split('.').pop()?.toLowerCase();
    const language = fileExtension === 'yaml' || fileExtension === 'yml' ? 'yaml' : 'json';
    
    const isNextDisabled = !swaggerFile || !endpoint || !method;


    return (
        <div className="flex items-center justify-center flex-1">
            <Card className="w-full shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Configure Target API</CardTitle>
                    <CardDescription>Upload a Swagger/OpenAPI file and select the endpoint to define the target structure.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 rounded-lg border p-6">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".yaml,.yml,.json"
                        />
                        <Label className="font-semibold text-lg">1. Swagger File</Label>
                        <p className="text-sm text-muted-foreground">This will be used to generate the target schema.</p>
                        <Button onClick={handleUploadClick} size="lg" className="w-full" variant={swaggerFile ? "secondary" : "default"}>
                            {swaggerFile ? <CheckCircle className="mr-2 h-5 w-5" /> : <FileUp className="mr-2 h-5 w-5" />}
                            {swaggerFile ? (fileName || "Uploaded") : 'Upload File'}
                        </Button>
                         {swaggerFile && (
                            <Button variant="ghost" className="w-full text-sm" onClick={() => setIsPreviewOpen(true)}>
                                <Eye className="mr-2 h-4 w-4" /> Preview File
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 rounded-lg border p-6">
                         <Label className="font-semibold text-lg">2. Endpoint</Label>
                         <Select onValueChange={handleEndpointChange} value={isCustomEndpoint ? 'custom' : endpoint || ''} disabled={!swaggerFile}>
                            <SelectTrigger className="w-full h-12">
                                <SelectValue placeholder="Select an endpoint..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableEndpoints.map(ep => (
                                    <SelectItem key={ep.path} value={ep.path}>{ep.path}</SelectItem>
                                ))}
                                <SelectItem value="custom">Add Custom Endpoint</SelectItem>
                            </SelectContent>
                        </Select>
                        {isCustomEndpoint && (
                            <Input 
                                placeholder="/your/custom/endpoint" 
                                value={endpoint || ''}
                                onChange={handleCustomEndpointChange}
                                className="h-12"
                            />
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-4 rounded-lg border p-6">
                        <Label className="font-semibold text-lg">3. Method</Label>
                         <Select onValueChange={handleMethodChange} value={method || ''} disabled={!endpoint}>
                            <SelectTrigger className="w-full h-12">
                                <SelectValue placeholder="Select a method..." />
                            </SelectTrigger>
                            <SelectContent>
                                {allRestMethods.map(m => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>


                    <div className="flex items-center justify-between border-t pt-6">
                        <Button variant="outline" onClick={() => router.push('/new/preview-xsd')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={handleProceed} disabled={isNextDisabled}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
             {swaggerFile && (
                <FilePreviewDialog
                    isOpen={isPreviewOpen}
                    onOpenChange={setIsPreviewOpen}
                    content={swaggerFile}
                    title={fileName || 'File Preview'}
                    language={language === 'yaml' ? 'yaml' : 'json'}
                />
            )}
        </div>
    );
}
