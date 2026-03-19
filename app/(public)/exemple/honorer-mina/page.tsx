import ExampleMemorialPage from '@/components/memorial/ExampleMemorialPage';
import { getExampleMemorialBySlug } from '@/lib/exampleMemorials';

export default function ExempleHonorerMina() {
  return <ExampleMemorialPage example={getExampleMemorialBySlug('honorer-mina')!} />;
}
