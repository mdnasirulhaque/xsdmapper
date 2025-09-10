
import AppLayout from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileCheck } from 'lucide-react';

export default function RequestsPage() {
  return (
    <AppLayout currentStep={0}>
        <div className="flex flex-col flex-1 p-4 sm:p-6 md:p-8 gap-6 overflow-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCheck className="h-6 w-6" />
                        Check Requests
                    </CardTitle>
                    <CardDescription>
                        This page will display the status of your pending and completed requests.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-12">
                        <p>Request checking functionality is not yet implemented.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
  );
}
