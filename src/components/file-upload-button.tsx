
"use client"

import { useRef } from 'react'
import { FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { XsdNode } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { parseXsdToXsdNode } from '@/lib/xsd-parser';


interface FileUploadButtonProps {
  onFileLoad: (schema: XsdNode) => void;
  type: 'source' | 'target'
}


export default function FileUploadButton({ onFileLoad, type }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const schema = parseXsdToXsdNode(content, type);
          if (!schema) {
            throw new Error(`Failed to parse ${file.name}. Ensure it's a valid XSD file with a root element.`);
          }
          onFileLoad(schema);
          toast({
            variant: "success",
            title: "Schema Loaded",
            description: `Successfully parsed and loaded ${file.name}.`,
          });
        } catch (error: any) {
          console.error("Failed to parse XSD", error);
          toast({
            variant: "destructive",
            title: "Parsing Error",
            description: error.message || `Could not parse ${file.name}. Please ensure it's a valid XSD file.`,
          });
        }
      };
      reader.readAsText(file);
    }
     // Reset the input value to allow uploading the same file again
     if(inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xsd, .xml"
      />
      <Button variant="secondary" size="sm" onClick={handleClick}>
        <FileUp className="mr-2 h-4 w-4" />
        Upload XSD
      </Button>
    </>
  )
}
