import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google'

export const metadata: Metadata = {
  title: 'XSD Mapper',
  description: 'Visually map between two XSD schemas and generate transformations.',
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning={true} className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
