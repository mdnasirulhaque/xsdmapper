"use client"

import { CodeXml, Eye, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PageHeaderProps {
  onPreview: () => void;
  onDownload: () => void;
}

export default function PageHeader({ onPreview, onDownload }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm shrink-0">
      <Link href="/" className="flex items-center gap-3">
        <CodeXml className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          XSD Mapper
        </h1>
      </Link>
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
    </header>
  )
}
