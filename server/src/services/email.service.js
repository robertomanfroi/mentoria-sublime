const { Resend } = require('resend');
const { RESEND_API_KEY, RESEND_FROM } = require('../config/env');

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  if (!resend) {
    console.error('[email] RESEND_API_KEY não configurado — e-mail de redefinição não enviado.');
    const err = new Error('Serviço de e-mail não configurado.');
    err.status = 500;
    throw err;
  }

  await resend.emails.send({
    from: RESEND_FROM,
    to,
    subject: 'Redefinição de senha — Mentoria Sublime',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <p>Olá, ${name}!</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta na Mentoria Sublime.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">
            Criar nova senha
          </a>
        </p>
        <p>Esse link expira em 1 hora. Se você não solicitou, pode ignorar este e-mail.</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
