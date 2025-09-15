
"use client"

import { cn } from "@/lib/utils"
import { FileUp, Link, FileDown, Check, FileJson, Eye } from "lucide-react"
import NextLink from 'next/link';


const steps = [
  { name: "Upload XML", href: "/new/upload" },
  { name: "Preview XSD", href: "/new/preview-xsd" },
  { name: "Upload Swagger", href: "/new/swagger" },
  { name: "Map Fields", href: "/new/mapper"},
  { name: "Generate XSLT", href: "#"},
]

interface StepperProps {
  currentStep: number
}

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => {
            const isCompleted = currentStep > stepIdx + 1;
            const isCurrent = currentStep === stepIdx + 1;
            return (
                <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "flex-1" : "")}>
                   {stepIdx !== steps.length - 1 ? (
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className={cn(
                        "h-0.5 w-full",
                         isCompleted ? "bg-primary" : "bg-gray-200"
                      )} />
                    </div>
                  ) : null}
                  <NextLink href={step.href} className={cn(
                        "relative flex h-8 w-8 items-center justify-center rounded-full",
                        isCompleted ? "bg-primary hover:bg-primary/80" : "bg-white border-2 border-gray-300",
                        isCurrent && "border-primary"
                    )}>
                     {isCompleted ? <Check className="h-5 w-5 text-white" /> : <span className="sr-only">{step.name}</span>}
                  </NextLink>
                  <p className="mt-2 text-xs text-center text-muted-foreground">{step.name}</p>
                </li>
            )
        })}
      </ol>
    </nav>
  )
}
