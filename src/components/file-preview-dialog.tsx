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

interface FilePreviewDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  content: string
  title: string
  language?: 'xml' | 'yaml' | 'json';
}

export default function FilePreviewDialog({ isOpen, onOpenChange, content, title, language = 'xml' }: FilePreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            This is a preview of the file you uploaded.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[80vh] mt-4 rounded-md border bg-muted/30">
            <CodeBlock code={content} language={language} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
