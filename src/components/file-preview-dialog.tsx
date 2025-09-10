"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FilePreviewDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  content: string
  title: string
}

export default function FilePreviewDialog({ isOpen, onOpenChange, content, title }: FilePreviewDialogProps) {
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
          <pre className="p-4 text-sm">
            <code>{content}</code>
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
