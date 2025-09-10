"use client"

import XsdNodeComponent from "./xsd-node"
import type { XsdNode, Mapping } from "@/types"

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
  if (!node.children || node.children.length === 0) {
    return (
      <div className="space-y-1">
        <XsdNodeComponent node={node} isRoot {...props} />
      </div>
    )
  }

  return (
    <div className="w-full">
        <XsdNodeComponent node={{...node, children: undefined}} isRoot {...props} />
        <div className="pl-6 space-y-1 border-l border-dashed border-muted-foreground/30">
        {node.children.map(child => (
            <XsdTree key={child.id} node={child} {...props} />
        ))}
        </div>
    </div>
  )
}
