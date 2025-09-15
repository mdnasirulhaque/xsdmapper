
"use client";

import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout';
import UploadStep from '@/components/steps/upload-step';
import PreviewStep from '@/components/steps/preview-step';
import SwaggerStep from '@/components/steps/swagger-step';
import MapperStep from '@/components/steps/mapper-step';

const steps = [
  { name: 'upload', component: UploadStep, step: 1 },
  { name: 'preview-xsd', component: PreviewStep, step: 2 },
  { name: 'swagger', component: SwaggerStep, step: 3 },
  { name: 'mapper', component: MapperStep, step: 4 },
];

export default function NewRequestPage() {
  const params = useParams();
  const stepParam = Array.isArray(params.step) ? params.step[0] : 'upload';

  const currentStepInfo = steps.find(s => s.name === stepParam) || steps[0];
  const StepComponent = currentStepInfo.component;

  return (
    <AppLayout currentStep={currentStepInfo.step}>
      <StepComponent />
    </AppLayout>
  );
}
