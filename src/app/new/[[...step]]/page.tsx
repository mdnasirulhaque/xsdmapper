
"use client";

import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout';
import InitialStep from '@/components/steps/initial-step';
import UploadStep from '@/components/steps/upload-step';
import PreviewStep from '@/components/steps/preview-step';
import SwaggerStep from '@/components/steps/swagger-step';
import PreviewSwaggerStep from '@/components/steps/preview-swagger-step';
import RestFlowStep from '@/components/steps/rest-flow-step';
import MapperStep from '@/components/steps/mapper-step';
import PreviewXsltStep from '@/components/steps/preview-xslt-step';
import CreateRequestStep from '@/components/steps/create-request-step';

const steps = [
  { name: 'initial', component: InitialStep, step: 1 },
  { name: 'upload', component: UploadStep, step: 2 },
  { name: 'preview-xsd', component: PreviewStep, step: 3 },
  { name: 'swagger', component: SwaggerStep, step: 4 },
  { name: 'preview-swagger-xsd', component: PreviewSwaggerStep, step: 5},
  { name: 'rest-flow', component: RestFlowStep, step: 6 },
  { name: 'mapper', component: MapperStep, step: 7 },
  { name: 'preview-xslt', component: PreviewXsltStep, step: 8 },
  { name: 'create-request', component: CreateRequestStep, step: 9 },
];

export default function NewRequestPage() {
  const params = useParams();
  const stepParam = Array.isArray(params.step) ? params.step[0] : 'initial';

  const currentStepInfo = steps.find(s => s.name === stepParam) || steps[0];
  const StepComponent = currentStepInfo.component;

  return (
    <AppLayout currentStep={currentStepInfo.step}>
      <StepComponent />
    </AppLayout>
  );
}
