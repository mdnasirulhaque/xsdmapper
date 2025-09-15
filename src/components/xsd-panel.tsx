
"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FileUploadButton from "@/components/file-upload-button"
import type { XsdNode, Mapping } from "@/types"
import { Braces, FileCode } from "lucide-react"
import { cn } from "@/lib/utils"

// XsdNodeComponent logic merged into XsdPanel
const XsdNodeComponent = ({
  node,
  type,
  onDragStart,
  onDragEnd,
  onDrop,
  nodeRefs,
  mappings,
  draggingNodeId,
  rerenderCanvas
}: {
  node: XsdNode,
  type: 'source' | 'target',
  onDragStart?: (node: XsdNode) => void,
  onDragEnd?: () => void,
  onDrop?: (node: XsdNode) => void,
  isRoot?: boolean,
  nodeRefs: React.MutableRefObject<Map<string, HTMLElement | null>>,
  mappings: Mapping[],
  draggingNodeId?: string | null,
  rerenderCanvas: () => void
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (nodeRef.current) {
      nodeRefs.current.set(node.id, nodeRef.current)
    }
    rerenderCanvas()
    return () => {
      nodeRefs.current.delete(node.id)
    }
  }, [node.id, nodeRefs, rerenderCanvas])

  const isDraggable = type === 'source';
  const isDroppable = type === 'target';

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isDraggable || !onDragStart || (node.children && node.children.length > 0)) return
    e.dataTransfer.effectAllowed = 'link'
    onDragStart(node)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isDroppable || (node.children && node.children.length > 0)) return
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isDroppable || !onDrop || (node.children && node.children.length > 0)) return
    e.preventDefault()
    setIsDragOver(false)
    onDrop(node)
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragOver(false)
    if(onDragEnd) onDragEnd();
  }

  const isMapped = (type === 'source'
    ? mappings.some(m => m.sourceId === node.id)
    : mappings.some(m => m.targetId === node.id))

  const isDragging = draggingNodeId === node.id
  const hasChildren = node.children && node.children.length > 0
  
  const NodeDisplay = (
    <div
      className={cn(
        "relative flex items-center p-2 rounded-md transition-all duration-150 group",
        hasChildren ? "ml-4" : "ml-4", 
      )}
    >
      {hasChildren ? <Braces className="w-4 h-4 mr-2 text-muted-foreground" /> : <FileCode className="w-4 h-4 mr-2 text-muted-foreground" />}
      <span className="font-medium text-sm flex-1">{node.name}</span>
      <span className="text-xs text-muted-foreground ml-2">{node.type}</span>
    </div>
  )

  if (hasChildren) {
    return (
       <div className="w-full space-y-1">
          {NodeDisplay}
          <div className="pl-6 space-y-1 border-l border-dashed border-muted-foreground/30">
            {node.children?.map(child => (
                <XsdNodeComponent key={child.id} node={child} type={type} onDragStart={onDragStart} onDragEnd={onDragEnd} onDrop={onDrop} nodeRefs={nodeRefs} mappings={mappings} draggingNodeId={draggingNodeId} rerenderCanvas={rerenderCanvas} />
            ))}
          </div>
      </div>
    )
  }

  return (
    <div
      ref={nodeRef}
      draggable={isDraggable && !hasChildren}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex items-center p-2 rounded-md transition-all duration-150 group",
        isDraggable && !hasChildren && "cursor-grab",
        isDragging && "opacity-50 ring-2 ring-accent ring-offset-2 ring-offset-background",
        isDroppable && !hasChildren && "cursor-crosshair",
        isDragOver && "bg-accent/20 ring-2 ring-accent",
        "ml-4"
      )}
    >
       <div
          className={cn(
          "absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 bg-card transition-colors",
          type === 'source' ? "-right-1.5 translate-x-1/2" : "-left-1.5 -translate-x-1/2",
          isMapped ? "bg-primary border-primary" : "border-muted-foreground/50 group-hover:border-primary",
          )}
      />
      <FileCode className="w-4 h-4 mr-2 text-muted-foreground" />
      <span className="font-medium text-sm flex-1">{node.name}</span>
      <span className="text-xs text-muted-foreground ml-2">{node.type}</span>
    </div>
  )
}

// XsdPanel logic
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
    <Card className="shadow-lg h-full flex flex-col max-h-[calc(100vh-12rem)]">
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
                <XsdNodeComponent
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
