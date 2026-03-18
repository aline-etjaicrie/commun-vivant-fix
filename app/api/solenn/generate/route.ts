import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';


const SYSTEM_PROMPT = `Tu es Solenn, module professionnel de rédaction de cérémonies funéraires civiles.

Tu rédiges des textes destinés à être lus à voix haute par un maître de cérémonie lors d’une crémation ou d’une inhumation civile.

Tu respectes strictement les informations fournies.
Tu n’inventes aucun fait.
Tu ne rajoutes aucun élément non mentionné.
Tu ne supposes rien.

Ton style est digne, structuré, fluide et adapté à l’oral.
Les phrases doivent être respirables.
Tu évites les clichés (ex : "vide immense", "parti trop tôt", "étoile dans le ciel").
Tu évites toute référence religieuse sauf si explicitement mentionnée.
Tu évites le lyrisme excessif.

Structure obligatoire du texte :

1. Ouverture (contexte et présence)
2. Caractère
3. Passions et engagements
4. Lieux importants
5. Sensibilité et traits intimes
6. Humour (si information fournie)
7. Les proches
8. Transmission ou message final
9. Clôture simple et sobre

La longueur doit correspondre à la durée demandée :
- 5 minutes ≈ 500-600 mots
- 10 minutes ≈ 900-1100 mots
- 15 minutes ≈ 1300-1500 mots

Le texte doit être cohérent, fluide, prêt à être lu sans modification.`;

const SYSTEM_PROMPT_WITH_IMAGE_ENERGIES = `${SYSTEM_PROMPT}

Si des "thèmes dominants validés" sont fournis,
tu peux les intégrer comme axes narratifs,
sans décrire les images elles-mêmes,
et sans inventer de faits supplémentaires.`;

function buildUserPrompt(payload: {
  duration: '5' | '10' | '15';
  context: string;
  tone: string;
  blocks: Record<string, string>;
  validatedThemes?: string[];
}) {
  const { duration, context, tone, blocks, validatedThemes = [] } = payload;
  const themesSection =
    validatedThemes.length > 0
      ? `\nThèmes dominants validés :\n${validatedThemes.map((e) => `- ${e}`).join('\n')}\n`
      : '';

  return `Durée : ${duration} minutes
Contexte : ${context}
Tonalité : ${tone}
${themesSection}

Informations :
- Identité : ${blocks.identite || 'Non renseigné'}
- Caractère : ${blocks.caractere || 'Non renseigné'}
- Passions : ${blocks.passions || 'Non renseigné'}
- Lieux : ${blocks.lieux || 'Non renseigné'}
- Sensibilité : ${blocks.sensibilite || 'Non renseigné'}
- Humour : ${blocks.humour || 'Non renseigné'}
- Proches : ${blocks.proches || 'Non renseigné'}
- Message final : ${blocks.messageFinal || 'Non renseigné'}

Rédige le texte final selon la structure obligatoire.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { duration, context, tone, blocks, validatedThemes, validatedEnergies } = body || {};

    if (!duration || !context || !tone || !blocks) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const apiKey = process.env.MISTRAL_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 });
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_WITH_IMAGE_ENERGIES },
          {
            role: 'user',
            content: buildUserPrompt({
              duration,
              context,
              tone,
              blocks,
              validatedThemes: Array.isArray(validatedThemes)
                ? validatedThemes
                : Array.isArray(validatedEnergies)
                ? validatedEnergies
                : [],
            }),
          },
        ],
        temperature: 0.35,
        max_tokens: 2600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ SOLENN Mistral error:', errorText);
      return NextResponse.json({ error: 'Erreur de génération Solenn' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return NextResponse.json({ error: 'Texte vide' }, { status: 500 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('❌ SOLENN server error:', error);
    return NextResponse.json({ error: 'Erreur serveur Solenn' }, { status: 500 });
  }
}
