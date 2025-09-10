"use client"

import { useState, useRef, useEffect } from "react"
import { Braces, FileCode } from "lucide-react"
import { cn } from "@/lib/utils"
import type { XsdNode, Mapping } from "@/types"
import XsdTree from "./xsd-tree"

interface XsdNodeProps {
  node: XsdNode
  type: 'source' | 'target'
  onDragStart?: (node: XsdNode) => void
  onDragEnd?: () => void
  onDrop?: (node: XsdNode) => void
  isRoot?: boolean
  nodeRefs: React.MutableRefObject<Map<string, HTMLElement | null>>
  mappings: Mapping[]
  draggingNodeId?: string | null
  rerenderCanvas: () => void
}

export default function XsdNodeComponent({
  node,
  type,
  onDragStart,
  onDragEnd,
  onDrop,
  isRoot = false,
  nodeRefs,
  mappings,
  draggingNodeId,
  rerenderCanvas
}: XsdNodeProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (nodeRef.current) {
      nodeRefs.current.set(node.id, nodeRef.current)
    }
    // Rerender canvas when a node mounts to draw initial lines
    rerenderCanvas()
    return () => {
      nodeRefs.current.delete(node.id)
    }
  }, [node.id, nodeRefs, rerenderCanvas])

  const isDraggable = type === 'source' && !node.children;
  const isDroppable = type === 'target' && !node.children;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isDraggable || !onDragStart) return
    e.dataTransfer.effectAllowed = 'link'
    onDragStart(node)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isDroppable) return
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isDroppable || !onDrop) return
    e.preventDefault()
    setIsDragOver(false)
    onDrop(node)
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragOver(false)
    if(onDragEnd) onDragEnd();
  }

  const isMapped = type === 'source'
    ? mappings.some(m => m.sourceId === node.id)
    : mappings.some(m => m.targetId === node.id)

  const isDragging = draggingNodeId === node.id

  if (node.children) {
    return <XsdTree node={node} type={type} onDragStart={onDragStart} onDragEnd={onDragEnd} onDrop={onDrop} nodeRefs={nodeRefs} mappings={mappings} draggingNodeId={draggingNodeId} rerenderCanvas={rerenderCanvas} />
  }

  return (
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
        isDragOver && "bg-accent/20 ring-2 ring-accent",
        !isRoot && "ml-4"
      )}
    >
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 bg-card transition-colors",
          type === 'source' ? "-right-1.5 translate-x-1/2" : "-left-1.5 -translate-x-1/2",
          isMapped ? "bg-primary border-primary" : "border-muted-foreground/50 group-hover:border-primary",
        )}
      />

      {node.type === 'complexType' ? (
        <Braces className="w-4 h-4 mr-2 text-muted-foreground" />
      ) : (
        <FileCode className="w-4 h-4 mr-2 text-muted-foreground" />
      )}
      <span className="font-medium text-sm flex-1">{node.name}</span>
      <span className="text-xs text-muted-foreground ml-2">{node.type}</span>
    </div>
  )
}
