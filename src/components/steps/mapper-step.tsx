
"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import type { XsdNode, Mapping, Transformation } from '@/types'
import XsdPanel from '@/components/xsd-panel'
import MappingCanvas from '@/components/mapping-canvas'
import TransformationDialog from '@/components/transformation-dialog'
import { useAppContext } from '@/context/AppContext'
import { useToast } from '@/hooks/use-toast'
import { parseXsdToXsdNode } from '@/lib/xsd-parser'

export default function MapperStep() {
  const { 
    sourceSchema, 
    targetSchema, 
    mappings, 
    setState, 
  } = useAppContext();
  const { toast } = useToast();
  
  const [draggingNode, setDraggingNode] = useState<XsdNode | null>(null)
  
  const [selectedMapping, setSelectedMapping] = useState<Mapping | null>(null)
  const [isTransformationDialogOpen, setTransformationDialogOpen] = useState(false)
  
  const nodeRefs = useRef<Map<string, HTMLElement | null>>(new Map())
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasKey, setCanvasKey] = useState(0)

  const rerenderCanvas = useCallback(() => {
     setTimeout(() => setCanvasKey(prev => prev + 1), 50)
  }, [])

  useEffect(() => {
    const mainContainer = canvasRef.current;
    if (!mainContainer) return;

    const resizeObserver = new ResizeObserver(rerenderCanvas);
    resizeObserver.observe(mainContainer);

    // Initial render
    rerenderCanvas();

    return () => {
      resizeObserver.disconnect();
    }
  }, [rerenderCanvas])

  const handleFileLoad = (schemaContent: string, type: 'source' | 'target') => {
    try {
        const newSchema = parseXsdToXsdNode(schemaContent, type);
        if (!newSchema) {
            throw new Error("Could not parse the uploaded XSD file.");
        }

        if (type === 'source') {
          setState({ sourceSchema: newSchema, mappings: [] });
        } else {
          setState({ targetSchema: newSchema, mappings: [] });
        }
        rerenderCanvas();
    } catch(e: any) {
        toast({
            variant: "destructive",
            title: "Parsing Error",
            description: e.message || "An unknown error occurred while parsing.",
        });
    }
  }
  
  const handleDragStart = (node: XsdNode) => {
    setDraggingNode(node)
  }

  const handleDragEnd = () => {
    setDraggingNode(null)
  }
  
  const handleDrop = (targetNode: XsdNode) => {
    if (!draggingNode) return;

    const existingMappings = [...mappings];
    const newMappings: Mapping[] = [];
    
    const sourceIsParent = draggingNode.children && draggingNode.children.length > 0;
    const targetIsParent = targetNode.children && targetNode.children.length > 0;

    if (sourceIsParent && targetIsParent) {
        // Parent-to-parent mapping: map children sequentially
        const sourceChildren = draggingNode.children || [];
        const targetChildren = targetNode.children || [];
        const minChildren = Math.min(sourceChildren.length, targetChildren.length);

        for(let i = 0; i < minChildren; i++) {
            const sourceChild = sourceChildren[i];
            const targetChild = targetChildren[i];

            // Can't map a parent to a child within this auto-mapping
            if((sourceChild.children && !targetChild.children) || (!sourceChild.children && targetChild.children)) {
                continue;
            }

             const newMapping: Mapping = {
                id: `${sourceChild.id}-${targetChild.id}`,
                sourceId: sourceChild.id,
                targetId: targetChild.id,
            };

            if (!existingMappings.some(m => m.id === newMapping.id)) {
                if (existingMappings.some(m => m.targetId === newMapping.targetId)) {
                     toast({
                        title: "Mapping Conflict",
                        description: `Target ${targetChild.name} is already mapped.`,
                    })
                } else {
                    newMappings.push(newMapping);
                    existingMappings.push(newMapping); // Add to temp list to check subsequent mappings in this loop
                }
            }
        }

        if (newMappings.length > 0) {
           toast({
                variant: 'success',
                title: 'Auto-Mapped Children',
                description: `Created ${newMappings.length} new mappings between child nodes.`
            })
        }

    } else if (!sourceIsParent && !targetIsParent) {
        // Single node to single node mapping
        const newMapping: Mapping = {
            id: `${draggingNode.id}-${targetNode.id}`,
            sourceId: draggingNode.id,
            targetId: targetNode.id,
        }
        
        if(mappings.some(m => m.id === newMapping.id)) {
            toast({
                title: "Mapping Exists",
                description: "This mapping has already been created.",
            })
            return;
        }
        
        if(mappings.some(m => m.targetId === newMapping.targetId)) {
            toast({
                title: "Mapping Conflict",
                description: `Target ${targetNode.name} is already mapped. Multiple source fields can be mapped to one target for concatenation.`,
            })
        }
        newMappings.push(newMapping);

    } else {
        // Invalid mapping (parent to child or child to parent)
        toast({
            variant: 'destructive',
            title: 'Invalid Mapping',
            description: 'Cannot map a parent node to a child node, or vice-versa.'
        })
        return;
    }

    if (newMappings.length > 0) {
        setState({ mappings: [...mappings, ...newMappings] });
        rerenderCanvas();
    }
  }
  
  const deleteMapping = (mappingId: string) => {
    setState({ mappings: mappings.filter(m => m.id !== mappingId) });
  }

  const handleOpenTransformationDialog = (mapping: Mapping) => {
    setSelectedMapping(mapping)
    setTransformationDialogOpen(true)
  }

  const handleSaveTransformation = (transformation: Transformation) => {
    if (selectedMapping) {
      setState({ mappings: mappings.map(m => 
        m.id === selectedMapping.id ? { ...m, transformation } : m
      )});
    }
    setTransformationDialogOpen(false)
    setSelectedMapping(null)
  }

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      <div ref={canvasRef} className="flex-1 relative bg-card rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full p-4 sm:p-6 md:p-8">
          <XsdPanel
            title="Source Schema"
            schema={sourceSchema}
            type="source"
            onFileLoad={(schemaContent) => handleFileLoad(schemaContent, 'source')}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            nodeRefs={nodeRefs}
            mappings={mappings}
            draggingNodeId={draggingNode?.id}
            rerenderCanvas={rerenderCanvas}
          />
          <XsdPanel
            title="Target Schema"
            schema={targetSchema}
            type="target"
            onFileLoad={(schemaContent) => handleFileLoad(schemaContent, 'target')}
            onDrop={handleDrop}
            nodeRefs={nodeRefs}
            mappings={mappings}
            draggingNodeId={draggingNode?.id}
            rerenderCanvas={rerenderCanvas}
          />
        </div>
        
        {canvasRef.current && (
          <MappingCanvas
            key={canvasKey}
            mappings={mappings}
            nodeRefs={nodeRefs.current}
            canvasRef={canvasRef.current}
            onMappingClick={handleOpenTransformationDialog}
            onMappingDelete={deleteMapping}
          />
        )}

        {selectedMapping && (
          <TransformationDialog
            isOpen={isTransformationDialogOpen}
            onOpenChange={setTransformationDialogOpen}
            mapping={selectedMapping}
            onSave={handleSaveTransformation}
          />
        )}
      </div>
    </div>
  )
}
