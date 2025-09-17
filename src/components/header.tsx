
"use client"

import { usePathname } from 'next/navigation'
import { CodeXml, RotateCcw } from "lucide-react"
import { useAppContext } from "@/context/AppContext"
import { Button } from '@/components/ui/button'
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

export default function Header() {
  const { soeid, resetState } = useAppContext();
  const pathname = usePathname();
  const isCreationFlow = pathname.startsWith('/new');

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-header text-header-foreground rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
            <CodeXml className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
            XSD Mapper
            </h1>
        </div>
        <div className="flex items-center gap-4">
            {isCreationFlow && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
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
            )}
            {soeid && (
              <div className="bg-muted text-muted-foreground px-4 py-1.5 rounded-lg shadow-inner">
                <span className="text-sm font-semibold">{soeid}</span>
              </div>
            )}
        </div>
    </header>
  )
}
