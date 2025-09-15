"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, X } from 'lucide-react'
import type { Mapping } from '@/types'
import { cn } from '@/lib/utils'

interface MappingCanvasProps {
  mappings: Mapping[];
  nodeRefs: Map<string, HTMLElement | null>;
  canvasRef: HTMLDivElement;
  onMappingClick: (mapping: Mapping) => void;
  onMappingDelete: (mappingId: string) => void;
}

interface LinePath {
  id: string;
  path: string;
  midPoint: { x: number; y: number };
  matchType?: 'auto' | 'manual';
}

export default function MappingCanvas({ mappings, nodeRefs, canvasRef, onMappingClick, onMappingDelete }: MappingCanvasProps) {
  const [lines, setLines] = useState<LinePath[]>([])
  const [hoveredLine, setHoveredLine] = useState<string | null>(null)

  useEffect(() => {
    const canvasRect = canvasRef.getBoundingClientRect()
    const scrollTop = canvasRef.scrollTop;

    const newLines: LinePath[] = []

    mappings.forEach(mapping => {
      const sourceEl = nodeRefs.get(mapping.sourceId)
      const targetEl = nodeRefs.get(mapping.targetId)

      if (sourceEl && targetEl) {
        const sourceRect = sourceEl.getBoundingClientRect()
        const targetRect = targetEl.getBoundingClientRect()

        const startX = sourceRect.right - canvasRect.left
        const startY = sourceRect.top - canvasRect.top + scrollTop + sourceRect.height / 2
        const endX = targetRect.left - canvasRect.left
        const endY = targetRect.top - canvasRect.top + scrollTop + targetRect.height / 2

        const controlX1 = startX + 60
        const controlY1 = startY
        const controlX2 = endX - 60
        const controlY2 = endY
        
        const path = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`
        
        const midPoint = {
          x: (startX + endX) / 2,
          y: (startY + endY) / 2
        }

        newLines.push({ id: mapping.id, path, midPoint, matchType: mapping.matchType })
      }
    })
    setLines(newLines)
  }, [mappings, nodeRefs, canvasRef])

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <svg width="100%" height="100%" style={{ top: 0, left: 0, position: 'absolute' }}>
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" />
          </marker>
          <marker
            id="arrowhead-warning"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--warning))" />
          </marker>
           <marker
            id="arrowhead-accent"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--accent))" />
          </marker>
        </defs>
        <AnimatePresence>
          {lines.map(({ id, path, matchType }) => (
            <motion.path
              key={id}
              d={path}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              strokeWidth="2"
              fill="none"
              className={cn(
                "transition-all",
                hoveredLine === id ? "stroke-accent" :
                matchType === 'auto' ? "stroke-warning/70" : "stroke-primary/70"
              )}
              markerEnd={
                hoveredLine === id ? "url(#arrowhead-accent)" :
                matchType === 'auto' ? "url(#arrowhead-warning)" : "url(#arrowhead)"
              }
            />
          ))}
        </AnimatePresence>
        {lines.map(({ id, midPoint, matchType }) => {
          const mapping = mappings.find(m => m.id === id);
          if (!mapping) return null;
          return (
            <g 
              key={`control-${id}`}
              transform={`translate(${midPoint.x}, ${midPoint.y})`}
              className="pointer-events-auto cursor-pointer"
              onMouseEnter={() => setHoveredLine(id)}
              onMouseLeave={() => setHoveredLine(null)}
            >
              <AnimatePresence>
                {hoveredLine === id && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center gap-2"
                  >
                    <g transform="translate(-40, -20)">
                       <rect x="0" y="0" width="80" height="40" rx="20" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
                       <g onClick={() => onMappingClick(mapping)} transform="translate(12, 10)">
                         <Wand2 className="text-muted-foreground hover:text-primary" size={20} />
                       </g>
                       <g onClick={() => onMappingDelete(id)} transform="translate(48, 10)">
                         <X className="text-muted-foreground hover:text-destructive" size={20} />
                       </g>
                    </g>
                  </motion.g>
                )}
              </AnimatePresence>
              <AnimatePresence>
                 {hoveredLine !== id && (
                    <motion.circle 
                        r={mapping.transformation ? 6 : 4}
                        fill={mapping.transformation ? 
                            (matchType === 'auto' ? "hsl(var(--warning))" : "hsl(var(--primary))") : 
                            "hsl(var(--card))"
                        }
                        stroke={matchType === 'auto' ? "hsl(var(--warning))" : "hsl(var(--primary))"} 
                        strokeWidth="2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                     />
                 )}
              </AnimatePresence>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
