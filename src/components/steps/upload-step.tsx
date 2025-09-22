
"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, ArrowRight, CheckCircle, Eye, ArrowLeft } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import FilePreviewDialog from '../file-preview-dialog';
import { useAppContext } from '@/context/AppContext';

export default function UploadStep() {
  const router = useRouter();
  const { toast } = useToast();
  const { 
    setState, 
    inputXml, 
    responseXml, 
    isRequestMapperSelected, 
    isResponseMapperSelected,
    lastVisitedStep,
  } = useAppContext();

  const inputXmlRef = useRef<HTMLInputElement>(null);
  const responseXmlRef = useRef<HTMLInputElement>(null);

  const [previewing, setPreviewing] = useState<{ content: string; title: string } | null>(null);

  const showInputUpload = isResponseMapperSelected || (!isRequestMapperSelected && !isResponseMapperSelected);
  const showResponseUpload = isRequestMapperSelected || (!isRequestMapperSelected && !isResponseMapperSelected);

  useEffect(() => {
    const isSingleUpload = (showInputUpload && !showResponseUpload) || (!showInputUpload && showResponseUpload);
    if (isSingleUpload) {
      toast({
        title: "Single File Upload",
        description: "A mapper ID was pre-selected, so only one XML file is required for schema generation.",
      });
    }
  }, [showInputUpload, showResponseUpload, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'input' | 'response') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const resetState = {
        inputXsd: null,
        responseXsd: null,
        swaggerFile: null,
        endpoint: null,
        method: null,
        mappings: { set1: [], set2: [], set3: [] },
        sourceSchemas: { set1: null, set2: null, set3: null },
        targetSchemas: { set1: null, set2: null, set3: null },
      };

      if (fileType === 'input') {
        setState({ ...resetState, inputXml: content, responseXml: responseXml });
      } else {
        setState({ ...resetState, inputXml: inputXml, responseXml: content });
      }
      toast({
        variant: "success",
        title: "Upload Successful",
        description: `${file.name} has been processed.`,
      });
    };
    reader.readAsText(file);
  };

  const handleUploadInputClick = () => {
    inputXmlRef.current?.click();
  };

  const handleUploadResponseClick = () => {
    responseXmlRef.current?.click();
  };

  const handleProceed = () => {
    let isReady = true;
    let message = '';
    
    if (showInputUpload && !inputXml) {
        isReady = false;
        message = 'Please upload an input XML file to continue.';
    }
    if (showResponseUpload && !responseXml) {
        isReady = false;
        message = 'Please upload a response XML file to continue.';
    }
    if (showInputUpload && showResponseUpload && !inputXml && !responseXml) {
        message = 'Please upload both an input and a response XML file to continue.';
    }

    if (!isReady) {
      toast({
        variant: 'destructive',
        title: 'Files Missing',
        description: message,
      });
      return;
    }
    setState({ lastVisitedStep: '/new/upload' });
    router.push('/new/preview-xsd');
  }

  const handleBack = () => {
    router.push(lastVisitedStep || '/new/initial');
  }
  
  const getGridColsClass = () => {
    if (showInputUpload && showResponseUpload) return "grid-cols-1 md:grid-cols-2";
    return "grid-cols-1";
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Your XSLT Mapping</CardTitle>
          <CardDescription>Start by uploading your XML files to generate the necessary XSD schemas.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className={`grid ${getGridColsClass()} gap-6`}>
            {showInputUpload && (
                <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
                <input
                    type="file"
                    ref={inputXmlRef}
                    onChange={(e) => handleFileChange(e, 'input')}
                    className="hidden"
                    accept=".xml"
                />
                <h3 className="font-semibold">Input XML</h3>
                <p className="text-sm text-muted-foreground text-center">This will be used to generate the context and request XSD.</p>
                <Button onClick={handleUploadInputClick} size="lg" className="w-full" variant={inputXml ? "secondary" : "default"}>
                    {inputXml ? <CheckCircle className="mr-2 h-5 w-5" /> : <FileUp className="mr-2 h-5 w-5" />}
                    {inputXml ? "Uploaded" : "Upload Input XML"}
                </Button>
                {inputXml && (
                    <Button variant="ghost" className="w-full text-sm" onClick={() => setPreviewing({ content: inputXml, title: "Input XML Preview" })}>
                    <Eye className="mr-2 h-4 w-4" /> Preview File
                    </Button>
                )}
                </div>
            )}

            {showResponseUpload && (
                <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
                <input
                    type="file"
                    ref={responseXmlRef}
                    onChange={(e) => handleFileChange(e, 'response')}
                    className="hidden"
                    accept=".xml"
                />
                <h3 className="font-semibold">Response XML</h3>
                <p className="text-sm text-muted-foreground text-center">This will be used to generate the response XSD.</p>
                <Button onClick={handleUploadResponseClick} size="lg" className="w-full" variant={responseXml ? "secondary" : "default"}>
                    {responseXml ? <CheckCircle className="mr-2 h-5 w-5" /> : <FileUp className="mr-2 h-5 w-5" />}
                    {responseXml ? "Uploaded" : "Upload Response XML"}
                </Button>
                {responseXml && (
                    <Button variant="ghost" className="w-full text-sm" onClick={() => setPreviewing({ content: responseXml, title: "Response XML Preview" })}>
                    <Eye className="mr-2 h-4 w-4" /> Preview File
                    </Button>
                )}
                </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-6">
             <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleProceed} size="lg">
              Proceed to XSD Preview <ArrowRight className="ml-2 h-5 w-5" />
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
          language="xml"
        />
      )}
    </div>
  );
}
