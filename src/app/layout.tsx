
"use client"

import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>XSD Mapper</title>
        <meta name="description" content="Visually map between two XSD schemas and generate transformations." />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
          <AppProvider>
            {children}
          </AppProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
