
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Check, Loader } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Combobox } from '@/components/ui/combobox';

const mapperIdSuggestions = [
    { value: 'mapper-001', label: 'Standard Order Mapper' },
    { value: 'mapper-002', label: 'Legacy CRM Integration' },
    { value: 'mapper-003', label: 'Partner API V2' },
    { value: 'mapper-004', label: 'Financial Report Mapper' },
];

export default function InitialStep() {
    const router = useRouter();
    const { toast } = useToast();
    const { 
        profileId, 
        requestMapperId,
        responseMapperId,
        errorMapperId,
        setState 
    } = useAppContext();

    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const handleVerifyProfile = async () => {
        if (!profileId) {
            toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: 'Please enter a Profile ID.',
            });
            return;
        }

        setIsVerifying(true);
        try {
            const response = await fetch('/api/v1/ea/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileId }),
            });

            const result = await response.json();

            if (response.ok) {
                toast({
                    variant: 'success',
                    title: 'Verification Successful',
                    description: result.message,
                });
                setIsVerified(true);
            } else {
                throw new Error(result.message || 'Verification failed');
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: error.message,
            });
            setIsVerified(false);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleProceed = () => {
        if (!profileId) {
            toast({
                variant: 'destructive',
                title: 'Missing Profile ID',
                description: 'Please enter and verify a Profile ID to continue.',
            });
            return;
        }
        if (!isVerified) {
             toast({
                variant: 'destructive',
                title: 'Profile ID Not Verified',
                description: 'Please verify your Profile ID before proceeding.',
            });
            return;
        }
        router.push('/new/upload');
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center">
            <Card className="w-full max-w-3xl shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Initial Details</CardTitle>
                    <CardDescription>
                        Provide the necessary identifiers to begin the mapping process.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Profile ID */}
                        <div className="space-y-2">
                            <Label htmlFor="profileId" className="font-semibold text-base">
                                Profile ID <span className="text-destructive">*</span>
                            </Label>
                             <div className="flex items-center gap-2">
                                <Input
                                    id="profileId"
                                    placeholder="Enter Profile ID (e.g., 'valid-profile')"
                                    value={profileId || ''}
                                    onChange={(e) => {
                                        setState({ profileId: e.target.value });
                                        setIsVerified(false);
                                    }}
                                    className="h-12 text-base"
                                />
                                <Button
                                    onClick={handleVerifyProfile}
                                    disabled={isVerifying || isVerified}
                                    className="h-12 w-32"
                                >
                                    {isVerifying ? <Loader className="animate-spin" /> : (isVerified ? <Check /> : 'Verify')}
                                </Button>
                            </div>
                        </div>

                        {/* Request Mapper ID */}
                        <div className="space-y-2">
                             <Label htmlFor="requestMapperId" className="font-semibold text-base">Request Mapper ID</Label>
                             <Combobox
                                options={mapperIdSuggestions}
                                value={requestMapperId}
                                onChange={(value) => setState({ requestMapperId: value })}
                                placeholder="Select a mapper ID..."
                                createPlaceholder="Create new mapper..."
                             />
                        </div>

                        {/* Response Mapper ID */}
                        <div className="space-y-2">
                             <Label htmlFor="responseMapperId" className="font-semibold text-base">Response Mapper ID</Label>
                             <Combobox
                                options={mapperIdSuggestions}
                                value={responseMapperId}
                                onChange={(value) => setState({ responseMapperId: value })}
                                placeholder="Select a mapper ID..."
                                createPlaceholder="Create new mapper..."
                             />
                        </div>

                        {/* Error Mapper ID */}
                         <div className="space-y-2">
                             <Label htmlFor="errorMapperId" className="font-semibold text-base">Error Mapper ID</Label>
                              <Combobox
                                options={mapperIdSuggestions}
                                value={errorMapperId}
                                onChange={(value) => setState({ errorMapperId: value })}
                                placeholder="Select a mapper ID..."
                                createPlaceholder="Create new mapper..."
                             />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t pt-6">
                        <Button onClick={handleProceed} size="lg" className="w-full" disabled={!profileId || !isVerified}>
                            Proceed to XML Upload <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
