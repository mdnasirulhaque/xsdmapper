
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import CodeBlock from "./code-block"
import { Button } from "./ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FilePreviewDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  content: string
  title: string
  language?: 'xml' | 'yaml' | 'json';
}

export default function FilePreviewDialog({ isOpen, onOpenChange, content, title, language = 'xml' }: FilePreviewDialogProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        variant: 'success',
        title: "Copied to Clipboard",
        description: "The file content has been copied.",
      })
    }, (err) => {
      toast({
        variant: 'destructive',
        title: "Copy Failed",
        description: `Could not copy content: ${err}`,
      })
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                This is a preview of the file content.
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 mt-4 rounded-md bg-muted/50">
            <CodeBlock code={content} language={language} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

    