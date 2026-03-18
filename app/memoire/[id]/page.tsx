import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import TemplateClassique from '@/components/templates/TemplateClassique';
import TemplateModerne from '@/components/templates/TemplateModerne';
import TemplateIntime from '@/components/templates/TemplateIntime';
import TemplateGalerie from '@/components/templates/TemplateGalerie';

// Force dynamic revalidation occasionally
export const revalidate = 60;

export default async function MemorialPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Use Service Role to fetch public data securely without RLS issues 
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: memory } = await supabase
        .from('memories')
        .select('*')
        .eq('id', id)
        .single();

    if (!memory) return notFound();

    // Determine which template to render
    const choice = memory.template_choice || 'classique';

    // Render the selected template
    switch (choice) {
        case 'moderne':
            return <TemplateModerne memory={memory} />;
        case 'intime':
            return <TemplateIntime memory={memory} />;
        case 'galerie':
            return <TemplateGalerie memory={memory} />;
        case 'classique':
        default:
            return <TemplateClassique memory={memory} />;
    }
}
