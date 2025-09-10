"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import type { XsdNode, Mapping, Transformation, TransformationType } from '@/types'
import { sourceSchema as initialSourceSchema, targetSchema as initialTargetSchema } from '@/lib/mock-data'
import { generateXslt } from '@/lib/xslt-generator'
import { generateXmlPreview } from '@/lib/xml-preview-generator'
import PageHeader from '@/components/page-header'
import XsdPanel from '@/components/xsd-panel'
import MappingCanvas from '@/components/mapping-canvas'
import TransformationDialog from '@/components/transformation-dialog'
import PreviewDialog from '@/components/preview-dialog'

const MAPPINGS_STORAGE_KEY = 'xsd-mapper-mappings';

export default function Home() {
  const [sourceSchema, setSourceSchema] = useState<XsdNode | null>(initialSourceSchema)
  const [targetSchema, setTargetSchema] = useState<XsdNode | null>(initialTargetSchema)
  const [mappings, setMappings] = useState<Mapping[]>([])
  const [draggingNode, setDraggingNode] = useState<XsdNode | null>(null)
  
  const [selectedMapping, setSelectedMapping] = useState<Mapping | null>(null)
  const [isTransformationDialogOpen, setTransformationDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const nodeRefs = useRef<Map<string, HTMLElement | null>>(new Map())
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasKey, setCanvasKey] = useState(0)

  // Load mappings from local storage on initial render
  useEffect(() => {
    try {
      const savedMappings = localStorage.getItem(MAPPINGS_STORAGE_KEY);
      if (savedMappings) {
        setMappings(JSON.parse(savedMappings));
      }
    } catch (error) {
      console.error("Failed to load mappings from local storage", error);
    }
  }, []);

  // Save mappings to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(MAPPINGS_STORAGE_KEY, JSON.stringify(mappings));
    } catch (error) {
      console.error("Failed to save mappings to local storage", error);
    }
  }, [mappings]);

  const rerenderCanvas = useCallback(() => {
    setCanvasKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    const mainContainer = canvasRef.current;
    if (!mainContainer) return;

    window.addEventListener('resize', rerenderCanvas)
    mainContainer.addEventListener('scroll', rerenderCanvas)

    return () => {
      window.removeEventListener('resize', rerenderCanvas)
      mainContainer.removeEventListener('scroll', rerenderCanvas)
    }
  }, [rerenderCanvas])

  const handleFileLoad = (schema: XsdNode, type: 'source' | 'target') => {
    if (type === 'source') {
      setSourceSchema(schema)
    } else {
      setTargetSchema(schema)
    }
    // Reset mappings if a new schema is loaded
    setMappings([])
    rerenderCanvas()
  }
  
  const handleDragStart = (node: XsdNode) => {
    setDraggingNode(node)
  }

  const handleDragEnd = () => {
    setDraggingNode(null)
  }
  
  const handleDrop = (targetNode: XsdNode) => {
    if (draggingNode) {
      // Prevent mapping to itself or non-leaf nodes
      if (draggingNode.children || targetNode.children) {
        return;
      }
      
      const newMapping: Mapping = {
        id: `${draggingNode.id}-${targetNode.id}`,
        sourceId: draggingNode.id,
        targetId: targetNode.id,
      }
      
      // Check if this exact mapping already exists
      if(mappings.some(m => m.id === newMapping.id)) {
        return;
      }

      setMappings(prev => [...prev, newMapping])
      rerenderCanvas()
    }
  }
  
  const deleteMapping = (mappingId: string) => {
    setMappings(prev => prev.filter(m => m.id !== mappingId))
  }

  const handleOpenTransformationDialog = (mapping: Mapping) => {
    setSelectedMapping(mapping)
    setTransformationDialogOpen(true)
  }

  const handleSaveTransformation = (transformation: Transformation) => {
    if (selectedMapping) {
      setMappings(prev => prev.map(m => 
        m.id === selectedMapping.id ? { ...m, transformation } : m
      ))
    }
    setTransformationDialogOpen(false)
    setSelectedMapping(null)
  }
  
  const handleDownloadXslt = () => {
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
    const preview = generateXmlPreview(mappings, targetSchema)
    setPreviewContent(preview)
    setPreviewDialogOpen(true)
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <PageHeader onDownload={handleDownloadXslt} onPreview={handlePreview} />
      <main ref={canvasRef} className="flex-1 overflow-auto relative p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <XsdPanel
            title="Source Schema"
            schema={sourceSchema}
            type="source"
            onFileLoad={(schema) => handleFileLoad(schema, 'source')}
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
            onFileLoad={(schema) => handleFileLoad(schema, 'target')}
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
