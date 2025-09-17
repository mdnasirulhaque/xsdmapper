
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
            const isNext = currentStep + 1 === stepNumber;

            return (
                <li key={step.name} className="relative flex items-center flex-1">
                    <NextLink 
                        href={step.href} 
                        className={cn(
                            "relative flex flex-col items-center justify-center gap-2 transition-colors w-24 mx-auto",
                            !isCompleted && !isCurrent && "cursor-not-allowed opacity-50"
                        )}
                        onClick={(e) => {
                            if(!isCompleted && !isCurrent) e.preventDefault();
                        }}
                    >
                        <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border-2 z-10 transition-colors bg-background",
                            isCompleted ? "bg-primary border-primary text-primary-foreground" 
                            : isCurrent ? "border-primary text-primary" 
                            : "border-border text-muted-foreground"
                        )}>
                            {isCompleted ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                        </div>
                        <p className={cn(
                            "text-xs font-medium text-center transition-colors",
                            isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                        )}>{step.name}</p>
                    </NextLink>

                     {stepIdx < steps.length - 1 && (
                      <div className="absolute top-5 left-1/2 w-full -translate-y-1/2">
                          <div className="flex items-center justify-center w-full">
                               {isCurrent && (
                                   <ChevronRight className="h-6 w-6 text-primary animate-pulse" />
                               )}
                          </div>
                      </div>
                    )}
                </li>
            )
        })}
      </ol>
    </nav>
  )
}
