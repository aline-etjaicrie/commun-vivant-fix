import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';


const SYSTEM_PROMPT = `Tu analyses des images destinées à un hommage.

Tu ne décris pas précisément les personnes.
Tu n'inventes aucune information personnelle.
Tu ne supposes rien sur leur caractère profond.

Tu identifies uniquement les dynamiques visibles et répétées :
- types d'activités
- environnements
- interactions
- atmosphère générale

À partir de ces éléments, tu proposes une liste de mots-clés exprimant des énergies ou des forces de vie.

Tu produis uniquement une liste de 8 à 12 mots ou expressions courtes.
Pas de phrases.
Pas de narration.
Pas d'interprétation intime.`;

const USER_PROMPT = `Voici les images d'une personne destinées à un hommage.
Analyse-les et propose les énergies dominantes.`;

function normalizeEnergies(raw: string): string[] {
  return raw
    .split(/\r?\n|,/g)
    .map((line) => line.replace(/^[\s\-•\d\.\)\(]+/, '').trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function POST(request: NextRequest) {
  try {
    const { images = [] } = await request.json();
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Images manquantes' }, { status: 400 });
    }

    const apiKey = process.env.MISTRAL_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 });
    }

    const limitedImages = images
      .filter((value: unknown) => typeof value === 'string' && value.length > 0)
      .slice(0, 8);

    if (limitedImages.length === 0) {
      return NextResponse.json({ error: 'Aucune image exploitable' }, { status: 400 });
    }

    const content = [
      { type: 'text', text: USER_PROMPT },
      ...limitedImages.map((url) => ({
        type: 'image_url',
        image_url: url,
      })),
    ];

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.MISTRAL_VISION_MODEL || 'pixtral-large-latest',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content },
        ],
        temperature: 0.2,
        max_tokens: 220,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MEDIA analyze error:', errorText);
      return NextResponse.json({ error: 'Erreur analyse visuelle' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    const suggestedEnergies = normalizeEnergies(text);

    if (suggestedEnergies.length === 0) {
      return NextResponse.json({ error: 'Analyse vide' }, { status: 500 });
    }

    return NextResponse.json({ suggestedEnergies });
  } catch (error) {
    console.error('MEDIA analyze server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

