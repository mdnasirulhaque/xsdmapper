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

export default function PreviewDialog({ isOpen, onOpenChange, content }: PreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>XML Output Preview</DialogTitle>
          <DialogDescription>
            This is a sample XML output based on your current mappings and transformations, using mock data.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4 rounded-md border bg-muted/30">
          <pre className="p-4 text-sm">
            <code>{content}</code>
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
