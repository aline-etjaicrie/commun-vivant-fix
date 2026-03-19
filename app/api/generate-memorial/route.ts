import { NextRequest, NextResponse } from 'next/server';

import { resolveWritingStyle } from '@/lib/compositionStudio';
import { generateMistralPrompt } from '@/lib/generateMistralPrompt';
import { buildMemoryFallbackText } from '@/lib/memoryFallbackText';
import { resolveIdentity } from '@/lib/memorialRuntime';
import {
  appendMemoryActivityLog,
  buildMemoryContributionPrompt
} from '@/lib/server/memoryCollaboration';
import { appendMemoryTextVersion } from '@/lib/server/memoryTextVersions';
import {
  isMissingSupabaseAdminEnvironmentError,
} from '@/lib/server/supabaseAdmin';
import { authorizeMemoryGeneration } from '@/lib/server/memoryGenerationAccess';

export const runtime = 'nodejs';

function normalizeToken(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function getLeadingToken(value: string): string {
  return (
    String(value || '')
      .trim()
      .replace(/^[\s"'“”‘’«»([{-]+/, '')
      .split(/[\s,.;:!?)}\]-]+/)
      .find(Boolean) || ''
  );
}

function hasTruncatedClosing(value: string): boolean {
  const trimmed = String(value || '').trim();
  return (
    /(?:^|\n)\s*En mémoire de\s*$/i.test(trimmed) ||
    /(?:^|\n)\s*À\s*$/i.test(trimmed) ||
    /(?:^|\n)\s*De la part de\s*$/i.test(trimmed)
  );
}

function collectExpectedKeyFacts(data: any): string[] {
  const facts = [
    data?.identite?.dateNaissance,
    data?.talents?.talent,
    data?.talents?.passions,
    data?.gouts?.lieu,
    data?.gouts?.phrase,
    data?.gouts?.citation,
    ...(Array.isArray(data?.valeurs?.selected) ? data.valeurs.selected : []),
  ];

  return Array.from(
    new Set(
      facts
        .map((value) => String(value || '').trim())
        .filter((value) => value.length >= 4)
    )
  ).slice(0, 3);
}

function validateGeneratedMemorialText(value: string, data: any): { ok: true } | { ok: false; reason: string } {
  const identity = resolveIdentity(data || {});
  const expectedFirstName = String(identity?.prenom || '').trim();
  const normalizedExpectedFirstName = normalizeToken(expectedFirstName);
  const normalizedText = normalizeToken(value);
  const expectedKeyFacts = collectExpectedKeyFacts(data || {});

  if (hasTruncatedClosing(value)) {
    return { ok: false, reason: 'truncated_closing' };
  }

  if (!normalizedExpectedFirstName) {
    return { ok: true };
  }

  const leadingToken = normalizeToken(getLeadingToken(value));
  if (!leadingToken || leadingToken !== normalizedExpectedFirstName) {
    return { ok: false, reason: 'unexpected_opening_identity' };
  }

  if (!normalizedText.includes(normalizedExpectedFirstName)) {
    return { ok: false, reason: 'missing_subject_identity' };
  }

  if (
    expectedKeyFacts.length > 0 &&
    !expectedKeyFacts.some((fact) => normalizedText.includes(normalizeToken(fact)))
  ) {
    return { ok: false, reason: 'missing_key_fact' };
  }

  return { ok: true };
}

