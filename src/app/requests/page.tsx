
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileCheck } from 'lucide-react';

export default function RequestsPage() {
  return (
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
  );
}
