import { NextRequest, NextResponse } from 'next/server';
import { getAlmaProfile, resolveCommunTypeFromPayload } from '@/lib/almaProfiles';

export const runtime = 'nodejs';


export async function POST(request: NextRequest) {
    try {
        const { conversationHistory, collectedInfo, context, genre, subjectName, preferredStyle, communType } = await request.json();
        const resolvedCommunType = resolveCommunTypeFromPayload(communType);
        const profile = getAlmaProfile(resolvedCommunType);

        const apiKey = process.env.MISTRAL_API_KEY?.trim();
        if (!apiKey) {
            return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
        }

        // VALIDATION: Vérifier qu'on a assez de conversation
        const userMessages = (conversationHistory || [])
            .filter((m: any) => m.role === 'user')
            .map((m: any) => m.content || '');
        
        if (userMessages.length < 2) {
            console.warn('⚠️ Tentative de génération avec matière insuffisante');
            return NextResponse.json({
                teaserText: 'Impossible de générer avec si peu d\'information. Continuez votre conversation avec Alma.',
                success: false,
                error: 'insufficient_material'
            }, { status: 400 });
        }

        // Construire le prompt pour le TEASER
        const conversationText = userMessages.join('\n');

        const prompt = `Tu es Alma, biographe sensible.
Profil actif : ${profile.label} (${resolvedCommunType})
Objectif : ${profile.teaserGoal}
Ton attendu : ${profile.toneGuidelines}

Contexte émotionnel : ${context === 'honorer' ? 'hommage à une personne disparue' : context === 'feter' ? 'célébration d\'une personne vivante' : 'transmission d\'une mémoire'}

Genre : ${genre || 'Non spécifié'}
Prénom : ${subjectName || 'Non communiqué'}
Ton souhaité : ${preferredStyle || 'Digne et touchant'}

Conversation avec l'utilisateur :
${conversationText}

Informations extraites :
${JSON.stringify(collectedInfo, null, 2)}

TA MISSION :
Génère un texte TEASER de 3-4 lignes maximum.

RÈGLES ABSOLUES :
- Court et incomplet (pour donner envie d'en savoir plus)
- Séduisant mais frustrant (on veut la suite !)
- Digne et respectueux
- Utilise UNIQUEMENT les infos données (n'invente RIEN)
- Si contexte "honorer" → passé
- Si contexte "feter" → présent
- Finis par "..." pour créer l'attente

Exemple pour "honorer" :
"Jean était un homme discret, aux mains habiles. Dans son atelier, il façonnait le bois avec une patience infinie. Son rire..."

Exemple pour "feter" :
"Marie est une femme pétillante qui illumine chaque pièce où elle entre. Ses gâteaux du dimanche rassemblent toute la famille autour de sa table..."

Retourne UNIQUEMENT le texte, sans introduction ni conclusion.`;

        console.log('📤 Génération TEASER Alma');

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'mistral-large-latest',
                messages: [
                    {
                        role: 'system',
                        content: 'Tu es une biographe experte en création de textes courts et évocateurs. Tu respectes absolument les faits donnés.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 150, // Court !
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erreur Mistral Teaser:', errorText);
            return NextResponse.json({ message: "Erreur génération" }, { status: 500 });
        }

        const data = await response.json();
        const teaserText = data.choices?.[0]?.message?.content?.trim();

        console.log('✅ Teaser généré:', teaserText);

        return NextResponse.json({
            teaserText: teaserText,
            success: true
        });

    } catch (error) {
        console.error('❌ Erreur serveur generate-teaser:', error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}
