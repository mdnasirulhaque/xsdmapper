"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import XsdTree from "@/components/xsd-tree"
import FileUploadButton from "@/components/file-upload-button"
import type { XsdNode, Mapping } from "@/types"

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
          <XsdTree
            node={schema}
            type={type}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
            nodeRefs={nodeRefs}
            mappings={mappings}
            draggingNodeId={draggingNodeId}
            rerenderCanvas={rerenderCanvas}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Upload an XSD file to begin.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
