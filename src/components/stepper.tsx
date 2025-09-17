
"use client"

import { cn } from "@/lib/utils"
import { FileUp, Eye, FileJson, Link as LinkIcon, CheckCircle2, ChevronRight, Send, Check } from "lucide-react"
import NextLink from 'next/link';


const steps = [
  { name: "Upload XML", href: "/new/upload", icon: FileUp },
  { name: "Preview XSD", href: "/new/preview-xsd", icon: Eye },
  { name: "Upload Swagger", href: "/new/swagger", icon: FileJson },
  { name: "Preview Swagger XSD", href: "/new/preview-swagger-xsd", icon: Eye },
  { name: "Map XSDs", href: "/new/mapper", icon: LinkIcon },
  { name: "Preview XSLT", href: "/new/preview-xslt", icon: Eye },
  { name: "Create Request", href: "/new/create-request", icon: Send },
]

interface StepperProps {
  currentStep: number
}

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => {
            const stepNumber = stepIdx + 1;
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            const isLastStep = stepIdx === steps.length - 1;

            return (
                <li key={step.name} className="relative flex-1 flex justify-center">
                    <NextLink 
                        href={step.href} 
                        className={cn(
                            "relative flex flex-col items-center justify-center gap-2 transition-colors w-24",
                            !isCompleted && !isCurrent && "cursor-not-allowed opacity-50"
                        )}
                        onClick={(e) => {
                            if(!isCompleted && !isCurrent) e.preventDefault();
                        }}
                    >
                        <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border-2 z-10 transition-colors",
                            isCompleted ? "bg-primary border-primary text-primary-foreground" 
                            : isCurrent ? "bg-background border-primary text-primary" 
                            : "bg-background border-border text-muted-foreground"
                        )}>
                            {isCompleted ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                        </div>
                        <p className={cn(
                            "text-xs font-medium text-center transition-colors",
                            isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                        )}>{step.name}</p>
                    
                        {!isLastStep && (
                            <div className="absolute top-5 left-1/2 w-full h-0.5 -z-10">
                                <div className={cn(
                                    "h-full w-full",
                                    isCompleted ? "bg-primary" : "bg-border"
                                )} />
                            </div>
                        )}
                    </NextLink>
                </li>
            )
        })}
      </ol>
    </nav>
  )
}
