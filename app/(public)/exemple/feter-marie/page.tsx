import ExampleMemorialPage from '@/components/memorial/ExampleMemorialPage';
import { getExampleMemorialBySlug } from '@/lib/exampleMemorials';

export default function ExempleFeterMarie() {
  return <ExampleMemorialPage example={getExampleMemorialBySlug('feter-marie')!} />;
}
