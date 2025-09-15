
"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import type { XsdNode, Mapping, Transformation } from '@/types'
import { generateXslt } from '@/lib/xslt-generator'
import { generateXmlPreview } from '@/lib/xml-preview-generator'
import XsdPanel from '@/components/xsd-panel'
import MappingCanvas from '@/components/mapping-canvas'
import TransformationDialog from '@/components/transformation-dialog'
import PreviewDialog from '@/components/preview-dialog'
import Header from '@/components/header'
import { useAppContext } from '@/context/AppContext'
import { useToast } from '@/hooks/use-toast'
import { parseXsdToXsdNode } from '@/lib/xsd-parser'


export default function MapperStep() {
  const { 
    sourceSchema, 
    targetSchema, 
    mappings, 
    setState, 
    inputXsd,
    responseXsd,
    swaggerFile 
  } = useAppContext();
  const { toast } = useToast();
  
  const [draggingNode, setDraggingNode] = useState<XsdNode | null>(null)
  
  const [selectedMapping, setSelectedMapping] = useState<Mapping | null>(null)
  const [isTransformationDialogOpen, setTransformationDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const nodeRefs = useRef<Map<string, HTMLElement | null>>(new Map())
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasKey, setCanvasKey] = useState(0)

  const rerenderCanvas = useCallback(() => {
     setTimeout(() => setCanvasKey(prev => prev + 1), 50)
  }, [])

  useEffect(() => {
    const mainContainer = canvasRef.current;
    if (!mainContainer) return;

    window.addEventListener('resize', rerenderCanvas)
    mainContainer.addEventListener('scroll', rerenderCanvas)

    const sourcePanel = document.getElementById('source-panel-content');
    const targetPanel = document.getElementById('target-panel-content');
    sourcePanel?.addEventListener('scroll', rerenderCanvas);
    targetPanel?.addEventListener('scroll', rerenderCanvas);

    rerenderCanvas();

    return () => {
      window.removeEventListener('resize', rerenderCanvas)
      mainContainer.removeEventListener('scroll', rerenderCanvas)
      sourcePanel?.removeEventListener('scroll', rerenderCanvas);
      targetPanel?.removeEventListener('scroll', rerenderCanvas);
    }
  }, [rerenderCanvas])

  const handleFileLoad = (schemaContent: string, type: 'source' | 'target') => {
    const newSchema = parseXsdToXsdNode(schemaContent, type);
    if (!newSchema) {
        toast({
            variant: "destructive",
            title: "Parsing Error",
            description: "Could not parse the uploaded XSD file.",
        });
        return;
    }

    if (type === 'source') {
      setState({ sourceSchema: newSchema, inputXsd: schemaContent, mappings: [] });
    } else {
      // Note: We don't expect a target file upload on this screen if coming from swagger flow, but this handles the direct-to-mapper case.
      setState({ targetSchema: newSchema, responseXsd: schemaContent, mappings: [] });
    }
    rerenderCanvas();
  }
  
  const handleDragStart = (node: XsdNode) => {
    if (!node.children || node.children.length === 0) {
      setDraggingNode(node)
    }
  }

  const handleDragEnd = () => {
    setDraggingNode(null)
  }
  
  const handleDrop = (targetNode: XsdNode) => {
    if (draggingNode && (!targetNode.children || targetNode.children.length === 0)) {
      if (draggingNode.children || targetNode.children) {
        return;
      }
      
      const newMapping: Mapping = {
        id: `${draggingNode.id}-${targetNode.id}`,
        sourceId: draggingNode.id,
        targetId: targetNode.id,
      }
      
      if(mappings.some(m => m.id === newMapping.id)) {
        return;
      }

      setState({ mappings: [...mappings, newMapping] });
      rerenderCanvas()
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
  
  const handleDownloadXslt = () => {
    if (!sourceSchema || !targetSchema) {
      toast({ variant: 'destructive', title: "Missing Schemas", description: "Please load both source and target schemas." });
      return;
    }
    const xsltContent = generateXslt(mappings, sourceSchema, targetSchema)
    const blob = new Blob([xsltContent], { type: 'application/xml;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'transformation.xslt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreview = () => {
    if (!targetSchema) {
      toast({ variant: 'destructive', title: "Missing Target Schema", description: "Please load a target schema to generate a preview." });
      return;
    }
    const preview = generateXmlPreview(mappings, targetSchema)
    setPreviewContent(preview)
    setPreviewDialogOpen(true)
  }

  return (
    <div className="flex flex-col bg-background text-foreground h-full">
      <Header onDownload={handleDownloadXslt} onPreview={handlePreview} />
      <main ref={canvasRef} className="flex-1 overflow-auto relative p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
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
      </main>

      {selectedMapping && (
        <TransformationDialog
          isOpen={isTransformationDialogOpen}
          onOpenChange={setTransformationDialogOpen}
          mapping={selectedMapping}
          onSave={handleSaveTransformation}
        />
      )}

      <PreviewDialog
        isOpen={isPreviewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        content={previewContent}
      />
    </div>
  )
}
