"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Mapping, Transformation, TransformationType } from "@/types"

interface TransformationDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  mapping: Mapping
  onSave: (transformation: Transformation) => void
}

const transformationOptions: { value: TransformationType; label: string, description: string }[] = [
  { value: "NONE", label: "None", description: "Direct 1-to-1 mapping." },
  { value: "UPPERCASE", label: "Uppercase", description: "Converts text to uppercase." },
  { value: "CONCAT", label: "Concatenate", description: "Joins multiple fields. (Simulated)" },
  { value: "SPLIT", label: "Split", description: "Splits a field into multiple. (Simulated)" },
  { value: "MERGE", label: "Merge", description: "Merges fields. (Simulated)" },
]

export default function TransformationDialog({
  isOpen,
  onOpenChange,
  mapping,
  onSave,
}: TransformationDialogProps) {
  const [type, setType] = useState<TransformationType>(mapping.transformation?.type || "NONE")
  const [params, setParams] = useState(mapping.transformation?.params || {})

  useEffect(() => {
    setType(mapping.transformation?.type || "NONE")
    setParams(mapping.transformation?.params || {})
  }, [mapping])

  const handleSave = () => {
    onSave({ type, params })
  }

  const selectedOption = transformationOptions.find(opt => opt.value === type);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Transformation</DialogTitle>
          <DialogDescription>
            Apply a transformation for the mapping from{" "}
            <span className="font-semibold text-primary">{mapping.sourceId.split('-').slice(1).join('-')}</span> to{" "}
            <span className="font-semibold text-primary">{mapping.targetId.split('-').slice(1).join('-')}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="transformation-type">Transformation</Label>
            <Select value={type} onValueChange={(value: TransformationType) => setType(value)}>
              <SelectTrigger id="transformation-type">
                <SelectValue placeholder="Select a transformation" />
              </SelectTrigger>
              <SelectContent>
                {transformationOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedOption && <p className="text-sm text-muted-foreground">{selectedOption.description}</p>}
          </div>

          {type === 'CONCAT' && (
            <div className="space-y-2">
              <Label htmlFor="concat-delimiter">Delimiter</Label>
              <Input
                id="concat-delimiter"
                value={params.delimiter || ""}
                onChange={e => setParams({ ...params, delimiter: e.target.value })}
                placeholder="e.g., a space ' '"
              />
            </div>
          )}
          {type === 'SPLIT' && (
             <div className="space-y-2">
             <Label htmlFor="split-delimiter">Delimiter</Label>
             <Input
               id="split-delimiter"
               value={params.delimiter || ""}
               onChange={e => setParams({ ...params, delimiter: e.target.value })}
               placeholder="e.g., a comma ','"
             />
           </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Transformation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
