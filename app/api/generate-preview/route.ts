/**
 * API de génération partielle pour la preview Alma
 * Génère seulement 2-3 paragraphes d'introduction au lieu du texte complet
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';


interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PreviewRequest {
  conversation: Message[];
  context: 'funeral' | 'living_story' | 'object_memory';
  subjectName: string;
  genre: 'Elle' | 'Il' | 'Sans genre spécifié';
  style?: 'sobre' | 'narratif' | 'poetique';
}

/**
 * Construit le prompt système pour la génération preview
 */
function buildPreviewPrompt(
  conversation: Message[],
  context: string,
  subjectName: string,
  genre: string,
  style: string = 'sobre'
): string {
  // Déterminer les pronoms grammaticaux
  const pronoms = genre === 'Elle'
    ? { sujet: 'elle', objet: 'la', possessif: 'sa' }
    : genre === 'Il'
      ? { sujet: 'il', objet: 'le', possessif: 'son' }
      : { sujet: 'iel', objet: 'iel', possessif: 'son' };

  // Adapter le style littéraire
  const styleInstructions = {
    sobre: 'Style sobre et épuré. Phrases courtes et efficaces. Pas de lyrisme excessif.',
    narratif: 'Style narratif et vivant. Raconter comme une histoire. Privilégier les scènes et les détails.',
    poetique: 'Style poétique et évocateur. Images littéraires bienvenues. Prose rythmée.'
  };

  // Adapter le contexte
  let contextInstructions = '';
  if (context === 'funeral') {
    contextInstructions = `Il s'agit d'un mémorial pour ${subjectName}, une personne disparue.
Ton but : créer un début d'hommage intemporel qui capture l'essence de cette personne.
ATTENTION : Évite le ton "discours d'obsèques". On ne rend pas hommage lors d'une cérémonie, on crée un espace de souvenir durable.`;
  } else if (context === 'living_story') {
    contextInstructions = `Il s'agit d'une biographie vivante pour ${subjectName}.
Ton but : créer un début de récit qui célèbre cette vie au présent.
Ton : optimiste, tourné vers l'accomplissement et la richesse du parcours.`;
  } else {
    contextInstructions = `Il s'agit d'un mémorial pour un objet précieux : ${subjectName}.
Ton but : raconter le début de l'histoire de cet objet comme s'il était un personnage.
Approche : l'objet est le protagoniste, il a une histoire, une origine, une âme.`;
  }

  // Extraire les éléments clés de la conversation
  const conversationSummary = conversation
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .slice(0, 10) // Limiter pour ne pas surcharger le prompt
    .join('\n- ');

  return `Tu es un écrivain français spécialisé dans les textes mémoriels de haute qualité littéraire.

═══════════════════════════════════════
MISSION
═══════════════════════════════════════
Génère UNIQUEMENT les 2-3 PREMIERS PARAGRAPHES d'introduction d'un texte mémoriel.

Ce n'est PAS le texte complet. C'est un APERÇU destiné à donner envie de lire la suite.

Le reste du texte sera généré plus tard, donc :
- Ne conclus PAS
- Ne résume PAS toute la vie
- Crée un DÉBUT captivant qui ouvre des portes

═══════════════════════════════════════
CONTEXTE
═══════════════════════════════════════
${contextInstructions}

Pronoms à utiliser : ${pronoms.sujet} / ${pronoms.objet} / ${pronoms.possessif}

═══════════════════════════════════════
STYLE DEMANDÉ
═══════════════════════════════════════
${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.sobre}

═══════════════════════════════════════
ÉLÉMENTS RECUEILLIS LORS DE LA CONVERSATION
═══════════════════════════════════════
- ${conversationSummary}

═══════════════════════════════════════
CONSIGNES DE RÉDACTION
═══════════════════════════════════════
1. LONGUEUR : Maximum 300 mots (2-3 paragraphes)
2. DÉBUT CAPTIVANT : Commence par un élément marquant, une image, un trait de caractère fort
3. NE PAS CONCLURE : Le texte doit donner envie de découvrir la suite
4. AUTHENTICITÉ : Utilise les détails concrets de la conversation, pas de généralités
5. TON : ${context === 'funeral' ? 'Intemporel et doux, jamais larmoyant' : context === 'living_story' ? 'Célébrant et vivant' : 'Narratif et évocateur'}

═══════════════════════════════════════
EXEMPLES D'OUVERTURE (À ADAPTER, PAS À COPIER)
═══════════════════════════════════════
Style sobre :
"Marie avait cette façon de sourire qui mettait immédiatement à l'aise. Une présence discrète mais essentielle..."

Style narratif :
"C'était un matin d'automne, en 1952, qu'est née Jeanne. Dans cette petite maison de Bretagne, personne n'imaginait encore..."

Style poétique :
"Il y a des êtres qui traversent la vie comme on traverse un jardin : avec grâce, curiosité, et cette attention délicate aux petites choses..."

Maintenant, à toi de créer l'introduction pour ${subjectName}.`;
}

export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequest = await request.json();
    const { conversation, context, subjectName, genre, style = 'sobre' } = body;

    // Validation
    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return NextResponse.json(
        { error: 'Conversation manquante ou invalide' },
        { status: 400 }
      );
    }

    if (!context || !subjectName) {
      return NextResponse.json(
        { error: 'Contexte et nom du sujet requis' },
        { status: 400 }
      );
    }

    // Vérifier la clé API Mistral
    const apiKey = process.env.MISTRAL_API_KEY?.trim();
    if (!apiKey) {
      console.error('❌ Clé API Mistral manquante');
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      );
    }

    // Construire le prompt
    const systemPrompt = buildPreviewPrompt(conversation, context, subjectName, genre, style);

    console.log('📤 Génération preview Alma pour:', subjectName);

    // Appel à l'API Mistral
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
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Génère maintenant l'introduction (2-3 premiers paragraphes) pour ${subjectName}.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 400, // Limité pour la preview
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API Mistral:', errorText);
      return NextResponse.json(
        { error: 'Erreur lors de la génération du texte' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const previewText = data.choices?.[0]?.message?.content || '';

    if (!previewText) {
      console.error('❌ Pas de texte généré');
      return NextResponse.json(
        { error: 'Aucun texte généré' },
        { status: 500 }
      );
    }

    // Calculer les statistiques
    const wordCount = previewText.split(/\s+/).length;
    const estimatedFullLength = Math.ceil(wordCount * 3.5); // Estimation : preview = ~25% du texte final

    console.log('✅ Preview généré:', wordCount, 'mots');

    return NextResponse.json({
      previewText: previewText.trim(),
      wordCount,
      estimatedFullLength,
      paragraphCount: previewText.split('\n\n').filter((p: string) => p.trim()).length,
    });

  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
