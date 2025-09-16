
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
import { useAppContext } from '@/context/AppContext';
import { ScrollArea } from '../ui/scroll-area';
import CodeBlock from '../code-block';


export default function PreviewSwaggerStep() {
    const router = useRouter();
    const { swaggerFile } = useAppContext();

    // A placeholder for the generated XSD from swagger for demonstration
    const swaggerXsdPreview = swaggerFile 
        ? `<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <!-- This is a simulated XSD generated from the Swagger/OpenAPI file -->
  <xs:element name="SwaggerApi">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="/example-endpoint">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="id" type="xs:string" />
              <xs:element name="name" type="xs:string" />
              <xs:element name="value" type="xs:number" />
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
`
        : 'Upload a Swagger/OpenAPI file in the previous step to see a preview.';


    return (
        <div className="flex items-center justify-center flex-1">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>Preview Swagger XSD</CardTitle>
                    <CardDescription>
                        This is a preview of the simulated XSD generated from the Swagger/OpenAPI file.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <ScrollArea className="h-96 rounded-md border bg-muted/50">
                       <CodeBlock code={swaggerXsdPreview} language="xml" />
                    </ScrollArea>

                    <div className="flex items-center justify-between border-t pt-6">
                         <Button variant="outline" onClick={() => router.push('/new/swagger')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={() => router.push('/new/mapper')} disabled={!swaggerFile}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
