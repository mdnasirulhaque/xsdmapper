
"use client"

import { cn } from "@/lib/utils"
import { FileUp, Eye, FileJson, Link as LinkIcon, FileDown, CheckCircle2, ChevronRight } from "lucide-react"
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
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => {
            const stepNumber = stepIdx + 1;
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            const isLastStep = stepIdx === steps.length - 1;

            return (
                <li key={step.name} className="relative flex-1">
                    <div className="flex items-center">
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
                                "flex h-10 w-10 items-center justify-center rounded-full border-2 z-10",
                                isCompleted ? "bg-primary border-primary text-primary-foreground" 
                                : isCurrent ? "bg-background border-primary text-primary" 
                                : "bg-background border-border text-muted-foreground"
                            )}>
                                <step.icon className="h-5 w-5" />
                            </div>
                            <p className={cn(
                                "text-xs font-medium text-center",
                                isCurrent ? "text-primary" : isCompleted ? "text-primary" : "text-muted-foreground"
                            )}>{step.name}</p>
                        </NextLink>

                        {!isLastStep && (
                            <div className="flex-1 h-px bg-border relative">
                                {isCompleted && (
                                    <>
                                        <div className="absolute inset-0 h-px bg-primary"></div>
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-0.5 rounded-full">
                                            <CheckCircle2 className="h-6 w-6 text-primary" />
                                        </div>
                                    </>
                                )}
                                {isCurrent && (
                                     <div className="absolute -right-3 top-1/2 -translate-y-1/2">
                                        <ChevronRight className="h-6 w-6 text-primary" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </li>
            )
        })}
      </ol>
    </nav>
  )
}
