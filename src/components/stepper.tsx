
"use client"

import { cn } from "@/lib/utils"
import { FileUp, Link, FileDown, Check, FileJson, Eye } from "lucide-react"
import NextLink from 'next/link';


const steps = [
  { name: "Upload XML", href: "/new/upload", icon: FileUp },
  { name: "Preview XSD", href: "/new/preview-xsd", icon: Eye },
  { name: "Upload Swagger", href: "/new/swagger", icon: FileJson },
  { name: "Map Fields", href: "/new/mapper", icon: Link },
  { name: "Generate XSLT", href: "#", icon: FileDown },
]

interface StepperProps {
  currentStep: number
}

const StepLink = ({ step, currentStep, stepIdx }: { step: typeof steps[0], currentStep: number, stepIdx: number }) => {
  const isCompleted = currentStep > stepIdx + 1;
  const isCurrent = currentStep === stepIdx + 1;

  const content = (
     <>
        <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
          {isCompleted ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary group-hover:bg-primary/80">
                <Check className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
          ) : isCurrent ? (
            <>
                <span className="absolute h-4 w-4 rounded-full bg-primary/30" aria-hidden="true" />
                <span className="relative block h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            </>
          ) : (
             <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          )}
        </span>
        <span className={cn(
            "ml-3 text-sm font-medium",
            isCurrent ? "text-primary" : "text-muted-foreground",
            isCompleted && "group-hover:text-foreground"
        )}>
          {step.name}
        </span>
     </>
  )

  if (isCompleted) {
    return (
        <NextLink href={step.href} className="group flex items-start">
            {content}
        </NextLink>
    )
  }

  if (isCurrent) {
     return (
        <NextLink href={step.href} className="flex items-start" aria-current="step">
            {content}
        </NextLink>
     )
  }

  return (
    <div className="group flex items-start cursor-default">
        {content}
    </div>
  )

}


export default function Stepper({ currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-6">
        {steps.map((step, stepIdx) => (
          <li key={step.name}>
             <StepLink step={step} currentStep={currentStep} stepIdx={stepIdx} />
          </li>
        ))}
      </ol>
    </nav>
  )
}
