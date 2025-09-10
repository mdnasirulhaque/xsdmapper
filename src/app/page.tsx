import Welcome from '@/components/welcome';
import AppLayout from '@/components/layout';

export default function Home() {
  return (
    <AppLayout currentStep={1}>
      <Welcome />
    </AppLayout>
  );
}
