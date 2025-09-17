
"use client"

import { CodeXml } from "lucide-react"

export default function Header() {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-header text-header-foreground rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
            <CodeXml className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
            XSD Mapper
            </h1>
        </div>
    </header>
  )
}
