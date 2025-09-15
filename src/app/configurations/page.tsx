
"use client"

import AppLayout from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Folder } from 'lucide-react';

export default function ConfigurationsPage() {
  return (
    <AppLayout>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Folder className="h-6 w-6" />
                    Existing Configurations
                </CardTitle>
                <CardDescription>
                    This page will list all your saved mapping configurations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-12">
                    <p>Configuration viewing functionality is not yet implemented.</p>
                </div>
            </CardContent>
        </Card>
    </AppLayout>
  );
}
