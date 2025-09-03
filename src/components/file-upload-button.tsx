"use client"

import { useRef } from 'react'
import { FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { XsdNode } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { sourceSchema, targetSchema } from '@/lib/mock-data'

interface FileUploadButtonProps {
  onFileLoad: (schema: XsdNode) => void;
  type: 'source' | 'target'
}

export default function FileUploadButton({ onFileLoad, type }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This is a simulation. In a real app, you would parse the file.
    // For now, we just load the mock data.
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "File Loaded (Simulation)",
        description: `Loaded mock data instead of parsing ${file.name}.`,
      })
      
      if (type === 'source') {
        onFileLoad(sourceSchema);
      } else {
        onFileLoad(targetSchema);
      }
    }
  }

  const handleClick = () => {
    // In this mocked version, we'll just load the data directly
    toast({
        title: "Loading Mock Schema",
        description: `Loading mock ${type} schema.`,
    })
    if (type === 'source') {
        onFileLoad(sourceSchema);
    } else {
        onFileLoad(targetSchema);
    }
    // To use actual file upload, uncomment the line below and comment out the logic above
    // inputRef.current?.click()
  }

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xsd"
      />
      <Button variant="ghost" size="sm" onClick={handleClick}>
        <FileUp className="mr-2 h-4 w-4" />
        Upload XSD
      </Button>
    </>
  )
}
