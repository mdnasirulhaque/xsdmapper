
"use client"

import { useState, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, FileText, FileJson, Link as LinkIcon, User, Component, Edit, Save } from 'lucide-react';
import FilePreviewDialog from '../file-preview-dialog';
import { generateXsltForSet } from '@/lib/xslt-generator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';

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
        profileId,
        requestMapperId,
        responseMapperId,
        errorMapperId,
        restFlowAnswers,
        setState,
        isRequestMapperSelected,
        isResponseMapperSelected,
    } = useAppContext();
    const [previewing, setPreviewing] = useState<{ content: string; title: string; language: 'xml' | 'yaml' | 'json' } | null>(null);
    const [isRestFlowEditing, setIsRestFlowEditing] = useState(false);
    
    const restFlowScrollRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef(0);

    useLayoutEffect(() => {
        if (restFlowScrollRef.current) {
            restFlowScrollRef.current.scrollTop = scrollPositionRef.current;
        }
    }, [isRestFlowEditing]);


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

    const FileButton = ({ title, content, language, icon: Icon, tooltipContent }: { title: string, content: string | null, language: 'xml' | 'yaml' | 'json', icon: React.ElementType, tooltipContent?: string }) => {
        const button = (
             <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => openPreview(content, title, language)}
                disabled={!content}
            >
                <Icon className="mr-3 h-5 w-5 text-muted-foreground" />
                {title}
            </Button>
        );

        if (!content && tooltipContent) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {/* The div wrapper is necessary for the tooltip to work on a disabled button */}
                            <div className="w-full">{button}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tooltipContent}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return button;
    }

    const IdentifierField = ({ label, value, onValueChange, placeholder }: { label: string; value: string | null; onValueChange?: (val: string) => void; placeholder?: string }) => (
        <div className="space-y-2">
            <Label className="text-sm font-medium">{label}</Label>
            {onValueChange ? (
                <Input 
                    value={value || ''} 
                    onChange={(e) => onValueChange(e.target.value)} 
                    placeholder={placeholder}
                />
            ) : (
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {value || <span className="text-muted-foreground">Not provided</span>}
                </div>
            )}
        </div>
    );
    
    const handleFinish = () => {
        // Placeholder data for demonstration
        const query = new URLSearchParams({
            orderId: 'ORD123456',
            csiId: 'CSI-98765',
            approverName: 'John Doe',
            eventId: 'EVT-ABC-123',
        }).toString();

        router.push(`/new/finish?${query}`);
    }

    const handleBack = () => {
        router.push('/new/preview-xslt');
    }

    const RestFlowAnswerField = ({ question, isEditing, value, onChange }: { question: string, isEditing: boolean, value: string, onChange: (val: string) => void }) => (
         <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{question}</Label>
            {isEditing ? (
                 <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8" />
            ) : (
                 <div className="flex h-8 w-full items-center rounded-md bg-muted/30 px-3 py-1 text-sm">
                    {value || <span className="text-muted-foreground italic">No answer</span>}
                </div>
            )}
        </div>
    )

    const handleToggleRestFlowEdit = () => {
        if (restFlowScrollRef.current) {
            scrollPositionRef.current = restFlowScrollRef.current.scrollTop;
        }
        setIsRestFlowEditing(!isRestFlowEditing);
    };

    return (
        <div className="flex-1 flex flex-col gap-4">
            <Card className="w-full shadow-lg flex-1 flex flex-col">
                <CardHeader>
                    <CardTitle>Create Request</CardTitle>
                    <CardDescription>
                        Review all your uploaded files, generated schemas, and mappings one last time before finishing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 flex-1">
                    {/* Column 1: Request Identifiers */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b pb-2">
                            <User className="h-5 w-5 text-primary"/>
                            <h3 className="font-semibold text-lg">Request Identifiers</h3>
                        </div>
                        <IdentifierField label="Profile ID" value={profileId} />
                        <IdentifierField 
                            label="Request Mapper ID" 
                            value={requestMapperId} 
                            onValueChange={!requestMapperId ? (val) => setState({ requestMapperId: val }) : undefined}
                            placeholder="Enter Request Mapper ID"
                        />
                         <IdentifierField 
                            label="Response Mapper ID" 
                            value={responseMapperId} 
                            onValueChange={!responseMapperId ? (val) => setState({ responseMapperId: val }) : undefined}
                            placeholder="Enter Response Mapper ID"
                        />
                         <IdentifierField 
                            label="Error Mapper ID" 
                            value={errorMapperId} 
                            onValueChange={!errorMapperId ? (val) => setState({ errorMapperId: val }) : undefined}
                            placeholder="Enter Error Mapper ID"
                        />
                    </div>
                    {/* Column 2: Inputs */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-lg border-b pb-2">Inputs</h3>
                        <FileButton 
                            title="Input XML" 
                            content={inputXml} 
                            language="xml" 
                            icon={FileText} 
                            tooltipContent={isRequestMapperSelected ? "Not required for the selected Request Mapper ID." : "No file uploaded."}
                        />
                        <FileButton 
                            title="Response XML" 
                            content={responseXml} 
                            language="xml" 
                            icon={FileText} 
                            tooltipContent={isResponseMapperSelected ? "Not required for the selected Response Mapper ID." : "No file uploaded."}
                        />
                        <FileButton title="Swagger/OpenAPI" content={swaggerFile} language={swaggerFileLanguage} icon={FileJson} tooltipContent="Not required when Mapper IDs are used." />
                    </div>
                     {/* Column 3: Generated Schemas */}
                     <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-lg border-b pb-2">Generated Schemas</h3>
                        <FileButton 
                            title="Input XSD" 
                            content={inputXsd} 
                            language="xml" 
                            icon={FileText} 
                            tooltipContent={isRequestMapperSelected ? "Not generated for the selected Request Mapper." : "Not generated."}
                        />
                        <FileButton 
                            title="Response XSD" 
                            content={responseXsd} 
                            language="xml" 
                            icon={FileText} 
                            tooltipContent={isResponseMapperSelected ? "Not generated for the selected Response Mapper." : "Not generated."}
                        />
                        <FileButton title="Swagger XSD" content={swaggerFile ? "<!-- Mock Swagger XSD -->" : null} language="xml" icon={FileText} tooltipContent="Not generated when Mapper IDs are used." />
                    </div>
                    {/* Column 4: Mappings & Transforms */}
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
                    {/* Column 5: Rest Flow */}
                    <div className="flex flex-col gap-4">
                         <div className="flex items-center gap-3 border-b pb-2">
                            <Component className="h-5 w-5 text-primary"/>
                            <h3 className="font-semibold text-lg">Rest Flow</h3>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleToggleRestFlowEdit}>
                                {isRestFlowEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div ref={restFlowScrollRef} className="space-y-3 p-2 rounded-md border bg-muted/20 flex-1 overflow-y-auto">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <RestFlowAnswerField
                                    key={`q${i+1}-ans`}
                                    question={`Question ${i + 1}`}
                                    isEditing={isRestFlowEditing}
                                    value={restFlowAnswers[`q${i+1}`]}
                                    onChange={(val) => setState({ restFlowAnswers: { ...restFlowAnswers, [`q${i+1}`]: val }})}
                                />
                            ))}
                            <Separator />
                             <div className="space-y-2 pt-2">
                                <Label className="text-xs text-muted-foreground">Radio Button Question</Label>
                                {isRestFlowEditing ? (
                                    <RadioGroup 
                                        value={restFlowAnswers.radio} 
                                        onValueChange={(val) => setState({ restFlowAnswers: { ...restFlowAnswers, radio: val }})} 
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="option-one" id="r1-edit" />
                                            <Label htmlFor="r1-edit">Option One</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="option-two" id="r2-edit" />
                                            <Label htmlFor="r2-edit">Option Two</Label>
                                        </div>
                                    </RadioGroup>
                                ) : (
                                    <div className="flex h-8 w-full items-center rounded-md bg-muted/30 px-3 py-1 text-sm">
                                        {restFlowAnswers.radio || <span className="text-muted-foreground italic">No selection</span>}
                                    </div>
                                )}
                            </div>
                            <Separator />
                            <div className="space-y-2 pt-2">
                                <Label className="text-xs text-muted-foreground">Checkbox Question</Label>
                                {isRestFlowEditing ? (
                                     <div className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="c1-edit" 
                                                checked={restFlowAnswers.checkbox.a}
                                                onCheckedChange={(checked) => setState({ restFlowAnswers: { ...restFlowAnswers, checkbox: { ...restFlowAnswers.checkbox, a: !!checked } }})}
                                            />
                                            <Label htmlFor="c1-edit">Option A</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="c2-edit" 
                                                checked={restFlowAnswers.checkbox.b}
                                                onCheckedChange={(checked) => setState({ restFlowAnswers: { ...restFlowAnswers, checkbox: { ...restFlowAnswers.checkbox, b: !!checked } }})}
                                            />
                                            <Label htmlFor="c2-edit">Option B</Label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-8 w-full items-center rounded-md bg-muted/30 px-3 py-1 text-sm">
                                        {Object.entries(restFlowAnswers.checkbox).filter(([, val]) => val).map(([key]) => key.toUpperCase()).join(', ') || <span className="text-muted-foreground italic">No selection</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex items-center justify-between bg-card rounded-lg p-3 border">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to XSLT Preview
                </Button>
                <Button onClick={handleFinish}>
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
