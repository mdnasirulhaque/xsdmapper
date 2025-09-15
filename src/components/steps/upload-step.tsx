
"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, ArrowRight, CheckCircle, Eye, FileText } from 'lucide-react';
import { useRef, useState, useCallback, useEffect } from 'react';
import FilePreviewDialog from '../file-preview-dialog';
import { useAppContext } from '@/context/AppContext';


const FileUploadSection = ({ title, description, onFileUpload, fileContent, uploadComplete, fileType }: {
    title: string;
    description: string;
    onFileUpload: (content: string, fileType: 'input' | 'response') => void;
    fileContent: string | null;
    uploadComplete: boolean;
    fileType: 'input' | 'response';
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    
    useEffect(() => {
        if (fileContent && !fileName) {
            setFileName(`sample-${fileType}.xml`);
        }
        if (!fileContent && fileName) {
            setFileName(null);
        }
    }, [fileContent, fileType, fileName]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    onFileUpload(content, fileType);
                    toast({
                        variant: "success",
                        title: "Upload Successful",
                        description: `${file.name} has been processed.`,
                    })

                } catch (error) {
                    console.error("Error processing XML file:", error);
                    onFileUpload('', fileType); // Clear content on error
                    setFileName(null);
                    toast({
                        variant: "destructive",
                        title: "Upload Failed",
                        description: "Could not process the XML file.",
                    });
                }
            };
            reader.readAsText(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".xml"
                />
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground text-center">{description}</p>
                <Button onClick={handleClick} size="lg" className="w-full" variant={uploadComplete ? "secondary" : "default"}>
                    {uploadComplete ? <CheckCircle className="mr-2 h-5 w-5" /> : <FileUp className="mr-2 h-5 w-5" />}
                    {uploadComplete ? "Uploaded" : `Upload ${title}`}
                </Button>
                {fileContent && (
                    <Button variant="ghost" className="w-full text-sm" onClick={() => setIsPreviewOpen(true)}>
                        <Eye className="mr-2 h-4 w-4" /> Preview File
                    </Button>
                )}
            </div>
            {fileContent && (
                <FilePreviewDialog
                    isOpen={isPreviewOpen}
                    onOpenChange={setIsPreviewOpen}
                    content={fileContent}
                    title={fileName || 'File Preview'}
                />
            )}
        </>
    )
}

export default function UploadStep() {
  const router = useRouter();
  const { toast } = useToast();
  const { inputXml, responseXml, setState } = useAppContext();

  const handleFileUpload = (content: string, fileType: 'input' | 'response') => {
    if (fileType === 'input') {
        setState({ inputXml: content, inputXsd: null, sourceSchema: null, mappings: [] });
    } else {
        setState({ responseXml: content, responseXsd: null, targetSchema: null, mappings: [] });
    }
  }

  const loadDefaults = useCallback(async () => {
    try {
        const [inputRes, responseRes] = await Promise.all([
            fetch('/sample-input.xml'),
            fetch('/sample-response.xml'),
        ]);

        if (!inputRes.ok || !responseRes.ok) {
            throw new Error("Failed to fetch default files.");
        }

        const [inputContent, responseContent] = await Promise.all([
            inputRes.text(),
            responseRes.text(),
        ]);

        setState({
            inputXml: inputContent,
            responseXml: responseContent,
            inputXsd: null,
            sourceSchema: null,
            responseXsd: null,
            targetSchema: null,
            mappings: [],
        });

        toast({
            variant: "success",
            title: "Defaults Loaded",
            description: "Sample XML files have been loaded.",
        });

    } catch (e) {
        console.error("Failed to load default files:", e);
        toast({
            variant: "destructive",
            title: "Loading Failed",
            description: "Could not load the default sample files.",
        });
    }
  }, [setState, toast]);

  const handleProceed = () => {
    if (!inputXml || !responseXml) {
        toast({
            variant: 'destructive',
            title: 'Files Missing',
            description: 'Please upload both an input and a response XML file to continue.',
        });
        return;
    }
    router.push(`/new/preview-xsd`);
  }
  

  return (
    <div className="flex items-center justify-center flex-1">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Your XSLT Mapping</CardTitle>
          <CardDescription>Start by uploading your input and response XML files to generate schemas.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploadSection 
                    title="Input XML"
                    description="This will be used to generate the source schema."
                    onFileUpload={handleFileUpload}
                    fileContent={inputXml}
                    uploadComplete={!!inputXml}
                    fileType="input"
                />
                 <FileUploadSection 
                    title="Response XML"
                    description="This will be used to generate the target schema."
                    onFileUpload={handleFileUpload}
                    fileContent={responseXml}
                    uploadComplete={!!responseXml}
                    fileType="response"
                />
            </div>
            <div className="flex flex-col gap-2">
                <Button onClick={handleProceed} size="lg" className="w-full" disabled={!inputXml || !responseXml}>
                    Proceed to Next Step <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button onClick={loadDefaults} size="lg" variant="outline" className="w-full">
                    <FileText className="mr-2 h-5 w-5" /> Load Defaults
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
