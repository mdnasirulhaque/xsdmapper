
"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/new/upload');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading XSD Mapper...</p>
      </div>
    </div>
  );
}
