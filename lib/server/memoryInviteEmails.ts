import { getBrevoTransport } from '@/lib/server/brevoTransport';

function escapeHtml(value: unknown): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatRoleLabel(role: string): string {
  if (role === 'editor') return 'co-editeur';
  if (role === 'viewer') return 'lecture seule';
  return 'contributeur';
}

export async function sendMemoryInviteEmail(payload: {
  toEmail: string;
  memoryTitle: string;
  inviteUrl: string;
  accessCode: string | null;
  role: string;
  inviterName?: string | null;
  expiresAt?: string | null;
}) {
  const transport = getBrevoTransport();
  if (!transport) {
    return {
      sent: false,
      mode: 'skipped' as const,
      reason: 'BREVO_SMTP_USER ou BREVO_SMTP_PASSWORD manquant',
    };
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Commun Vivant <noreply@communvivant.fr>';
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL || undefined;
  const inviter = payload.inviterName?.trim() || 'Un proche';
  const roleLabel = formatRoleLabel(payload.role);
  const expiryLabel = payload.expiresAt
    ? new Date(payload.expiresAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const subject = `${inviter} vous invite a contribuer a l'espace "${payload.memoryTitle}"`;
  const safeTitle = escapeHtml(payload.memoryTitle);
  const safeInviter = escapeHtml(inviter);
  const safeInviteUrl = escapeHtml(payload.inviteUrl);
  const safeAccessCode = escapeHtml(payload.accessCode || '');
  const safeRoleLabel = escapeHtml(roleLabel);
  const safeExpiry = escapeHtml(expiryLabel || '');

  const text = [
    `${inviter} vous invite a rejoindre l'espace "${payload.memoryTitle}" sur Commun Vivant.`,
    '',
    `Votre acces: ${roleLabel}`,
    payload.accessCode ? `Code d'acces: ${payload.accessCode}` : null,
    `Lien personnel: ${payload.inviteUrl}`,
    expiryLabel ? `Invitation valable jusqu'au ${expiryLabel}.` : null,
    '',
    'Ce lien est personnel. Si vous ne souhaitez pas contribuer, vous pouvez simplement ignorer ce message.',
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family: Georgia, serif; max-width: 640px; margin: 0 auto; color: #0F2A44;">
      <div style="padding: 32px 24px; border: 1px solid #E7D9C8; border-radius: 24px; background: #FFFDF9;">
        <p style="margin: 0 0 12px; color: #7A6B5C; font-size: 14px;">Invitation personnelle</p>
        <h1 style="margin: 0 0 16px; font-size: 30px; font-style: italic; color: #0F2A44;">Vous etes invite a contribuer</h1>
        <p style="margin: 0 0 18px; line-height: 1.7;">
          <strong>${safeInviter}</strong> vous ouvre un acces ${safeRoleLabel} a l'espace
          <strong>"${safeTitle}"</strong> sur Commun Vivant.
        </p>
        <p style="margin: 0 0 22px; line-height: 1.7; color: #4F5F6F;">
          Vous pourrez y deposer un souvenir, aider a relire certains elements ou simplement accompagner la construction de cet espace, selon le role qui vous est donne.
        </p>

        <div style="padding: 18px; border-radius: 18px; background: #F8F4EE; border: 1px solid #E7D9C8; margin-bottom: 22px;">
          <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #7A6B5C;">Lien personnel</p>
          <p style="margin: 0 0 16px; word-break: break-word; color: #0F2A44;">${safeInviteUrl}</p>
          ${
            payload.accessCode
              ? `<p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #7A6B5C;">Code d'acces</p>
                 <p style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.28em; color: #7A3F1E;">${safeAccessCode}</p>`
              : ''
          }
        </div>

        <div style="text-align: center; margin-bottom: 18px;">
          <a
            href="${safeInviteUrl}"
            style="display: inline-block; padding: 14px 24px; border-radius: 999px; background: #C9A24D; color: #0F2A44; text-decoration: none; font-weight: 700;"
          >
            Ouvrir mon invitation
          </a>
        </div>

        ${
          expiryLabel
            ? `<p style="margin: 0 0 8px; font-size: 13px; color: #7A6B5C;">Invitation valable jusqu'au ${safeExpiry}.</p>`
            : ''
        }
        <p style="margin: 0; font-size: 13px; color: #7A6B5C;">Ce lien est personnel. Si ce message ne vous concerne pas, vous pouvez l'ignorer.</p>
      </div>
    </div>
  `;

  try {
    const info = await transport.sendMail({
      from,
      to: payload.toEmail,
      replyTo,
      subject,
      text,
      html,
    });

    console.log('[brevo] invite email sent:', info.messageId);
    return {
      sent: true,
      mode: 'sent' as const,
      providerId: info.messageId || null,
    };
  } catch (error: any) {
    console.error('[brevo] invite email error:', error);
    return {
      sent: false,
      mode: 'failed' as const,
      reason: error?.message || 'Erreur email',
    };
  }
}
