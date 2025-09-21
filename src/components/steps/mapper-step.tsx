
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

const setConfig = {
  set1: { name: 'Request Mapping' },
  set2: { name: 'Response Mapping' },
  set3: { name: 'Error Mapping' },
};

export default function MapperStep() {
  const router = useRouter();
  const { 
    sourceSchemas, 
    targetSchemas, 
    mappings, 
    setState,
    lastVisitedStep,
  } = useAppContext();
  const { toast } = useToast();
  
  const [activeSet, setActiveSet] = useState<MappingSet>('set1');
  const [draggingNode, setDraggingNode] = useState<XsdNode | null>(null)
  
  const [selectedMapping, setSelectedMapping] = useState<Mapping | null>(null)
  const [isTransformationDialogOpen, setTransformationDialogOpen] = useState(false)
  
  const nodeRefs = useRef<Map<string, HTMLElement | null>>(new Map())
  const canvasRef = useRef<HTMLDivElement>(null);

  const [canvasKey, setCanvasKey] = useState(0)

  const rerenderCanvas = useCallback(() => {
     setTimeout(() => setCanvasKey(prev => prev + 1), 50)
  }, [])

  useEffect(() => {
    const mainContainer = canvasRef.current;
    if (!mainContainer) return;

    const resizeObserver = new ResizeObserver(rerenderCanvas);
    resizeObserver.observe(mainContainer);
    
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
        
        // When a file is loaded for a specific set, we should only clear the mappings for that set.
        const newMappingsForSet: Mapping[] = [];

        if (type === 'source') {
          setState({ 
            sourceSchemas: { ...sourceSchemas, [activeSet]: newSchema },
            mappings: { ...mappings, [activeSet]: newMappingsForSet },
          });
        } else {
          setState({ 
            targetSchemas: { ...targetSchemas, [activeSet]: newSchema },
            mappings: { ...mappings, [activeSet]: newMappingsForSet },
          });
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
    const sourceSchema = sourceSchemas[activeSet];
    const targetSchema = targetSchemas[activeSet];
    if (!draggingNode || !sourceSchema || !targetSchema) return;

    const currentMappings = mappings[activeSet];
    const newMappings: Mapping[] = [];
    
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
                if (!currentMappings.some(m => m.id === newMapping.id) && !newMappings.some(m => m.id === newMapping.id)) {
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
    
    const sourceIsParent = !!(draggingNode.children && draggingNode.children.length > 0);
    const targetIsParent = !!(targetNode.children && targetNode.children.length > 0);
    
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

  const handleResetCurrentSet = () => {
    setState({ mappings: { ...mappings, [activeSet]: [] } });
    toast({
      variant: "success",
      title: "Current Set Reset",
      description: `All mappings in "${setConfig[activeSet].name}" have been cleared.`,
    });
  }

  const handleResetAllMappings = () => {
    setState({ mappings: { set1: [], set2: [], set3: [] } });
    toast({
      variant: "success",
      title: "All Mappings Reset",
      description: "All mappings in all sets have been cleared.",
    });
  }

  const handleProceed = () => {
    setState({ lastVisitedStep: '/new/mapper' });
    router.push('/new/preview-xslt');
  }
  
  const handleBack = () => {
    router.push(lastVisitedStep || '/new/preview-swagger-xsd');
  }

  const areRequiredSetsMapped = mappings.set1.length > 0 && mappings.set2.length > 0;
  
  const sets: MappingSet[] = ['set1', 'set2', 'set3'];

  return (
    <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-center bg-card rounded-lg p-3 border gap-4">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline">
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset Current Set
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently delete all your current mappings in <strong>{setConfig[activeSet].name}</strong>. You cannot undo this action.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetCurrentSet}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset All Sets
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
                        <AlertDialogAction onClick={handleResetAllMappings}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        <div className="flex-1 flex flex-col bg-card border rounded-lg">
             <div className="flex-shrink-0 p-2 bg-muted/50 rounded-t-lg border-b">
                <div className="flex items-center justify-center gap-2">
                    {sets.map((set) => (
                        <Button
                            key={set}
                            variant={activeSet === set ? 'default' : 'secondary'}
                            onClick={() => setActiveSet(set)}
                            className="flex-1"
                        >
                            {setConfig[set].name}
                        </Button>
                    ))}
                </div>
            </div>
            <div ref={canvasRef} className="relative overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 sm:p-6 md:p-8">
                    <XsdPanel title="Source XSD" schema={sourceSchemas[activeSet]} type="source" onFileLoad={(schemaContent) => handleFileLoad(schemaContent, 'source')} onDragStart={handleDragStart} onDragEnd={handleDragEnd} nodeRefs={nodeRefs} mappings={mappings[activeSet]} draggingNodeId={draggingNode?.id} rerenderCanvas={rerenderCanvas} activeSet={activeSet} />
                    <XsdPanel title="Target XSD" schema={targetSchemas[activeSet]} type="target" onFileLoad={(schemaContent) => handleFileLoad(schemaContent, 'target')} onDrop={handleDrop} nodeRefs={nodeRefs} mappings={mappings[activeSet]} draggingNodeId={draggingNode?.id} rerenderCanvas={rerenderCanvas} activeSet={activeSet} />
                </div>
                {canvasRef.current && (
                    <MappingCanvas
                        key={`${activeSet}-${canvasKey}`}
                        mappings={mappings[activeSet]}
                        nodeRefs={nodeRefs.current}
                        canvasRef={canvasRef.current}
                        onMappingClick={handleOpenTransformationDialog}
                        onMappingDelete={deleteMapping}
                    />
                )}
            </div>
        </div>


        <div className="flex items-center justify-between bg-card rounded-lg p-3 border">
            <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!areRequiredSetsMapped}>
                    Next: Generate XSLT <ArrowRight className="ml-2 h-4 w-4" />
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
                  <AlertDialogAction onClick={handleProceed}>
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

    