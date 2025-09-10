
"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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

  const handleTriggerClick = () => {
    // A small timeout allows the accordion animation to start before rerendering
    setTimeout(() => props.rerenderCanvas(), 50)
  }

  return (
    <Accordion type="multiple" className="w-full" defaultValue={[node.id]}>
      <AccordionItem value={node.id} className="border-none">
        <AccordionTrigger 
          onClick={handleTriggerClick}
          className="py-1 hover:no-underline -ml-2"
        >
          <XsdNodeComponent node={{...node, children: undefined}} isRoot {...props} />
        </AccordionTrigger>
        <AccordionContent>
           <div className="pl-6 space-y-1 border-l border-dashed border-muted-foreground/30">
            {node.children.map(child => (
              <XsdTree key={child.id} node={child} {...props} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
