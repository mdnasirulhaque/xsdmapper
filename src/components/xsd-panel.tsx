"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import XsdTree from "@/components/xsd-tree"
import FileUploadButton from "@/components/file-upload-button"
import type { XsdNode, Mapping } from "@/types"
import { Braces } from "lucide-react"

interface XsdPanelProps {
  title: string
  schema: XsdNode | null
  type: 'source' | 'target'
  onFileLoad: (schema: XsdNode) => void
  onDragStart?: (node: XsdNode) => void
  onDragEnd?: () => void
  onDrop?: (node: XsdNode) => void
  nodeRefs: React.MutableRefObject<Map<string, HTMLElement | null>>
  mappings: Mapping[]
  draggingNodeId?: string | null
  rerenderCanvas: () => void
}

export default function XsdPanel({
  title,
  schema,
  type,
  onFileLoad,
  onDragStart,
  onDragEnd,
  onDrop,
  nodeRefs,
  mappings,
  draggingNodeId,
  rerenderCanvas
}: XsdPanelProps) {
  const panelId = `${type}-panel-content`;
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <FileUploadButton onFileLoad={onFileLoad} type={type} />
      </CardHeader>
      <CardContent id={panelId} className="flex-1 overflow-y-auto">
        {schema ? (
          <div>
            <div className="relative flex items-center p-2 rounded-md transition-all duration-150 group">
                <Braces className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="font-medium text-sm flex-1">{schema.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{schema.type}</span>
            </div>
            <div className="pl-6 space-y-1 border-l border-dashed border-muted-foreground/30">
              {schema.children?.map(child => (
                <XsdTree
                  key={child.id}
                  node={child}
                  type={type}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDrop={onDrop}
                  nodeRefs={nodeRefs}
                  mappings={mappings}
                  draggingNodeId={draggingNodeId}
                  rerenderCanvas={rerenderCanvas}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Upload an XSD file to begin.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
