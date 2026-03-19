'use client';

import TributeMemorial, { TributeLabels } from '@/components/TributeMemorial';

interface TributeBlockProps {
    prenom?: string;
    memorialId: string;
    template: any;
    type?: 'funeraire' | 'vivant' | 'objet';
    funeraireMode?: 'both' | 'candle' | 'flower' | 'none';
    labels?: TributeLabels;
}

export default function TributeBlock({ prenom, memorialId, template, type = 'funeraire', funeraireMode = 'both', labels }: TributeBlockProps) {
    if (!prenom || funeraireMode === 'none') return null;

    return (
        <TributeMemorial
            prenom={prenom}
            memorialId={memorialId}
            accentColor={template.colors.accent}
            textColor={template.colors.text}
            bgColor={template.colors.bg}
            type={type}
            funeraireMode={funeraireMode}
            labels={labels}
        />
    );
}
