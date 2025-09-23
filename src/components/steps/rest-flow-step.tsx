
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
        <div className="flex-1 flex flex-col items-center justify-center">
            <Card className="w-full max-w-4xl shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Rest Flow</CardTitle>
                    <CardDescription>
                        Please fill out the details for the rest flow.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={`question-${i + 1}`} className="space-y-2">
                                <Label htmlFor={`question-${i + 1}`}>Question {i + 1}</Label>
                                <Input id={`question-${i + 1}`} placeholder={`Answer for question ${i + 1}`} />
                            </div>
                        ))}
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
                                    <Label htmlFor="c1">Option A</Label>
                                </div>
                                 <div className="flex items-center space-x-2">
                                    <Checkbox id="c2" />
                                    <Label htmlFor="c2">Option B</Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-6">
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
