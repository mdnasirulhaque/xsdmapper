
"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function PreviewSwaggerStep() {
    const router = useRouter();

    return (
        <div className="flex flex-col flex-1 gap-6 overflow-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Preview Swagger XSD</CardTitle>
                    <CardDescription>
                        This page will show a preview of the XSD generated from the Swagger/OpenAPI file.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <div className="text-center text-muted-foreground py-12">
                        <p>Swagger XSD preview functionality is not yet implemented.</p>
                    </div>

                    <div className="flex items-center justify-between">
                         <Button variant="outline" onClick={() => router.push('/new/swagger')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={() => router.push('/new/mapper')}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
