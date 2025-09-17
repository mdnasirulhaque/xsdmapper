
"use client"

import Header from "@/components/header"
import { CodeXml, Folder, FileCheck, FilePlus } from "lucide-react"
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
import Stepper from "./stepper"


interface AppLayoutProps {
  children: React.ReactNode
  currentStep?: number
}

export default function AppLayout({ children, currentStep = 1 }: AppLayoutProps) {
  const pathname = usePathname();
  const isCreationFlow = pathname.startsWith('/new');

  return (
    <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                        <CodeXml className="h-6 w-6 text-sidebar-primary" />
                        <span className="text-lg font-semibold text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">XSD Mapper</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-0">
                <SidebarMenu>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="/new/upload?keepState=true" tooltip="Create New Request" isActive={isCreationFlow}>
                            <FilePlus className="size-5" />
                            <span className="group-data-[collapsible=icon]:hidden">Create New Request</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
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
        <main className="flex flex-1 flex-col">
              <Header />
              {isCreationFlow && (
                 <div className="my-4 p-4 rounded-lg bg-card shadow-sm">
                    <Stepper currentStep={currentStep} />
                </div>
              )}
            <div className="flex-1 flex flex-col mb-4">
                {children}
            </div>
        </main>
        </div>
    </SidebarProvider>
  )
}
