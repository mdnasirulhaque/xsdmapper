
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, FileText, FileJson, Link as LinkIcon } from 'lucide-react';
import FilePreviewDialog from '../file-preview-dialog';
import { generateXsltForSet } from '@/lib/xslt-generator';

const setConfig = {
  set1: { name: 'Request' },
  set2: { name: 'Response' },
  set3: { name: 'Error' },
};


export default function CreateRequestStep() {
    const router = useRouter();
    const { 
        inputXml, 
        responseXml, 
        inputXsd, 
        responseXsd,
        swaggerFile,
        sourceSchemas,
        targetSchemas,
        mappings,
    } = useAppContext();
    const [previewing, setPreviewing] = useState<{ content: string; title: string; language: 'xml' | 'yaml' | 'json' } | null>(null);

    const openPreview = (content: string | null, title: string, language: 'xml' | 'yaml' | 'json' = 'xml') => {
        if (content) {
            setPreviewing({ content, title, language });
        }
    };
    
    const swaggerFileLanguage = swaggerFile?.trim().startsWith('{') ? 'json' : 'yaml';

    const generatedXslt = {
        set1: generateXsltForSet(mappings.set1, sourceSchemas.set1, targetSchemas.set1),
        set2: generateXsltForSet(mappings.set2, sourceSchemas.set2, targetSchemas.set2),
        set3: generateXsltForSet(mappings.set3, sourceSchemas.set3, targetSchemas.set3),
    };

    const getMappingSummary = (set: 'set1' | 'set2' | 'set3'): string => {
        const setMappings = mappings[set];
        if (setMappings.length === 0) return 'No mappings for this set.';

        return setMappings.map(m => {
            const source = m.sourceId.split('-').slice(1).join('-');
            const target = m.targetId.split('-').slice(1).join('-');
            const transform = m.transformation?.type !== 'NONE' ? ` [${m.transformation?.type}]` : '';
            return `${source} -> ${target}${transform}`;
        }).join('\n');
    }

    const FileButton = ({ title, content, language, icon: Icon }: { title: string, content: string | null, language: 'xml' | 'yaml' | 'json', icon: React.ElementType }) => (
         <Button 
            variant="outline" 
            className="w-full justify-start h-12"
            onClick={() => openPreview(content, title, language)}
            disabled={!content}
        >
            <Icon className="mr-3 h-5 w-5 text-muted-foreground" />
            {title}
        </Button>
    )

    return (
        <div className="flex-1 flex flex-col gap-4">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle>Create Request</CardTitle>
                    <CardDescription>
                        Review all your uploaded files, generated schemas, and mappings one last time before finishing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-lg border-b pb-2">Inputs</h3>
                        <FileButton title="Input XML" content={inputXml} language="xml" icon={FileText} />
                        <FileButton title="Response XML" content={responseXml} language="xml" icon={FileText} />
                        <FileButton title="Swagger/OpenAPI" content={swaggerFile} language={swaggerFileLanguage} icon={FileJson} />
                    </div>
                     <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-lg border-b pb-2">Generated Schemas</h3>
                        <FileButton title="Input XSD" content={inputXsd} language="xml" icon={FileText} />
                        <FileButton title="Response XSD" content={responseXsd} language="xml" icon={FileText} />
                        {/* A placeholder for swagger XSD for now */}
                        <FileButton title="Swagger XSD" content={"<!-- Mock Swagger XSD -->"} language="xml" icon={FileText} />
                    </div>
                    <div className="flex flex-col gap-4">
                         <h3 className="font-semibold text-lg border-b pb-2">Mappings & Transforms</h3>
                         
                         <div className="flex flex-col gap-3 p-3 rounded-md border bg-muted/20">
                            <h4 className="font-semibold">Request</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <FileButton title="Mapping" content={getMappingSummary('set1')} language="json" icon={LinkIcon} />
                                <FileButton title="XSLT" content={generatedXslt.set1} language="xml" icon={FileText} />
                            </div>
                         </div>

                         <div className="flex flex-col gap-3 p-3 rounded-md border bg-muted/20">
                            <h4 className="font-semibold">Response</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <FileButton title="Mapping" content={getMappingSummary('set2')} language="json" icon={LinkIcon} />
                                <FileButton title="XSLT" content={generatedXslt.set2} language="xml" icon={FileText} />
                            </div>
                         </div>

                         <div className="flex flex-col gap-3 p-3 rounded-md border bg-muted/20">
                            <h4 className="font-semibold">Error</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <FileButton title="Mapping" content={getMappingSummary('set3')} language="json" icon={LinkIcon} />
                                <FileButton title="XSLT" content={generatedXslt.set3} language="xml" icon={FileText} />
                            </div>
                         </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex items-center justify-between bg-card rounded-lg p-3 border">
                <Button variant="outline" onClick={() => router.push('/new/preview-xslt')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to XSLT Preview
                </Button>
                <Button onClick={() => router.push('/new/finish')}>
                    Finish & Complete <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
            </div>
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
