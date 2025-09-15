
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
import { CodeXml, Eye, FileDown, FilePlus } from "lucide-react"
import { usePathname } from 'next/navigation'
import Link from "next/link"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onPreview?: () => void;
  onDownload?: () => void;
}

const Breadcrumbs = () => {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-primary-foreground/80 hover:text-primary-foreground">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage className="text-primary-foreground font-semibold">New Request</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
}

const PageHeaderActions = ({ onPreview, onDownload }: Pick<HeaderProps, 'onPreview' | 'onDownload'>) => {
    const pathname = usePathname();
    const showActions = pathname.endsWith('/mapper');
    if (!showActions) return null;

    return (
         <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onPreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview XML
            </Button>
            <Button variant="secondary" onClick={onDownload}>
                <FileDown className="mr-2 h-4 w-4" />
                Download XSLT
            </Button>
      </div>
    )
}


export default function Header({ onPreview, onDownload }: HeaderProps) {
  const pathname = usePathname();
  const isCreationFlow = pathname.startsWith('/new');

  return (
    <header className="sticky top-0 z-10 flex flex-col">
        {isCreationFlow && (
            <div className="flex h-14 items-center gap-4 px-4 sm:px-6 bg-primary mx-4 sm:mx-6 mt-4 rounded-t-lg">
                <Breadcrumbs />
            </div>
        )}
        <div className={cn(
            "bg-primary text-primary-foreground shadow-sm", 
            isCreationFlow ? "mx-4 sm:mx-6 rounded-b-lg p-4" : "bg-primary text-primary-foreground border-b p-4 rounded-lg"
        )}>
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                    <CodeXml className="h-8 w-8 text-primary-foreground" />
                    <h1 className="text-xl font-bold tracking-tight text-primary-foreground">
                    XSD Mapper
                    </h1>
                </div>
                {!isCreationFlow && (
                     <Button asChild variant="secondary">
                        <Link href="/new/upload?keepState=true">
                            <FilePlus className="mr-2 h-4 w-4" />
                            Create New Request
                        </Link>
                    </Button>
                )}
                <div className="flex justify-end min-w-[200px]">
                    <PageHeaderActions onPreview={onPreview} onDownload={onDownload} />
                </div>
            </div>
        </div>
    </header>
  )
}
