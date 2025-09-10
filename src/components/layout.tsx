"use client"

import Stepper from "@/components/stepper"
import { Card, CardContent } from "@/components/ui/card"

interface AppLayoutProps {
  children: React.ReactNode
  currentStep: number
}

export default function AppLayout({ children, currentStep }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background p-4 sm:flex">
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-[60px] items-center border-b px-6">
                <h1 className="text-lg font-bold">XSD Mapper</h1>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <Stepper currentStep={currentStep} />
            </div>
        </div>
      </aside>
      <main className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
