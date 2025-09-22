
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Check, Loader, CheckCircle2, XCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Combobox } from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const mapperIdSuggestions = [
    { value: 'mapper-001', label: 'Standard Order Mapper' },
    { value: 'mapper-002', label: 'Legacy CRM Integration' },
    { value: 'mapper-003', label: 'Partner API V2' },
    { value: 'mapper-004', label: 'Financial Report Mapper' },
];

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

export default function InitialStep() {
    const router = useRouter();
    const { toast } = useToast();
    const { 
        profileId, 
        requestMapperId,
        responseMapperId,
        errorMapperId,
        setState,
        isRequestMapperSelected,
        isResponseMapperSelected,
        lastVisitedStep,
    } = useAppContext();

    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
    
    const isVerified = verificationStatus === 'success';

    const handleVerifyProfile = async () => {
        if (!profileId) {
            toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: 'Please enter a Profile ID.',
            });
            setVerificationStatus('error');
            return;
        }

        setVerificationStatus('verifying');
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
                setVerificationStatus('success');
            } else {
                throw new Error(result.message || 'Verification failed');
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: error.message,
            });
            setVerificationStatus('error');
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

        const isRequestSelected = !!requestMapperId;
        const isResponseSelected = !!responseMapperId;

        setState({
            isRequestMapperSelected: isRequestSelected,
            isResponseMapperSelected: isResponseSelected,
            lastVisitedStep: '/new/initial',
        });

        if (isRequestSelected && isResponseSelected) {
             toast({
                variant: 'success',
                title: 'Skipping Steps',
                description: 'Request and Response mappers selected. Jumping directly to mapping.',
            });
            router.push('/new/mapper');
        } else {
            router.push('/new/upload');
        }
    };

    const VerificationIcon = () => {
        switch (verificationStatus) {
            case 'verifying':
                return <Loader className="h-5 w-5 animate-spin" />;
            case 'success':
                return <CheckCircle2 className="h-5 w-5 text-success" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-destructive" />;
            case 'idle':
            default:
                return <Check className="h-5 w-5 text-primary" />;
        }
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
                                        setVerificationStatus('idle');
                                    }}
                                    className="h-12 text-base"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleVerifyProfile}
                                    disabled={verificationStatus === 'verifying' || verificationStatus === 'success'}
                                    className={cn(
                                        "h-12 w-12 flex-shrink-0 border",
                                        verificationStatus === 'success' && "border-success bg-success/10",
                                        verificationStatus === 'error' && "border-destructive bg-destructive/10",
                                    )}
                                >
                                    <VerificationIcon />
                                </Button>
                            </div>
                        </div>

                        {/* Request Mapper ID */}
                        <div className="space-y-2">
                             <Label htmlFor="requestMapperId" className="font-semibold text-base">Request Mapper ID</Label>
                             <Combobox
                                options={mapperIdSuggestions}
                                value={requestMapperId}
                                onValueChange={(value) => setState({ requestMapperId: value })}
                                placeholder="Select a mapper ID..."
                             />
                        </div>

                        {/* Response Mapper ID */}
                        <div className="space-y-2">
                             <Label htmlFor="responseMapperId" className="font-semibold text-base">Response Mapper ID</Label>
                             <Combobox
                                options={mapperIdSuggestions}
                                value={responseMapperId}
                                onValueChange={(value) => setState({ responseMapperId: value })}
                                placeholder="Select a mapper ID..."
                             />
                        </div>

                        {/* Error Mapper ID */}
                         <div className="space-y-2">
                             <Label htmlFor="errorMapperId" className="font-semibold text-base">Error Mapper ID</Label>
                              <Combobox
                                options={mapperIdSuggestions}
                                value={errorMapperId}
                                onValueChange={(value) => setState({ errorMapperId: value })}
                                placeholder="Select a mapper ID..."
                             />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t pt-6">
                        <Button onClick={handleProceed} size="lg" className="w-full" disabled={!profileId || !isVerified}>
                            Proceed <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
