
"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import type { XsdNode, Mapping, Transformation } from '@/types'
import XsdPanel from '@/components/xsd-panel'
import MappingCanvas from '@/components/mapping-canvas'
import TransformationDialog from '@/components/transformation-dialog'
import { useAppContext } from '@/context/AppContext'
import { useToast } from '@/hooks/use-toast'
import { parseXsdToXsdNode } from '@/lib/xsd-parser'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MapperStep() {
  const router = useRouter();
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

    const createMappingIfNotExists = (source: XsdNode, target: XsdNode, matchType: 'manual' | 'auto') => {
        const newMapping: Mapping = {
            id: `${source.id}-${target.id}`,
            sourceId: source.id,
            targetId: target.id,
            matchType: matchType,
        };

        if (!existingMappings.some(m => m.id === newMapping.id)) {
            if (existingMappings.some(m => m.targetId === newMapping.targetId)) {
                toast({
                    title: "Mapping Conflict",
                    description: `Target ${target.name} is already mapped. Multiple source fields can be mapped to one target for concatenation.`,
                });
            } else {
                newMappings.push(newMapping);
                existingMappings.push(newMapping); // Add to temp list to check subsequent mappings in this loop
            }
        }
    }
    
    if (sourceIsParent && targetIsParent) {
        // Recursive parent-to-parent mapping by name
        const mapRecursive = (sourceParent: XsdNode, targetParent: XsdNode) => {
            const sourceChildren = sourceParent.children || [];
            const targetChildren = targetParent.children || [];

            sourceChildren.forEach(sourceChild => {
                const targetChild = targetChildren.find(tc => tc.name === sourceChild.name);
                if (targetChild) {
                    const sourceHasChildren = sourceChild.children && sourceChild.children.length > 0;
                    const targetHasChildren = targetChild.children && targetChild.children.length > 0;

                    if (sourceHasChildren && targetHasChildren) {
                        // If both are parents, recurse
                        mapRecursive(sourceChild, targetChild);
                    } else if (!sourceHasChildren && !targetHasChildren) {
                        // If both are leaves, create mapping
                        createMappingIfNotExists(sourceChild, targetChild, 'auto');
                    }
                }
            });
        };
        
        mapRecursive(draggingNode, targetNode);

        if (newMappings.length > 0) {
           toast({
                variant: 'success',
                title: 'Auto-Mapped Children',
                description: `Created ${newMappings.length} new mappings between child nodes.`
            })
        }

    } else if (!sourceIsParent && !targetIsParent) {
        // Single node to single node mapping
        createMappingIfNotExists(draggingNode, targetNode, 'manual');

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
  
  const deleteMappingByNode = (nodeId: string) => {
    const node = findNodeById(sourceSchema, nodeId) || findNodeById(targetSchema, nodeId);
    if (!node) return;

    let mappingsToDelete = new Set<string>();

    const getDescendantIds = (currentNode: XsdNode): string[] => {
      let ids = [currentNode.id];
      if (currentNode.children) {
        currentNode.children.forEach(child => {
          ids = [...ids, ...getDescendantIds(child)];
        });
      }
      return ids;
    };

    const nodeAndDescendantIds = getDescendantIds(node);

    mappings.forEach(m => {
      if (nodeAndDescendantIds.includes(m.sourceId) || nodeAndDescendantIds.includes(m.targetId)) {
        mappingsToDelete.add(m.id);
      }
    });

    if (mappingsToDelete.size > 0) {
      setState({ mappings: mappings.filter(m => !mappingsToDelete.has(m.id)) });
      toast({
        variant: "success",
        title: "Mappings Cleared",
        description: `Removed ${mappingsToDelete.size} mapping(s).`,
      });
    }
  };

  const findNodeById = (schema: XsdNode | null, id: string): XsdNode | null => {
    if (!schema) return null;
    if (schema.id === id) return schema;
    if (schema.children) {
      for (const child of schema.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };


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

  const handleResetMappings = () => {
    setState({ mappings: [] });
    toast({
      variant: "success",
      title: "Mappings Reset",
      description: "All mappings have been cleared.",
    });
  }

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
       <div className="flex items-center justify-between bg-card rounded-lg p-3 border">
        <Button variant="outline" onClick={() => router.push('/new/swagger')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
              <Button variant="destructive">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset all mappings
              </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action will permanently delete all your current mappings. You cannot undo this action.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetMappings}>
                      Continue
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={() => router.push('/new/generate-xslt')}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div ref={canvasRef} className="flex-1 relative bg-card rounded-lg overflow-auto">
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
            onClearMapping={deleteMappingByNode}
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
            onClearMapping={deleteMappingByNode}
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
      </div>

       {selectedMapping && (
        <TransformationDialog
          isOpen={isTransformationDialogOpen}
          onOpenChange={setTransformationDialogOpen}
          mapping={selectedMapping}
          onSave={handleSaveTransformation}
        />
      )}
    </div>
  )
}
