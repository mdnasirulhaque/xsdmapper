
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Separator } from '../ui/separator';

export default function RestFlowStep() {
    const router = useRouter();
    const { setState, lastVisitedStep } = useAppContext();

    const handleProceed = () => {
        setState({ lastVisitedStep: '/new/rest-flow' });
        router.push('/new/mapper');
    };

    const handleBack = () => {
        router.push(lastVisitedStep || '/new/preview-swagger-xsd');
    };

    return (
        <div className="flex-1 flex flex-col">
            <Card className="w-full shadow-lg flex-1 flex flex-col">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Rest Flow</CardTitle>
                    <CardDescription>
                        Please fill out the details for the rest flow.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-8 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={`question-${i + 1}`} className="space-y-2">
                                <Label htmlFor={`question-${i + 1}`}>Question {i + 1}</Label>
                                <Input id={`question-${i + 1}`} placeholder={`Answer for question ${i + 1}`} />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={`question-${i + 6}`} className="space-y-2">
                                    <Label htmlFor={`question-${i + 6}`}>Question {i + 6}</Label>
                                    <Input
                                        id={`question-${i + 6}`}
                                        placeholder={`Answer...`}
                                        type={(i + 6) >= 8 ? 'number' : 'text'}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                        <div className="space-y-3">
                             <Label>Radio Button Question</Label>
                             <RadioGroup defaultValue="option-one" className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="option-one" id="r1" />
                                    <Label htmlFor="r1">Option One</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="option-two" id="r2" />
                                    <Label htmlFor="r2">Option Two</Label>
                                </div>
                            </RadioGroup>
                        </div>
                         <div className="space-y-3">
                             <Label>Checkbox Question</Label>
                             <div className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="c1" />
                                    <label htmlFor="c1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Option A</label>
                                </div>
                                 <div className="flex items-center space-x-2">
                                    <Checkbox id="c2" />
                                    <label htmlFor="c2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Option B</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-6 mt-auto">
                        <Button variant="outline" onClick={handleBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={handleProceed}>
                            Next: Start Mapping <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
