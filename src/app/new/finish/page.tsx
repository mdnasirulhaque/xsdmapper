
"use client";

import AppLayout from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PartyPopper, FilePlus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

const DetailRow = ({ label, value }: { label: string, value: string | null }) => (
    <div className="flex justify-between items-center w-full text-sm">
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-semibold">{value || 'N/A'}</span>
    </div>
);

export default function FinishPage() {
  const searchParams = useSearchParams();
  const { setIsLoading } = useAppContext();

  const orderId = searchParams.get('orderId');
  const csiId = searchParams.get('csiId');
  const approverName = searchParams.get('approverName');
  const eventId = searchParams.get('eventId');

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
                    <div className="w-full max-w-md space-y-3 rounded-lg border bg-muted/50 p-4">
                        <DetailRow label="Order ID" value={orderId} />
                        <DetailRow label="CSI ID" value={csiId} />
                        <DetailRow label="Approver Name" value={approverName} />
                        <DetailRow label="Event ID" value={eventId} />
                    </div>
                    <p>
                        You can now use the downloaded XSLT files in your integration workflow. If you need to make changes, you can always start a new request.
                    </p>
                    <Button asChild size="lg" onClick={() => setIsLoading(true)}>
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
