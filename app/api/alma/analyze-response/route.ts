import { NextRequest, NextResponse } from 'next/server';
import { getAlmaProfile, resolveCommunTypeFromPayload } from '@/lib/almaProfiles';

export const runtime = 'nodejs';


export async function POST(request: NextRequest) {
    try {
        const { userResponse, conversationHistory = [], collectedInfo = {}, context = 'honorer', communType } = await request.json();
        const resolvedCommunType = resolveCommunTypeFromPayload(communType);
        const profile = getAlmaProfile(resolvedCommunType);

        if (!userResponse || typeof userResponse !== 'string') {
            return NextResponse.json(
                { message: "Réponse utilisateur manquante" },
                { status: 400 }
            );
        }

        const apiKey = process.env.MISTRAL_API_KEY?.trim();

        if (!apiKey) {
            console.error('❌ Clé API manquante');
            return NextResponse.json(
                { message: "Erreur configuration serveur" },
                { status: 500 }
            );
        }

        // Mapping contexte émotionnel
        let toneContext = 'honorer une mémoire';
        if (context === 'living_story' || context === 'feter') toneContext = 'célébrer une vie (feter)';
        if (context === 'object_memory' || context === 'transmettre') toneContext = 'transmettre l\'histoire d\'un objet';

        // Prompt optimisé pour l'intelligence conversationnelle
        const prompt = `Tu es Alma, assistante biographe empathique.
    PROFIL : ${profile.label} (${resolvedCommunType})
    CONTEXTE : Nous sommes ici pour ${toneContext}.
    OBJECTIF : ${profile.conversationalGoal}
    FOCUS D'EXTRACTION : ${profile.extractionFocus.join(', ')}
    
    L'utilisateur vient de répondre : "${userResponse}"

    Historique récent :
    ${JSON.stringify(conversationHistory.slice(-4))}

    Informations déjà collectées (NE PAS REDEMANDER) :
    ${JSON.stringify(collectedInfo)}

    TA MISSION :
    1. Analyse la réponse pour extraire TOUTES les nouvelles informations (prénom, nom, dates, lieux, liens, anecdotes, sentiments...).
    2. Détermine la prochaine question la plus naturelle et fluide.
    3. Si la réponse est floue ("C'était bien"), pose une question de relance douce ("Qu'est-ce qui vous a le plus marqué ?").
    4. Si l'utilisateur indique qu'il a fini ("C'est tout", "J'ai fini", "Stop"), ta nextQuestion DOIT être : "Merci pour cette confiance. Je vous redirige maintenant."

    Retourne UNIQUEMENT un JSON :
    {
      "extractedInfo": { "firstname": "...", "lastname": "...", ... },
      "nextQuestion": "Ta question ici...",
      "confidence": 0.9
    }`;

        console.log('📤 Appel Mistral Analyze API');

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'mistral-large-latest',
                messages: [
                    { role: 'system', content: 'Tu es une IA experte en extraction d\'information. Réponds uniquement en JSON valide.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.2,
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) throw new Error(await response.text());

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        let analysis;
        try {
            analysis = JSON.parse(content);
        } catch (e) {
            console.error('❌ Erreur parsing JSON:', content);
            // Fallback simple
            return NextResponse.json({
                nextQuestion: "Je vous écoute, continuez.",
                confidence: 0,
                extractedInfo: {}
            }, { status: 200 });
        }

        console.log('✅ Analyse ALMA:', analysis);
        return NextResponse.json(analysis, { status: 200 });

    } catch (error) {
        console.error('❌ Erreur serveur analyze-response:', error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}
