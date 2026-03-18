import { NextResponse } from 'next/server';
import { getBrevoTransport } from '@/lib/server/brevoTransport';

export const runtime = 'nodejs';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('=== CONTACT FORM SUBMISSION ===');
    console.log(body);

    const transport = getBrevoTransport();
    if (!transport) {
      console.warn('[brevo] BREVO_SMTP_USER ou BREVO_SMTP_PASSWORD manquant — email non envoyé');
      return NextResponse.json({
        success: true,
        message: 'Simulated success (SMTP non configuré). Vérifiez les variables BREVO_SMTP_USER et BREVO_SMTP_PASSWORD.',
      });
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Nouveau contact via Espace Pro</h2>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p><strong>De:</strong> ${body.fullName} (${body.email})</p>
          <p><strong>Fonction:</strong> ${body.function || 'Non spécifié'}</p>
          <p><strong>Structure:</strong> ${body.structureName} (${body.city})</p>
          <p><strong>Profil:</strong> ${body.profileType} ${body.profileOther ? `(${body.profileOther})` : ''}</p>
          <p><strong>Téléphone:</strong> ${body.phone || 'Non spécifié'}</p>
        </div>

        <div style="margin-top: 20px;">
          <p><strong>Objectif Principal:</strong> ${body.objectives?.join(', ') || 'Non spécifié'}</p>
          <p><strong>Type Collaboration:</strong> ${body.collabType}</p>
          <p><strong>Délai:</strong> ${body.timeline}</p>
        </div>

        ${body.artisanType ? `
        <div style="margin-top: 20px; padding: 15px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px;">
          <h3 style="color: #b45309; margin-top: 0;">Spécial Artisan</h3>
          <p><strong>Type création:</strong> ${body.artisanType.join(', ')}</p>
          <p><strong>Volume:</strong> ${body.artisanVolume}</p>
          <p><strong>Buts:</strong> ${body.artisanGoals?.join(', ')}</p>
        </div>
        ` : ''}

        <div style="margin-top: 20px;">
          <h3>Message:</h3>
          <p style="white-space: pre-wrap; background: #f1f5f9; padding: 15px; border-radius: 8px;">${body.message || 'Aucun message.'}</p>
        </div>

        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #64748b;">Données brutes:</p>
        <pre style="font-size: 10px; color: #94a3b8; overflow-x: auto;">${JSON.stringify(body, null, 2)}</pre>
      </div>
    `;

    const info = await transport.sendMail({
      from: process.env.RESEND_FROM_EMAIL || 'Commun Vivant <noreply@communvivant.fr>',
      to: 'aline@etjaicrie.com',
      replyTo: body.email,
      subject: `[PRO] ${body.subject || 'Demande Contact'} - ${body.structureName || body.fullName}`,
      html,
    });

    console.log('[brevo] contact email sent:', info.messageId);
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('[brevo] contact form error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
