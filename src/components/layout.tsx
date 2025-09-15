
"use client"

import Header from "@/components/header"
import { CodeXml, Folder, FileCheck } from "lucide-react"
import { 
    Sidebar, 
    SidebarProvider, 
    SidebarTrigger,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { usePathname } from 'next/navigation'
import { useAppContext } from "@/context/AppContext"
import { useToast } from "@/hooks/use-toast"
import { generateXslt } from "@/lib/xslt-generator"
import { generateXmlPreview } from "@/lib/xml-preview-generator"
import { useState } from "react"
import PreviewDialog from "./preview-dialog"


interface AppLayoutProps {
  children: React.ReactNode
  currentStep: number
}

export default function AppLayout({ children, currentStep }: AppLayoutProps) {
  const pathname = usePathname();
  const isCreationFlow = pathname.startsWith('/new');

  const { mappings, sourceSchema, targetSchema, resetState } = useAppContext();
  const { toast } = useToast();
  const [isPreviewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const handleDownloadXslt = () => {
    if (!sourceSchema || !targetSchema) {
      toast({ variant: 'destructive', title: "Missing Schemas", description: "Please load both source and target schemas." });
      return;
    }
    const xsltContent = generateXslt(mappings, sourceSchema, targetSchema)
    const blob = new Blob([xsltContent], { type: 'application/xml;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'transformation.xslt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreview = () => {
    if (!targetSchema) {
      toast({ variant: 'destructive', title: "Missing Target Schema", description: "Please load a target schema to generate a preview." });
      return;
    }
    const preview = generateXmlPreview(mappings, targetSchema)
    setPreviewContent(preview)
    setPreviewDialogOpen(true)
  }

  const showActions = pathname.endsWith('/mapper');

  return (
    <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                        <CodeXml className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">XSD Mapper</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-0">
                <SidebarMenu>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="/requests" tooltip="Check Requests" isActive={pathname === '/requests'}>
                            <FileCheck className="size-5" />
                            <span className="group-data-[collapsible=icon]:hidden">Check Requests</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/configurations" tooltip="View Existing Configurations" isActive={pathname === '/configurations'}>
                            <Folder className="size-5" />
                            <span className="group-data-[collapsible=icon]:hidden">View Existing Configurations</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-2 justify-between flex flex-row items-center">
                 <div className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">Version 1.0.0</div>
                 <SidebarTrigger />
            </SidebarFooter>
        </Sidebar>
        <main className="flex flex-1 flex-col h-screen overflow-y-auto">
              <Header 
                currentStep={currentStep} 
                onDownload={showActions ? handleDownloadXslt : undefined}
                onPreview={showActions ? handlePreview : undefined}
              />
            {children}
        </main>
        <PreviewDialog
          isOpen={isPreviewDialogOpen}
          onOpenChange={setPreviewDialogOpen}
          content={previewContent}
        />
        </div>
    </SidebarProvider>
  )
}
