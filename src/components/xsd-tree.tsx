"use client"

import XsdNodeComponent from "./xsd-node"
import type { XsdNode, Mapping } from "@/types"
import { Braces } from "lucide-react"

interface XsdTreeProps {
  node: XsdNode
  type: 'source' | 'target'
  onDragStart?: (node: XsdNode) => void
  onDragEnd?: () => void
  onDrop?: (node: XsdNode) => void
  nodeRefs: React.MutableRefObject<Map<string, HTMLElement | null>>
  mappings: Mapping[]
  draggingNodeId?: string | null
  rerenderCanvas: () => void
}

export default function XsdTree({ node, ...props }: XsdTreeProps) {

  const hasChildren = node.children && node.children.length > 0;

  if (hasChildren) {
    return (
      <div className="w-full space-y-1">
          <div className="relative flex items-center p-2 rounded-md transition-all duration-150 group ml-4">
              <Braces className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium text-sm flex-1">{node.name}</span>
              <span className="text-xs text-muted-foreground ml-2">{node.type}</span>
          </div>
          <div className="pl-6 space-y-1 border-l border-dashed border-muted-foreground/30">
          {node.children?.map(child => (
              <XsdTree key={child.id} node={child} {...props} />
          ))}
          </div>
      </div>
    )
  }

  return (
      <div className="w-full space-y-1">
          <XsdNodeComponent node={node} isRoot={false} {...props} />
      </div>
  )
}
