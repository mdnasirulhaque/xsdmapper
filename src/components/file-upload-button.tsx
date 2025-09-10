"use client"

import { useRef } from 'react'
import { FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { XsdNode } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface FileUploadButtonProps {
  onFileLoad: (schema: XsdNode) => void;
  type: 'source' | 'target'
}

function parseXsd(xmlString: string, type: 'source' | 'target'): XsdNode {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  const simpleId = (name: string, index: number) => `${type}-${name.toLowerCase().replace(/\s+/g, '-')}-${index}`;

  function processNode(element: Element, index: number): XsdNode {
    const nodeName = element.getAttribute('name') || element.localName;
    const children: XsdNode[] = [];
    
    const complexType = element.querySelector(":scope > complexType, :scope > xs\\:complexType");
    const sequence = complexType ? complexType.querySelector(":scope > sequence, :scope > xs\\:sequence") : element.querySelector(":scope > sequence, :scope > xs\\:sequence");

    if (sequence) {
      Array.from(sequence.children).forEach((child, i) => {
        if (child.localName === 'element') {
          children.push(processNode(child, i));
        }
      });
    }

    return {
      id: simpleId(nodeName, index),
      name: nodeName,
      type: element.getAttribute('type') || (children.length > 0 ? 'complexType' : 'xs:string'),
      children: children.length > 0 ? children : undefined
    };
  }

  const rootElement = xmlDoc.querySelector("element, xs\\:element");
  if (!rootElement) {
    throw new Error("No root element found in XSD");
  }

  return processNode(rootElement, 0);
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
          const schema = parseXsd(content, type);
          onFileLoad(schema);
          toast({
            title: "Schema Loaded",
            description: `Successfully parsed and loaded ${file.name}.`,
          });
        } catch (error) {
          console.error("Failed to parse XSD", error);
          toast({
            variant: "destructive",
            title: "Parsing Error",
            description: `Could not parse ${file.name}. Please ensure it's a valid XSD file.`,
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
