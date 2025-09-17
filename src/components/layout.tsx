
"use client"

import Header from "@/components/header"
import { CodeXml, FilePlus, RotateCcw } from "lucide-react"
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
import { ThemeToggle } from "./theme-toggle"
import { useAppContext } from "@/context/AppContext"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"


interface AppLayoutProps {
  children: React.ReactNode
  currentStep?: number
}

export default function AppLayout({ children, currentStep = 1 }: AppLayoutProps) {
  const pathname = usePathname();
  const isCreationFlow = pathname.startsWith('/new');
  const { resetState } = useAppContext();

  return (
    <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                        <CodeXml className="h-6 w-6 text-sidebar-primary" />
                        <span className="text-lg font-semibold text-sidebar-primary-foreground group-data-[collapsible=icon]:hidden">XSD Mapper</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
                <SidebarMenu>
                     <SidebarMenuItem>
                        <SidebarMenuButton href="/new/upload" tooltip="Create New Request" isActive={isCreationFlow}>
                            <FilePlus className="size-5" />
                            <span className="group-data-[collapsible=icon]:hidden">Create New Request</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-sidebar-foreground outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent/20 hover:text-sidebar-primary focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:rounded-full h-8 text-sm">
                                    <RotateCcw className="size-5" />
                                    <span className="group-data-[collapsible=icon]:hidden">Reset State</span>
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Reset Application State?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will clear all uploaded files, mappings, and reset the entire application to its initial state. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={resetState}>
                                        Confirm Reset
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-2 flex flex-col items-center gap-2">
                 <div className="flex-1 w-full flex items-center justify-center">
                    <div className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">Version 1.0.0</div>
                 </div>
                 <div className="w-full flex flex-col items-center gap-2">
                    <ThemeToggle />
                    <SidebarTrigger />
                 </div>
            </SidebarFooter>
        </Sidebar>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
              <Header />
              {isCreationFlow && (
                 <div className="bg-card p-4 rounded-lg shadow-sm border">
                    <Stepper currentStep={currentStep} />
                </div>
              )}
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </main>
        </div>
    </SidebarProvider>
  )
}
