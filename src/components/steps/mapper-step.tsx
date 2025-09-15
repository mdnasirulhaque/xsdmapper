
"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import type { XsdNode, Mapping, Transformation, MappingSet, MappingSets } from '@/types'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MapperStep() {
  const router = useRouter();
  const { 
    sourceSchema, 
    targetSchema, 
    mappings, 
    setState, 
  } = useAppContext();
  const { toast } = useToast();
  
  const [activeSet, setActiveSet] = useState<MappingSet>('set1');
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
  }, [rerenderCanvas, activeSet])

  const handleFileLoad = (schemaContent: string, type: 'source' | 'target') => {
    try {
        const newSchema = parseXsdToXsdNode(schemaContent, type);
        if (!newSchema) {
            throw new Error("Could not parse the uploaded XSD file.");
        }
        
        const resetMappings: MappingSets = { set1: [], set2: [], set3: [] };

        if (type === 'source') {
          setState({ sourceSchema: newSchema, mappings: resetMappings });
        } else {
          setState({ targetSchema: newSchema, mappings: resetMappings });
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

    const currentMappings = mappings[activeSet];
    const sourceIsParent = !!(draggingNode.children && draggingNode.children.length > 0);
    const targetIsParent = !!(targetNode.children && targetNode.children.length > 0);
    let newMappings: Mapping[] = [];
    const existingMappingIds = new Set(currentMappings.map(m => m.id));

    const createMapping = (sourceNode: XsdNode, targetNode: XsdNode) => {
        const newMapping: Mapping = {
            id: `${sourceNode.id}-${targetNode.id}`,
            sourceId: sourceNode.id,
            targetId: targetNode.id,
        };
        if (existingMappingIds.has(newMapping.id)) return; // Avoid duplicates

        if (currentMappings.some(m => m.targetId === newMapping.targetId)) {
             toast({
                title: "Mapping for Concatenation",
                description: `Target ${targetNode.name} is already mapped. Creating an additional mapping.`,
            });
        }
        newMappings.push(newMapping);
        existingMappingIds.add(newMapping.id);
    }

    const mapBySequence = (sourceParent: XsdNode, targetParent: XsdNode) => {
        const sourceChildren = sourceParent.children || [];
        const targetChildren = targetParent.children || [];
        const shorterLength = Math.min(sourceChildren.length, targetChildren.length);

        for (let i = 0; i < shorterLength; i++) {
            const sourceChild = sourceChildren[i];
            const targetChild = targetChildren[i];
            const sourceChildIsParent = !!(sourceChild.children && sourceChild.children.length > 0);
            const targetChildIsParent = !!(targetChild.children && targetChild.children.length > 0);

            if (!sourceChildIsParent && !targetChildIsParent) {
                createMapping(sourceChild, targetChild);
            }
            else if (sourceChildIsParent && targetChildIsParent) {
                mapBySequence(sourceChild, targetChild);
            }
        }
    };

    if (sourceIsParent && targetIsParent) {
        mapBySequence(draggingNode, targetNode);
        if (newMappings.length > 0) {
            toast({
                variant: 'success',
                title: 'Auto-Mapped Child Fields',
                description: `Created ${newMappings.length} new mappings based on sequence.`
            });
        }
    } else if (!sourceIsParent && !targetIsParent) {
        createMapping(draggingNode, targetNode);
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid Mapping',
            description: 'Cannot map a parent node to a child node, or vice-versa.'
        });
        return;
    }

    if (newMappings.length > 0) {
        setState({ mappings: { ...mappings, [activeSet]: [...currentMappings, ...newMappings] } });
        rerenderCanvas();
    }
  }
  
  const deleteMapping = (mappingId: string) => {
    setState({ mappings: { ...mappings, [activeSet]: mappings[activeSet].filter(m => m.id !== mappingId) }});
  }

  const handleOpenTransformationDialog = (mapping: Mapping) => {
    setSelectedMapping(mapping)
    setTransformationDialogOpen(true)
  }

  const handleSaveTransformation = (transformation: Transformation) => {
    if (selectedMapping) {
      setState({ mappings: { ...mappings, [activeSet]: mappings[activeSet].map(m => 
        m.id === selectedMapping.id ? { ...m, transformation } : m
      )}});
    }
    setTransformationDialogOpen(false)
    setSelectedMapping(null)
  }

  const handleResetMappings = () => {
    setState({ mappings: { set1: [], set2: [], set3: [] } });
    toast({
      variant: "success",
      title: "Mappings Reset",
      description: "All mappings in all sets have been cleared.",
    });
  }

  const areAllSetsMapped = mappings.set1.length > 0 && mappings.set2.length > 0 && mappings.set3.length > 0;

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-center bg-card rounded-lg p-3 border">
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
                            This action will permanently delete all your current mappings across all sets. You cannot undo this action.
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
        </div>

        <Tabs value={activeSet} onValueChange={(value) => setActiveSet(value as MappingSet)} className="flex-1 flex flex-col gap-4">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="set1">Set 1</TabsTrigger>
                <TabsTrigger value="set2">Set 2</TabsTrigger>
                <TabsTrigger value="set3">Set 3</TabsTrigger>
            </TabsList>
             {(['set1', 'set2', 'set3'] as MappingSet[]).map((set) => (
                <TabsContent key={set} value={set} className="flex-1 flex flex-col m-0">
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
                                mappings={mappings[activeSet]}
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
                                mappings={mappings[activeSet]}
                                draggingNodeId={draggingNode?.id}
                                rerenderCanvas={rerenderCanvas}
                            />
                        </div>
                        
                        {canvasRef.current && activeSet === set && (
                        <MappingCanvas
                            key={`${set}-${canvasKey}`}
                            mappings={mappings[set]}
                            nodeRefs={nodeRefs.current}
                            canvasRef={canvasRef.current}
                            onMappingClick={handleOpenTransformationDialog}
                            onMappingDelete={deleteMapping}
                        />
                        )}
                    </div>
                 </TabsContent>
            ))}
        </Tabs>

        <div className="flex items-center justify-between bg-card rounded-lg p-3 border">
            <Button variant="outline" onClick={() => router.push('/new/swagger')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!areAllSetsMapped}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Mappings</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you are finished with the mappings and want to proceed to the XSLT generation step?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => router.push('/new/generate-xslt')}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
 