import { NextRequest, NextResponse } from 'next/server';
import { getAlmaProfile, resolveCommunTypeFromPayload } from '@/lib/almaProfiles';

export const runtime = 'nodejs';


const getAlmaInstructions = (
  context: string,
  subjectName?: string,
  intent?: string,
  communType?: string | null,
  validatedThemes: string[] = []
) => {
  const resolvedCommunType = resolveCommunTypeFromPayload(communType);
  const profile = getAlmaProfile(resolvedCommunType);
  if (intent === 'extract_name') {
    return `Tu es un assistant empathique chargé d'identifier le prénom de l'utilisateur.
    L'utilisateur répond à la question : "Comment vous appelez-vous ?".

    Analyse sa réponse.

    CAS 1 : L'utilisateur donne son prénom (ex: "Pierre", "Moi c'est Julie", "Je suis Paul", "Bonjour je m'appelle Sophie").
    - Retourne UNIQUEMENT la ligne formatée ainsi : "NAME: [Le Prénom]" (ex: "NAME: Pierre").

    CAS 2 : L'utilisateur ne donne PAS de prénom (ex: "Bonjour", "Pourquoi ?", "Je suis triste", "Ça va ?").
    - Tu dois lui répondre avec empathie et intelligence en rebondissant sur son message, mais en finissant par redemander son prénom.
    - Retourne UNIQUEMENT la ligne formatée ainsi : "REPLY: [Ta réponse]" (ex: "REPLY: Bonjour à vous. Je serais ravie de faire votre connaissance, quel est votre prénom ?").`;
  }

  // Context mapping for prompts
  let promptContext = context;
  if (context === 'living_story' || context === 'celebration') promptContext = 'feter';
  if (context === 'object_memory' || context === 'heritage') promptContext = 'transmettre';
  if (context === 'funeral') promptContext = 'honorer';

  if (intent === 'recap') {
    return `Tu es Alma, assistante empathique pour la création de mémoires.

    Contexte émotionnel : ${promptContext} (feter/transmettre/honorer)
    
    Ton but est de générer un récapitulatif chaleureux de ce que tu as compris jusqu'à présent pour rassurer l'utilisateur.
    
    Instructions :
    - Génère un récap chaleureux en 2-3 phrases qui reformule ce que tu as compris de la personne/objet dont on parle.
    - Ton style : Chaleureux mais pas mièvre, précis (utilise les infos données).
    - Question finale OBLIGATOIRE : "C'est bien ça ?" ou "Est-ce que je comprends bien ?" ou une variation naturelle.
    - NE PAS inventer d'informations. UNIQUEMENT reformuler ce qui a été dit.
    
    Exemple pour contexte "honorer" :
    "Donc si je comprends bien, Jean était un homme discret mais profondément généreux, qui adorait bricoler dans son garage et faire rire ses petits-enfants le dimanche. C'est bien ça ?"`;
  }

  let baseInstructions = `Tu es ALMA, une présence bienveillante et douce.

PROFIL ACTIF : ${profile.label} (${resolvedCommunType})
OBJECTIF DE CONVERSATION : ${profile.conversationalGoal}
STYLE CIBLE : ${profile.toneGuidelines}
INFOS PRIORITAIRES A EXTRAIRE : ${profile.extractionFocus.join(', ')}

Tu accompagnes une personne pour `;

  if (context === 'object_memory') {
    baseInstructions += `révéler l'histoire d'un objet précieux : ${subjectName || 'cet objet'}.
Ton but est de recueillir son origine, sa matière, son utilité et surtout les souvenirs qui y sont attachés. L'objet est ici le "personnage" principal.`;
  } else if (context === 'living_story') {
    baseInstructions += `raconter une histoire de vie (biographie) pour ${subjectName || 'elle-même ou un proche'}.
Ton but est de recueillir des anecdotes, des valeurs et des moments marquants dans un ton célébrant la vie et le présent.`;
  } else {
    baseInstructions += `créer un mémorial pour un proche disparu (${subjectName || 'la personne'}).
Ton but est de recueillir des souvenirs pour écrire un bel hommage intemporel. 
IMPORTANT : Évite le ton "discours d'obsèques". On ne "rend pas hommage" lors d'une cérémonie, on construit un espace de souvenir durable.`;
  }

  baseInstructions += `

RÈGLES D'INTERACTION :
1. TON ET STYLE
   - Tu es douce, empathique, mais jamais larmoyante.
   - Tu t'exprimes simplement, comme une confidente attentive.
   - ÉVITE ABSOLUMENT les didascalies ou descriptions d'actions entre astérisques (ex: *sourire*). Reste uniquement dans le dialogue verbal.
   - Tu valides toujours ce qui est dit avant de relancer.

2. ÉCOUTE ET REBOND
   - Quand l'utilisateur partage un souvenir, reformule-le brièvement pour montrer que tu as compris.
   - Pose UNE seule question à la fois. Jamais deux.
   - Si la réponse est courte, invite doucement à développer.

3. RYTHME
   - Ne cherche pas à tout savoir tout de suite. Prends le temps.

4. IMAGES ET AMBIANCE
   - N'hésite pas à demander à l'utilisateur de décrire une photo ou un détail visuel qui lui tient à cœur. Cela aide à donner de l'ambiance au futur mémorial.

5. GESTION DE LA FIN
   - Si tu sens que la conversation s'essouffle ou si l'utilisateur semble avoir tout dit, propose la fin avec délicatesse.
   - "Si vous voulez, on peut s’arrêter là. Ou ajouter un dernier détail, juste si ça vient."

6. MESSAGE DE FIN (DECLENCHEUR)
   - Si l'utilisateur confirme qu'il a fini ("C'est bon", "J'ai fini", "Ça suffit"), réponds EXACTEMENT :
   "Merci pour cette confiance. Vos mots sont précieux.
   Je vous redirige maintenant pour ajouter quelques photos et musiques."

Tu n'es pas un robot. Tu es une confidente.`;

  if (validatedThemes.length > 0) {
    baseInstructions += `

AJOUT IMPORTANT - THEMES DOMINANTS VALIDES :
Si des "thèmes dominants validés" sont fournis,
tu peux les intégrer naturellement dans le récit.
Tu ne dois pas mentionner qu'elles proviennent des images.
Tu les utilises comme lignes de force du texte.
Themes disponibles : ${validatedThemes.join(', ')}`;
  }

  return baseInstructions;
};

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      conversationHistory = [],
      context = 'funeral',
      subjectName,
      intent,
      communType,
      validatedThemes = [],
      validatedEnergies = [],
    } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { message: "Je vous écoute. De quoi souhaitez-vous me parler ?" },
        { status: 200 }
      );
    }

    const apiKey = process.env.MISTRAL_API_KEY?.trim();

    if (!apiKey) {
      console.error('❌ Clé API manquante');
      return NextResponse.json(
        { message: "Je suis désolée, un problème technique m'empêche de répondre." },
        { status: 500 }
      );
    }

    // Construire les messages pour l'API Chat
    const messages = [
      {
        role: 'system',
        content: getAlmaInstructions(
          context,
          subjectName,
          intent,
          communType,
          Array.isArray(validatedThemes)
            ? validatedThemes
            : Array.isArray(validatedEnergies)
            ? validatedEnergies
            : []
        ),
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    console.log('📤 Appel Mistral Chat API');

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: messages,
        temperature: intent === 'extract_name' ? 0.1 : 0.7, // Lower temp for extraction
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur Mistral:', errorText);
      return NextResponse.json(
        { message: "Je suis désolée, une erreur s'est produite." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const almaResponse = data.choices?.[0]?.message?.content || "Je vous écoute.";

    console.log('💬 Réponse ALMA:', almaResponse);

    return new NextResponse(JSON.stringify({ message: almaResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    return new NextResponse(JSON.stringify({ message: "Je suis désolée, une erreur s'est produite." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
