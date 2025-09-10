
"use client"

import Stepper from "@/components/stepper"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CodeXml, LayoutGrid, Folder, FileCheck, FilePlus } from "lucide-react"
import Link from "next/link"
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
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent
} from "@/components/ui/sidebar"
import { usePathname } from 'next/navigation'


interface AppLayoutProps {
  children: React.ReactNode
  currentStep: number
}

export default function AppLayout({ children, currentStep }: AppLayoutProps) {
  const pathname = usePathname();
  const isCreationFlow = ['/', '/preview-xsd', '/swagger', '/mapper'].includes(pathname);

  return (
    <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-3 p-2">
                    <CodeXml className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">XSD Mapper</span>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-0">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/" tooltip="Create New Request" isActive={isCreationFlow}>
                            <FilePlus className="size-4" />
                            <span className="group-data-[collapsible=icon]:hidden">Create New Request</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="/requests" tooltip="Check Requests" isActive={pathname === '/requests'}>
                            <FileCheck className="size-4" />
                            <span className="group-data-[collapsible=icon]:hidden">Check Requests</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton href="/configurations" tooltip="View Existing Configurations" isActive={pathname === '/configurations'}>
                            <Folder className="size-4" />
                            <span className="group-data-[collapsible=icon]:hidden">View Existing Configurations</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                
                {isCreationFlow && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Creation Steps</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <Stepper currentStep={currentStep} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter className="p-2">
                <div className="text-xs text-muted-foreground">Version 1.0.0</div>
            </SidebarFooter>
        </Sidebar>
        <main className="flex flex-1 flex-col">
            {children}
        </main>
        </div>
    </SidebarProvider>
  )
}
