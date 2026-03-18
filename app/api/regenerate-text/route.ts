import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import { generateMistralPrompt } from '@/lib/generateMistralPrompt';
import {
  appendMemoryActivityLog,
  buildMemoryContributionPrompt,
  getMemoryAccessProfile,
  hasAdministrativeMemoryRole,
} from '@/lib/server/memoryCollaboration';
import { appendMemoryTextVersion } from '@/lib/server/memoryTextVersions';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';


export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = getSupabaseAdmin();
    const { memory_id: memoryId, new_style: newStyle } = await request.json();
    const normalizedMemoryId = String(memoryId || '').trim();
    const normalizedStyle = String(newStyle || 'narratif').trim();

    if (!normalizedMemoryId) {
      return NextResponse.json({ error: 'memory_id manquant' }, { status: 400 });
    }

    const accessProfile = await getMemoryAccessProfile(admin, normalizedMemoryId, user.id);
    const memory = accessProfile.memory;
    if (!memory) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!hasAdministrativeMemoryRole(accessProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: fullMemory, error: memoryError } = await admin
      .from('memories')
      .select('*')
      .eq('id', normalizedMemoryId)
      .single();

    if (memoryError || !fullMemory) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (fullMemory.regeneration_count >= (fullMemory.regeneration_limit || 3)) {
      return NextResponse.json({ error: 'Limit reached' }, { status: 403 });
    }

    let prompt = generateMistralPrompt(fullMemory.data || {});
    const contributionContext = await buildMemoryContributionPrompt(admin, normalizedMemoryId);
    if (contributionContext.promptSection) {
      prompt = `${prompt}${contributionContext.promptSection}`;
    }

    let styleInstruction = '';
    if (normalizedStyle === 'sobre') {
      styleInstruction = 'Adopte un ton sobre, factuel et journalistique. Evite les adjectifs superflus.';
    } else if (normalizedStyle === 'poetique') {
      styleInstruction = 'Adopte un ton poetique, litteraire et evocateur. Utilise des images sensibles sans emphase religieuse.';
    } else {
      styleInstruction = "Adopte un ton chaleureux, narratif et empathique. Raconte une histoire singuliere, concrete et humaine.";
    }

    const systemPrompt = `Tu es un biographe professionnel. Redige un hommage de 300 a 500 mots. ${styleInstruction}`;
    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!mistralResponse.ok) {
      const errorText = await mistralResponse.text();
      console.error('REGENERATE mistral error:', errorText);
      return NextResponse.json({ error: 'Generation impossible pour le moment' }, { status: 502 });
    }

    const responsePayload = await mistralResponse.json();
    const generatedText = responsePayload.choices[0]?.message?.content || '';
    if (!generatedText.trim()) {
      return NextResponse.json({ error: 'Aucun texte genere' }, { status: 502 });
    }

    const { error: updateError } = await admin
      .from('memories')
      .update({
        generated_text_original: generatedText,
        generated_text_edited: null,
        text_manually_edited: false,
        style: normalizedStyle,
        regeneration_count: (fullMemory.regeneration_count || 0) + 1,
        bio: generatedText,
        updated_at: new Date().toISOString(),
      })
      .eq('id', normalizedMemoryId);

    if (updateError) {
      console.error('REGENERATE update error:', updateError);
      return NextResponse.json({ error: 'Impossible de sauvegarder la nouvelle version' }, { status: 500 });
    }

    await appendMemoryTextVersion(admin, {
      memoryId: normalizedMemoryId,
      createdByUserId: user.id,
      createdByEmail: user.email || null,
      actorRole: accessProfile.role,
      source: 'dashboard_text_regeneration',
      versionKind: 'regenerated',
      style: normalizedStyle,
      contentText: generatedText,
      metadata: {
        contributionCount: contributionContext.contributionCount,
      },
    });

    await appendMemoryActivityLog(admin, {
      memoryId: normalizedMemoryId,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: accessProfile.role,
      source: 'dashboard',
      action: 'memorial_text_generated',
      targetType: 'memory',
      targetId: normalizedMemoryId,
      metadata: {
        regenerated: true,
        style: normalizedStyle,
        contributionCount: contributionContext.contributionCount,
      },
    });

    return NextResponse.json({
      generated_text: generatedText,
      contributionCount: contributionContext.contributionCount,
    });
  } catch (error: any) {
    console.error('REGENERATE fatal error:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
