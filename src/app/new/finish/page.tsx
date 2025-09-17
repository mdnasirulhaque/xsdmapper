
"use client";

import AppLayout from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PartyPopper, FilePlus } from 'lucide-react';
import Link from 'next/link';

export default function FinishPage() {
  return (
    <AppLayout>
        <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-2xl text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                        <PartyPopper className="h-8 w-8" />
                    </div>
                    <CardTitle className="mt-4 text-2xl">Congratulations!</CardTitle>
                    <CardDescription className="mt-2 text-lg text-muted-foreground">
                        You have successfully generated your XSLT files.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <p>
                        You can now use the downloaded XSLT files in your integration workflow. If you need to make changes, you can always start a new request.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/new/upload">
                            <FilePlus className="mr-2 h-5 w-5" /> Start New Mapping
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
  );
}
