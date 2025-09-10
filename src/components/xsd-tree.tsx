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

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="w-full space-y-1">
        <XsdNodeComponent node={{...node, children: hasChildren ? [] : undefined}} isRoot={!hasChildren} {...props} />
        {hasChildren && (
            <div className="pl-6 space-y-1 border-l border-dashed border-muted-foreground/30">
            {node.children?.map(child => (
                <XsdTree key={child.id} node={child} {...props} />
            ))}
            </div>
        )}
    </div>
  )
}
