
"use client";

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, ArrowRight, CheckCircle, Eye } from 'lucide-react';
import { useRef, useState } from 'react';
import FilePreviewDialog from '../file-preview-dialog';
import { useAppContext } from '@/context/AppContext';


export default function UploadStep() {
  const router = useRouter();
  const { toast } = useToast();
  const { inputXml, responseXml, setState } = useAppContext();

  const inputXmlRef = useRef<HTMLInputElement>(null);
  const responseXmlRef = useRef<HTMLInputElement>(null);

  const [previewing, setPreviewing] = useState<{ content: string; title: string } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'input' | 'response') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (fileType === 'input') {
            setState({ inputXml: content, inputXsd: null, sourceSchema: null, mappings: [] });
          } else {
            setState({ responseXml: content, responseXsd: null, targetSchema: null, mappings: [] });
          }

          toast({
            variant: "success",
            title: "Upload Successful",
            description: `${file.name} has been processed.`,
          });

        } catch (error) {
          console.error("Error processing XML file:", error);
          if (fileType === 'input') {
            setState({ inputXml: null });
          } else {
            setState({ responseXml: null });
          }
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Could not process the XML file.",
          });
        }
      };
      reader.readAsText(file);
    }
    // Reset input to allow re-uploading the same file
    event.target.value = "";
  };

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
            {/* Input XML Section */}
            <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
              <input
                type="file"
                ref={inputXmlRef}
                onChange={(e) => handleFileChange(e, 'input')}
                className="hidden"
                accept=".xml"
              />
              <h3 className="font-semibold">Input XML</h3>
              <p className="text-sm text-muted-foreground text-center">This will be used to generate the source schema.</p>
              <Button onClick={() => inputXmlRef.current?.click()} size="lg" className="w-full" variant={inputXml ? "secondary" : "default"}>
                {inputXml ? <CheckCircle className="mr-2 h-5 w-5" /> : <FileUp className="mr-2 h-5 w-5" />}
                {inputXml ? "Uploaded" : "Upload Input XML"}
              </Button>
              {inputXml && (
                <Button variant="ghost" className="w-full text-sm" onClick={() => setPreviewing({ content: inputXml, title: "Input XML Preview"})}>
                  <Eye className="mr-2 h-4 w-4" /> Preview File
                </Button>
              )}
            </div>

            {/* Response XML Section */}
            <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
              <input
                type="file"
                ref={responseXmlRef}
                onChange={(e) => handleFileChange(e, 'response')}
                className="hidden"
                accept=".xml"
              />
              <h3 className="font-semibold">Response XML</h3>
              <p className="text-sm text-muted-foreground text-center">This will be used to generate the target schema.</p>
              <Button onClick={() => responseXmlRef.current?.click()} size="lg" className="w-full" variant={responseXml ? "secondary" : "default"}>
                {responseXml ? <CheckCircle className="mr-2 h-5 w-5" /> : <FileUp className="mr-2 h-5 w-5" />}
                {responseXml ? "Uploaded" : "Upload Response XML"}
              </Button>
              {responseXml && (
                <Button variant="ghost" className="w-full text-sm" onClick={() => setPreviewing({ content: responseXml, title: "Response XML Preview"})}>
                  <Eye className="mr-2 h-4 w-4" /> Preview File
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleProceed} size="lg" className="w-full" disabled={!inputXml || !responseXml}>
              Proceed to Next Step <ArrowRight className="ml-2 h-5 w-5" />
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
        />
      )}
    </div>
  );
}
