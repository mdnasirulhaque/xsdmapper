
"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { generateXsltForSet } from '@/lib/xslt-generator';
import type { MappingSet } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Copy, Download } from 'lucide-react';
import CodeBlock from '../code-block';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

const setConfig: Record<MappingSet, { name: string; title: string }> = {
  set1: { name: 'Request', title: 'Request Mapping XSLT' },
  set2: { name: 'Response', title: 'Response Mapping XSLT' },
  set3: { name: 'Error', title: 'Error Mapping XSLT' },
};

const sets: MappingSet[] = ['set1', 'set2', 'set3'];

export default function PreviewXsltStep() {
  const router = useRouter();
  const { toast } = useToast();
  const { mappings, sourceSchemas, targetSchemas } = useAppContext();

  const generatedXslt = useMemo(() => {
    return {
      set1: generateXsltForSet(mappings.set1, sourceSchemas.set1, targetSchemas.set1),
      set2: generateXsltForSet(mappings.set2, sourceSchemas.set2, targetSchemas.set2),
      set3: generateXsltForSet(mappings.set3, sourceSchemas.set3, targetSchemas.set3),
    };
  }, [mappings, sourceSchemas, targetSchemas]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(
      () => {
        toast({
          variant: 'success',
          title: 'Copied to Clipboard',
          description: 'The XSLT content has been copied.',
        });
      },
      (err) => {
        toast({
          variant: 'destructive',
          title: 'Copy Failed',
          description: `Could not copy content: ${err}`,
        });
      }
    );
  };

  const handleDownload = (content: string, setName: string) => {
    const blob = new Blob([content], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${setName.toLowerCase().replace(' ', '-')}-transform.xslt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
        variant: 'success',
        title: 'Download Started',
        description: `Your ${setName} XSLT is downloading.`,
    });
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      <Card className="w-full shadow-lg flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Preview XSLT</CardTitle>
          <CardDescription>
            Review the generated XSLT for each mapping set. You can copy or
            download the files. To make changes, go back to the mapper.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <Tabs defaultValue="set1" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              {sets.map((set) => (
                <TabsTrigger key={set} value={set}>
                  {setConfig[set].name}
                </TabsTrigger>
              ))}
            </TabsList>
            {sets.map((set) => (
              <TabsContent key={set} value={set} className="flex-1 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                  
                  {/* Mappings Preview */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-lg">Mappings</h3>
                    <ScrollArea className="h-[50vh] rounded-md border bg-muted/30 p-4">
                       {mappings[set].length > 0 ? (
                           <ul className="space-y-2">
                            {mappings[set].map(m => (
                                <li key={m.id} className="text-sm p-2 bg-background rounded-md shadow-sm">
                                    <span className="font-mono text-primary">{m.sourceId.split('-').slice(1).join('-')}</span>
                                    <span className="text-muted-foreground mx-2">{`->`}</span>
                                    <span className="font-mono text-primary">{m.targetId.split('-').slice(1).join('-')}</span>
                                    {m.transformation && m.transformation.type !== 'NONE' && (
                                        <span className="ml-2 text-xs text-accent-foreground bg-accent/80 px-2 py-0.5 rounded-full">{m.transformation.type}</span>
                                    )}
                                </li>
                            ))}
                           </ul>
                       ) : (
                           <div className="flex items-center justify-center h-full text-muted-foreground">
                               <p>No mappings defined for this set.</p>
                           </div>
                       )}
                    </ScrollArea>
                  </div>

                  {/* XSLT Preview */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                         <h3 className="font-semibold text-lg">{setConfig[set].title}</h3>
                         <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" onClick={() => handleCopy(generatedXslt[set])} disabled={mappings[set].length === 0}>
                                 <Copy className="mr-2 h-4 w-4" /> Copy
                             </Button>
                             <Button variant="secondary" size="sm" onClick={() => handleDownload(generatedXslt[set], setConfig[set].name)} disabled={mappings[set].length === 0}>
                                 <Download className="mr-2 h-4 w-4" /> Download
                             </Button>
                         </div>
                    </div>
                     <ScrollArea className="h-[50vh] rounded-md border bg-muted/50">
                        <CodeBlock code={generatedXslt[set]} language="xml" />
                    </ScrollArea>
                  </div>

                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between bg-card rounded-lg p-3 border">
        <Button variant="outline" onClick={() => router.push('/new/mapper')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Mapper
        </Button>
        <Button onClick={() => router.push('/new/create-request')}>
            Next: Final Review <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
