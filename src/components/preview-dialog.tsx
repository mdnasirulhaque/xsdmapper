"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PreviewDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  content: string
}

// Basic XML syntax highlighting
const highlightXml = (xml: string) => {
  return xml
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(&lt;[a-zA-Z0-9\s="/._:\-]+&gt;)/g, '<span class="text-primary/80">$1</span>')
    .replace(/(&lt;\/[a-zA-Z0-9\s]+&gt;)/g, '<span class="text-primary/80">$1</span>')
    .replace(/(\s[a-zA-Z-]+="[^"]+")/g, '<span class="text-accent/80">$1</span>');
};


export default function PreviewDialog({ isOpen, onOpenChange, content }: PreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>XML Output Preview</DialogTitle>
          <DialogDescription>
            This is a sample XML generated based on your mappings and transformations.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4 rounded-md border bg-muted/30">
          <pre className="p-4 text-sm">
            <code dangerouslySetInnerHTML={{ __html: highlightXml(content) }} />
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
