
"use client"

import { cn } from "@/lib/utils"
import { FileUp, Eye, FileJson, Link as LinkIcon, FileDown, Check } from "lucide-react"
import NextLink from 'next/link';


const steps = [
  { name: "Upload XML", href: "/new/upload", icon: FileUp },
  { name: "Preview XSD", href: "/new/preview-xsd", icon: Eye },
  { name: "Upload Swagger", href: "/new/swagger", icon: FileJson },
  { name: "Map Fields", href: "/new/mapper", icon: LinkIcon },
  { name: "Generate XSLT", href: "#", icon: FileDown },
]

interface StepperProps {
  currentStep: number
}

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="grid grid-cols-5 items-start">
        {steps.map((step, stepIdx) => {
            const stepNumber = stepIdx + 1;
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            return (
                <li key={step.name} className="relative flex justify-center">
                  <NextLink 
                    href={step.href} 
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-2 transition-colors",
                        !isCompleted && !isCurrent && "cursor-not-allowed opacity-50"
                    )}
                    onClick={(e) => {
                        if(!isCompleted && !isCurrent) e.preventDefault();
                    }}
                   >
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background",
                         isCompleted ? "border-primary bg-primary text-primary-foreground" 
                         : isCurrent ? "border-primary text-primary" 
                         : "border-border text-muted-foreground"
                    )}>
                     {isCompleted ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                    </div>
                    <p className={cn(
                        "text-xs font-medium text-center",
                        isCurrent ? "text-primary" : "text-muted-foreground"
                    )}>{step.name}</p>
                  </NextLink>
                </li>
            )
        })}
      </ol>
    </nav>
  )
}
