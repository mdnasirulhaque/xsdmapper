
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import CodeBlock from "./code-block"
import { Button } from "./ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { prettyPrintXml } from "@/lib/formatter"

interface FilePreviewDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  content: string
  title: string
  language?: 'xml' | 'yaml' | 'json';
}

export default function FilePreviewDialog({ isOpen, onOpenChange, content, title, language = 'xml' }: FilePreviewDialogProps) {
  const { toast } = useToast();
  
  const formattedContent = language === 'xml' ? prettyPrintXml(content) : content;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedContent).then(() => {
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
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              This is a preview of the file content.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full bg-muted/50">
              <CodeBlock code={formattedContent} language={language} />
          </ScrollArea>
        </div>
        <DialogFooter className="p-4 border-t flex-row justify-between">
           <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
           <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
