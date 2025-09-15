
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppLayout from '@/components/layout';
import UploadStep from '@/components/steps/upload-step';
import PreviewStep from '@/components/steps/preview-step';
import SwaggerStep from '@/components/steps/swagger-step';
import MapperStep from '@/components/steps/mapper-step';
import { useAppContext } from '@/context/AppContext';

const steps = [
  { name: 'upload', component: UploadStep, step: 1 },
  { name: 'preview-xsd', component: PreviewStep, step: 2 },
  { name: 'swagger', component: SwaggerStep, step: 3 },
  { name: 'mapper', component: MapperStep, step: 4 },
];

export default function NewRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { resetState } = useAppContext();
  const stepParam = Array.isArray(params.step) ? params.step[0] : 'upload';

  useEffect(() => {
    // When the user navigates to the first step, reset the state.
    if(stepParam === 'upload') {
        const url = new URL(window.location.href);
        if(!url.searchParams.has('keepState')){
            resetState();
            // Replace the URL to remove the query param, so reloads work as expected.
            router.replace('/new/upload', { scroll: false });
        }
    }
  }, [stepParam, resetState, router])

  const currentStepInfo = steps.find(s => s.name === stepParam) || steps[0];
  const StepComponent = currentStepInfo.component;

  return (
    <AppLayout currentStep={currentStepInfo.step}>
      <StepComponent />
    </AppLayout>
  );
}
