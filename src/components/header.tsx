
"use client"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { CodeXml, Eye, FileDown } from "lucide-react"
import Stepper from "@/components/stepper"

interface HeaderProps {
  onPreview?: () => void;
  onDownload?: () => void;
  currentStep: number;
}

const Breadcrumbs = () => {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage>New Request</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}

const PageHeaderActions = ({ onPreview, onDownload }: Pick<HeaderProps, 'onPreview' | 'onDownload'>) => {
    if (!onPreview || !onDownload) return null;
    return (
         <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onPreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview XML
            </Button>
            <Button onClick={onDownload} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <FileDown className="mr-2 h-4 w-4" />
            Download XSLT
            </Button>
      </div>
    )
}


export default function Header({ onPreview, onDownload, currentStep }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex flex-col border-b bg-background shadow-sm">
        <div className="flex h-14 items-center gap-4  px-4 sm:px-6">
            <Breadcrumbs />
        </div>
        <div className="flex items-center justify-between p-4 sm:px-6 border-t h-20">
            <div className="flex items-center gap-3">
                <CodeXml className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                XSD Mapper
                </h1>
            </div>
            <div className="w-1/3">
                 <Stepper currentStep={currentStep} />
            </div>
            <div className="flex justify-end w-1/3">
                <PageHeaderActions onPreview={onPreview} onDownload={onDownload} />
            </div>
        </div>
    </header>
  )
}