export async function POST(req: NextRequest) {
  try {
    const { memoryId, prompt: customPrompt, draftToken, sessionId, data: requestData } = await req.json();

    if (!memoryId) {
      return NextResponse.json({ error: 'Missing memoryId' }, { status: 400 });
    }

    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: 'MISTRAL_API_KEY manquante côté serveur' },
        { status: 503 }
      );
    }

    const keyPrefix = (process.env.MISTRAL_API_KEY || '').slice(0, 8);
    console.log(`[generate-memorial] MISTRAL_API_KEY prefix: ${keyPrefix}... (${(process.env.MISTRAL_API_KEY || '').length} chars)`);

    const runGeneration = async (prompt: string) => {
      let lastErrorMessage = 'Generation unavailable';
      let lastMistralStatus: number | null = null;
      const maxAttempts = 2;
      const models = (process.env.MISTRAL_MODEL || '')
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);
      const modelCandidates = models.length > 0 ? models : ['mistral-large-latest', 'mistral-small-latest'];

      // Timeout adapté par modèle : large = 20s, small = 12s
      const timeoutForModel = (model: string) =>
        model.includes('large') ? 20000 : 12000;

      for (const model of modelCandidates) {
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          const requestTimeoutMs = timeoutForModel(model);
          console.log(`[generate-memorial] Trying model=${model} attempt=${attempt} timeout=${requestTimeoutMs}ms`);
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
            const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: 'Tu es un écrivain spécialisé dans les récits mémoriels.' },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.35,
                max_tokens: 1500,
              }),
            });
            clearTimeout(timeout);
            lastMistralStatus = mistralResponse.status;

            if (!mistralResponse.ok) {
              const errorText = await mistralResponse.text();
              console.error(`[generate-memorial] Mistral HTTP ${mistralResponse.status} (model=${model} attempt=${attempt}): ${errorText}`);
              if (mistralResponse.status === 401) {
                lastErrorMessage = `Mistral: clé API invalide ou expirée (401)`;
              } else if (mistralResponse.status === 429) {
                lastErrorMessage = `Mistral: rate limit atteint (429)`;
              } else {
                lastErrorMessage = `Mistral HTTP ${mistralResponse.status} (${model}): ${errorText.slice(0, 200)}`;
              }
            } else {
              const mistralData = await mistralResponse.json();
              const generatedText = mistralData.choices[0]?.message?.content || '';

              if (generatedText) {
                console.log(`[generate-memorial] Success model=${model} attempt=${attempt} chars=${generatedText.length}`);
                return { text: generatedText, usedFallback: false, mistralStatus: mistralResponse.status };
              }

              lastErrorMessage = `Mistral: réponse vide (${model})`;
            }
          } catch (error: any) {
            const isTimeout = error?.name === 'AbortError';
            const msg = isTimeout
              ? `Mistral: timeout après ${requestTimeoutMs}ms (model=${model})`
              : String(error?.message || error || 'fetch failed');
            console.error(`[generate-memorial] Fetch failed model=${model} attempt=${attempt}: ${msg}`);
            lastErrorMessage = msg;
          }

          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
          }
        }
      }

      console.error(`[generate-memorial] All models failed. Last error: ${lastErrorMessage}`);
      return {
        text: '',
        usedFallback: true,
        fallbackReason: lastErrorMessage,
        mistralStatus: lastMistralStatus,
      };
    };

    const access = await authorizeMemoryGeneration({
      request: req,
      memoryId,
      allowPaidCheckoutSessionId: typeof sessionId === 'string' ? sessionId : null,
      draftToken: typeof draftToken === 'string' ? draftToken : null,
    });

    if (!access.ok) {
      if (access.status === 404 && customPrompt && process.env.NODE_ENV !== 'production') {
        const generated = await runGeneration(customPrompt);
        return NextResponse.json({
          success: true,
          text: generated.usedFallback ? buildMemoryFallbackText({}) : generated.text,
          persisted: false,
          usedFallback: generated.usedFallback,
          fallbackReason: generated.usedFallback ? (generated.fallbackReason || null) : null,
          mistralStatus: (generated as any).mistralStatus ?? null,
        });
      }
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const memory = access.memory;
    const supabase = access.admin;
    const rawCommunType = memory?.data?.communType || requestData?.communType;
    const communType =
      rawCommunType === 'hommage-vivant' ||
      rawCommunType === 'transmission-familiale' ||
      rawCommunType === 'memoire-objet' ||
      rawCommunType === 'pro-ceremonie'
        ? rawCommunType
        : 'deces';

    if (requestData) {
      const { error: updateDataError } = await supabase
        .from('memories')
        .update({ data: requestData })
        .eq('id', memoryId);

      if (updateDataError) {
        console.error('Error updating memory data:', updateDataError);
      } else {
        memory.data = requestData;
      }
    }

    const requestedWritingStyle = resolveWritingStyle(
      memory?.data?.writingStyle || memory?.data?.style,
      communType
    );

    // Use custom prompt if provided, otherwise generate from memory data
    const basePrompt = customPrompt || generateMistralPrompt(memory.data || {});
    const contributionContext = await buildMemoryContributionPrompt(supabase, memoryId);
    const prompt = contributionContext.promptSection
      ? `${basePrompt}${contributionContext.promptSection}`
      : basePrompt;

    // 3. Call Mistral AI
    const generated = await runGeneration(prompt);
    const validation = generated.usedFallback
      ? { ok: true as const }
      : validateGeneratedMemorialText(generated.text, memory.data || {});
    const fallbackReason = generated.usedFallback
      ? generated.fallbackReason || null
      : validation.ok
      ? null
      : validation.reason;
    const shouldUseFallback = generated.usedFallback || !validation.ok;
    const generatedText = shouldUseFallback
      ? buildMemoryFallbackText(memory.data || {})
      : generated.text;

    if (!generated.usedFallback && !validation.ok) {
      console.error(`[generate-memorial] Rejected model output for memory ${memoryId}: ${validation.reason}`);
    }

    // 4. Update Memory in DB
    const { error: updateError } = await supabase
      .from('memories')
      .update({
        bio: generatedText,
        status: 'completed',
        generation_status: 'generated',
        updated_at: new Date().toISOString(),
      })
      .eq('id', memoryId);

    if (updateError) {
      console.error('Error updating memory:', updateError);
      throw new Error('Failed to save generated text');
    }

    await appendMemoryActivityLog(supabase, {
      memoryId,
      actorUserId: access.actorUserId,
      actorEmail: access.actorEmail,
      actorRole: access.actorRole,
      source: 'generation_api',
      action: 'memorial_text_generated',
      targetType: 'memory',
      targetId: memoryId,
      metadata: {
        usedCustomPrompt: Boolean(customPrompt),
        contributionCount: contributionContext.contributionCount,
        usedFallback: shouldUseFallback,
        fallbackReason,
        writingStyle: requestedWritingStyle,
      },
    });

    await appendMemoryTextVersion(supabase, {
      memoryId,
      createdByUserId: access.actorUserId,
      createdByEmail: access.actorEmail,
      actorRole: access.actorRole,
      source: 'generation_api',
      versionKind: customPrompt ? 'generated_custom_prompt' : 'generated',
      style: requestedWritingStyle || memory.style || null,
      contentText: generatedText,
      metadata: {
        contributionCount: contributionContext.contributionCount,
        usedFallback: shouldUseFallback,
        fallbackReason,
        writingStyle: requestedWritingStyle,
      },
    });

    return NextResponse.json({
      success: true,
      text: generatedText,
      contributionCount: contributionContext.contributionCount,
      usedFallback: shouldUseFallback,
      fallbackReason,
      mistralStatus: (generated as any).mistralStatus ?? null,
    });

  } catch (error: any) {
    console.error('Generate Memorial Error:', error);

    if (isMissingSupabaseAdminEnvironmentError(error)) {
      return NextResponse.json(
        {
          error:
            "La preproduction n'est pas encore completement configuree. Il manque une variable serveur Supabase. Merci de reessayer dans quelques instants.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
