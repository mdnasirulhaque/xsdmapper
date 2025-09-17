
"use client"

import AppLayout from '@/components/layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCog, PlusCircle } from 'lucide-react';
import Link from 'next/link';

const mockConfigurations = [
  { id: 'conf_1', name: 'Standard Order to Invoice', description: 'Maps customer orders to the standard sales invoice format.' },
  { id: 'conf_2', name: 'Legacy System Integration', description: 'Handles mapping from the old CRM to the new ERP system.' },
  { id: 'conf_3', name: 'Partner API V2 Mapping', description: 'Configuration for integrating with the supplier Partner API v2.' },
  { id: 'conf_4', name: 'Internal Financial Report', description: 'Generates XSLT for internal financial reporting structures.' },
];

export default function ConfigurationsPage() {
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Existing Configurations</h1>
                <p className="text-muted-foreground">
                    Manage and reuse your saved XSLT mapping configurations.
                </p>
            </div>
            <Button size="lg" asChild>
                <Link href="/new/upload">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    New Configuration
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockConfigurations.map(config => (
            <Card key={config.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-start gap-3">
                    <FileCog className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <span className="flex-1">{config.name}</span>
                </CardTitle>
                <CardDescription className="pt-2">{config.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <div className="flex items-center gap-2 w-full">
                    <Button variant="outline" className="w-full">View</Button>
                    <Button className="w-full">Use</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
