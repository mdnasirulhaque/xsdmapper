
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

interface HeaderProps {
  onPreview: () => void;
  onDownload: () => void;
}


const Breadcrumbs = () => {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </⚫i>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage>New Request</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}

const PageHeaderActions = ({ onPreview, onDownload }: HeaderProps) => {
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


export default function Header(props: HeaderProps) {
  return (
    <>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Breadcrumbs />
        </header>
        <header className="flex items-center justify-between p-4 sm:px-6 border-b bg-card shadow-sm shrink-0 h-16">
            <div className="flex items-center gap-3">
                <CodeXml className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                XSD Mapper
                </h1>
            </div>
            <PageHeaderActions {...props} />
        </header>
    </>
  )
}

    