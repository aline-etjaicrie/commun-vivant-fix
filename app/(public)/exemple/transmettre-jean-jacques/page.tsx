import ExampleMemorialPage from '@/components/memorial/ExampleMemorialPage';
import { getExampleMemorialBySlug } from '@/lib/exampleMemorials';

export default function ExempleTransmettreJeanJacques() {
  return <ExampleMemorialPage example={getExampleMemorialBySlug('transmettre-jean-jacques')!} />;
}
