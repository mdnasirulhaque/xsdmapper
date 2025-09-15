
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
  const set1Ref = useRef<HTMLDivElement>(null);
  const set2Ref = useRef<HTMLDivElement>(null);
  const set3Ref = useRef<HTMLDivElement>(null);
  const canvasRefs: Record<MappingSet, React.RefObject<HTMLDivElement>> = {
    set1: set1Ref,
    set2: set2Ref,
    set3: set3Ref,
  };
  const [canvasKey, setCanvasKey] = useState(0)

  const rerenderCanvas = useCallback(() => {
     setTimeout(() => setCanvasKey(prev => prev + 1), 50)
  }, [])

  useEffect(() => {
    const mainContainer = canvasRefs[activeSet].current;
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
    if (!draggingNode || !sourceSchema || !targetSchema) return;

    const currentMappings = mappings[activeSet];
    const sourceIsParent = !!(draggingNode.children && draggingNode.children.length > 0);
    const targetIsParent = !!(targetNode.children && targetNode.children.length > 0);
    let newMappings: Mapping[] = [];
    
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
                 const newMapping: Mapping = {
                    id: `${sourceChild.id}-${targetChild.id}`,
                    sourceId: sourceChild.id,
                    targetId: targetChild.id,
                };
                if (!currentMappings.some(m => m.id === newMapping.id)) {
                    newMappings.push(newMapping);
                }
            }
            else if (sourceChildIsParent && targetChildIsParent) {
                mapBySequence(sourceChild, targetChild);
            }
        }
    };

    const createMapping = (sourceNode: XsdNode, targetNode: XsdNode) => {
        const newMapping: Mapping = {
            id: `${sourceNode.id}-${targetNode.id}`,
            sourceId: sourceNode.id,
            targetId: targetNode.id,
        };
        if (currentMappings.some(m => m.id === newMapping.id)) return;

        if (currentMappings.some(m => m.targetId === newMapping.targetId)) {
             toast({
                title: "Mapping for Concatenation",
                description: `Target ${targetNode.name} is already mapped. Creating an additional mapping.`,
            });
        }
        newMappings.push(newMapping);
    }

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
    <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
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

        <Tabs value={activeSet} onValueChange={(value) => setActiveSet(value as MappingSet)} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="set1">Set 1</TabsTrigger>
                <TabsTrigger value="set2">Set 2</TabsTrigger>
                <TabsTrigger value="set3">Set 3</TabsTrigger>
            </TabsList>
            <TabsContent value="set1" ref={canvasRefs.set1} className="flex-1 flex flex-col m-0 overflow-hidden relative bg-card rounded-b-lg border border-t-0">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 h-full p-4 sm:p-6 md:p-8 overflow-auto">
                    <XsdPanel title="Source Schema" schema={sourceSchema} type="source" onFileLoad={(schemaContent) => handleFileLoad(schemaContent, 'source')} onDragStart={handleDragStart} onDragEnd={handleDragEnd} nodeRefs={nodeRefs} mappings={mappings.set1} draggingNodeId={draggingNode?.id} rerenderCanvas={rerenderCanvas}/>
                    <XsdPanel title="Target Schema" schema={targetSchema} type="target" onFileLoad={(schemaContent) => handleFileLoad(schemaContent, 'target')} onDrop={handleDrop} nodeRefs={nodeRefs} mappings={mappings.set1} draggingNodeId={draggingNode?.id} rerenderCanvas={rerenderCanvas}/>
                </div>
                {canvasRefs.set1.current && activeSet === 'set1' && ( <MappingCanvas key={`set1-${canvasKey}`} mappings={mappings.set1} nodeRefs={nodeRefs.current} canvasRef={canvasRefs.set1.current} onMappingClick={handleOpenTransformationDialog} onMappingDelete={deleteMapping}/>)}
            </TabsContent>
            <TabsContent value="set2" ref={canvasRefs.set2} className="flex-1 flex flex-col m-0 overflow-hidden relative bg-card rounded-b-lg border border-t-0">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 h-full p-4 sm:p-6 md:p-8 overflow-auto">
                    <XsdPanel title="Source Schema" schema={sourceSchema} type="source" onFileLoad={(schemaContent) => handleFileLoad(schemaContent, 'source')} onDragStart={handleDragStart} onDragEnd={handleDragEnd} nodeRefs={nodeRefs} mappings={mappings.set2} draggingNodeId={draggingNode?.id} rerenderCanvas={rerenderCanvas}/>
                    <XsdPanel title="Target Schema" schema={targetSchema} type="target" onFileLoad={(schemaContent) => handleFileLoad(schemaContent, 'target')} onDrop={handleDrop} nodeRefs={nodeRefs} mappings={mappings.set2} draggingNodeId={draggingNode?.id} rerenderCanvas={rerenderCanvas}/>
                </div>
                {canvasRefs.set2.current && activeSet === 'set2' && (<MappingCanvas key={`set2-${canvasKey}`} mappings={mappings.set2} nodeRefs={nodeRefs.current} canvasRef={canvasRefs.set2.current} onMappingClick={handleOpenTransformationDialog} onMappingDelete={deleteMapping} />)}
            </TabsContent>
            <TabsContent value="set3" ref={canvasRefs.set3} className="flex-1 flex flex-col m-0 overflow-hidden relative bg-card rounded-b-lg border border-t-0">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 h-full p-4 sm:p-6 md:p-8 overflow-auto">
                    <XsdPanel title="Source Schema" schema={sourceSchema} type="source" onFileLoad={(schemaContent) => handleFileLoad(schemaContent, 'source')} onDragStart={handleDragStart} onDragEnd={handleDragEnd} nodeRefs={nodeRefs} mappings={mappings.set3} draggingNodeId={draggingNode?.id} rerenderCanvas={rerenderCanvas} />
                    <XsdPanel title="Target Schema" schema={targetSchema} type="target" onFileLoad={(schemaContent) => handleFileLoad(schemaContent, 'target')} onDrop={handleDrop} nodeRefs={nodeRefs} mappings={mappings.set3} draggingNodeId={draggingNode?.id} rerenderCanvas={rerenderCanvas}/>
                </div>
                {canvasRefs.set3.current && activeSet === 'set3' && (<MappingCanvas key={`set3-${canvasKey}`} mappings={mappings.set3} nodeRefs={nodeRefs.current} canvasRef={canvasRefs.set3.current} onMappingClick={handleOpenTransformationDialog} onMappingDelete={deleteMapping} />)}
            </TabsContent>
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
}

    