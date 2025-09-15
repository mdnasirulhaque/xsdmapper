
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FileUploadButton from "@/components/file-upload-button"
import type { XsdNode, Mapping } from "@/types"
import { Braces, FileCode, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { useToast } from "@/hooks/use-toast"

const XsdNodeRecursive = ({
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
  nodeRefs: React.MutableRefObject<Map<string, HTMLElement | null>>,
  mappings: Mapping[],
  draggingNodeId?: string | null,
  rerenderCanvas: () => void
}) => {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    if (nodeRef.current) {
      nodeRefs.current.set(node.id, nodeRef.current)
    }
    // Rerender canvas whenever a node is mounted or unmounted
    rerenderCanvas()
    return () => {
      nodeRefs.current.delete(node.id)
    }
  }, [node.id, nodeRefs, rerenderCanvas])

  const isDraggable = type === 'source' && (!node.children || node.children.length === 0);
  const isDroppable = type === 'target' && (!node.children || node.children.length === 0);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isDraggable && onDragStart) {
      e.dataTransfer.effectAllowed = 'link'
      onDragStart(node)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isDroppable) {
      e.preventDefault()
      setIsDragOver(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (isDroppable && onDrop) {
      e.preventDefault()
      setIsDragOver(false)
      onDrop(node)
    }
  }
  
  const handleDragEnd = () => {
    setIsDragOver(false)
    if (onDragEnd) onDragEnd()
  }

  const isMapped = type === 'source' 
    ? mappings.some(m => m.sourceId === node.id) 
    : mappings.some(m => m.targetId === node.id);
  const isDragging = draggingNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-4">
        <div
            ref={nodeRef}
            draggable={isDraggable}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative flex items-center p-2 rounded-md transition-all duration-150 group",
                isDraggable && "cursor-grab",
                isDragging && "opacity-50 ring-2 ring-accent ring-offset-2 ring-offset-background",
                isDroppable && "cursor-crosshair",
                isDragOver && "bg-accent/20 ring-2 ring-accent"
            )}
            >
            {!hasChildren && (
                <div
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 bg-card transition-colors",
                    type === 'source' ? "-right-1.5 translate-x-1/2" : "-left-1.5 -translate-x-1/2",
                    isMapped ? "bg-primary border-primary" : "border-muted-foreground/50 group-hover:border-primary"
                )}
                />
            )}
            
            {hasChildren ? <Braces className="w-4 h-4 mr-2 text-muted-foreground" /> : <FileCode className="w-4 h-4 mr-2 text-muted-foreground" />}
            <span className="font-medium text-sm flex-1">{node.name}</span>
            <span className="text-xs text-muted-foreground ml-2">{node.type}</span>
        </div>
        
        {hasChildren && (
            <div className="pl-6 space-y-1 border-l border-dashed border-muted-foreground/30">
            {node.children?.map(child => (
                <XsdNodeRecursive
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
        )}
    </div>
  )
}

const renderSchemaTree = (
    schema: XsdNode, 
    type: 'source' | 'target',
    onDragStart: ((node: XsdNode) => void) | undefined,
    onDragEnd: (() => void) | undefined,
    onDrop: ((node: XsdNode) => void) | undefined,
    nodeRefs: React.MutableRefObject<Map<string, HTMLElement | null>>,
    mappings: Mapping[],
    draggingNodeId: string | null | undefined,
    rerenderCanvas: () => void
) => {
    return (
        <div>
            <div className="relative flex items-center p-2 rounded-md transition-all duration-150 group">
                <Braces className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="font-medium text-sm flex-1">{schema.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{schema.type}</span>
            </div>
            <div className="space-y-1 border-l border-dashed border-muted-foreground/30">
                {schema.children?.map(child => (
                    <XsdNodeRecursive
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
    )
}

// XsdPanel logic
interface XsdPanelProps {
  title: string
  schema: XsdNode | null
  type: 'source' | 'target'
  onFileLoad: (schemaContent: string) => void
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
  const { toast } = useToast();

  const handleLoadDefault = async () => {
    const fileName = type === 'source' ? 'default-source.xsd' : 'default-target.xsd';
    try {
      const response = await fetch(`/${fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch default schema: ${response.statusText}`);
      }
      const xsdContent = await response.text();
      onFileLoad(xsdContent);
       toast({
        variant: "success",
        title: "Default Schema Loaded",
        description: `Successfully loaded ${fileName}.`,
      });
    } catch(e: any) {
       toast({
        variant: "destructive",
        title: "Loading Error",
        description: e.message || `Could not load ${fileName}.`,
      });
    }
  }
  
  return (
    <Card className="shadow-lg flex flex-col h-full min-h-[300px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLoadDefault}>
              <Star className="mr-2 h-4 w-4" />
              Load Default
            </Button>
            <FileUploadButton onFileLoad={onFileLoad} type={type} />
        </div>
      </CardHeader>
      <CardContent id={panelId} className="flex-1 overflow-y-auto py-6">
        {schema ? (
          renderSchemaTree(
            schema, 
            type,
            onDragStart,
            onDragEnd,
            onDrop,
            nodeRefs,
            mappings,
            draggingNodeId,
            rerenderCanvas)
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Upload an XSD file or load the default.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
