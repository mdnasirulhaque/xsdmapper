"use client"

import { cn } from "@/lib/utils"
import { FileUp, Link, FileDown, Check, FileJson, Eye } from "lucide-react"

const steps = [
  { name: "Upload XML", href: "/", icon: FileUp },
  { name: "Preview XSD", href: "/preview-xsd", icon: Eye },
  { name: "Upload Swagger", href: "/swagger", icon: FileJson },
  { name: "Map Fields", href: "#", icon: Link },
  { name: "Generate XSLT", href: "#", icon: FileDown },
]

interface StepperProps {
  currentStep: number
}

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-6">
        {steps.map((step, stepIdx) => (
          <li key={step.name}>
            {currentStep > stepIdx + 1 ? (
              <a href={step.href} className="group">
                <span className="flex items-start">
                  <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary group-hover:bg-primary/80">
                    <Check className="h-4 w-4 text-white" aria-hidden="true" />
                  </span>
                  <span className="ml-3 text-sm font-medium text-muted-foreground group-hover:text-foreground">
                    {step.name}
                  </span>
                </span>
              </a>
            ) : currentStep === stepIdx + 1 ? (
              <a href={step.href} className="flex items-start" aria-current="step">
                <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    <span className="absolute h-4 w-4 rounded-full bg-primary/30" aria-hidden="true" />
                    <span className="relative block h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                </span>
                <span className="ml-3 text-sm font-medium text-primary">
                  {step.name}
                </span>
              </a>
            ) : (
                <div className="group">
                    <div className="flex items-start">
                        <div className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                        </div>
                        <p className="ml-3 text-sm font-medium text-muted-foreground">{step.name}</p>
                    </div>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
