import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "placeholder");
}

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Atlas Engine";
const FROM_EMAIL = "noreply@atlasengine.app";

export interface WelcomeEmailData {
  clientName: string;
  practitionerName: string;
  locationName: string;
  protocolName?: string;
}

export async function sendWelcomeEmail(to: string, data: WelcomeEmailData) {
  const { clientName, practitionerName, locationName, protocolName } = data;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${APP_NAME}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#0b1120;font-family:'DM Sans',system-ui,sans-serif;color:#0f1a2e;">
      <div style="max-width:600px;margin:40px auto;background-color:#0f1a2e;border-radius:12px;overflow:hidden;border:1px solid #e8e0d0;border-top:3px solid #c9973a;">

        <!-- Header -->
        <div style="padding:32px;border-bottom:1px solid #e8e0d0;">
          <div style="font-size:24px;font-weight:700;color:#c9973a;margin-bottom:4px;">
            ⬡ ${APP_NAME}
          </div>
          <div style="font-size:11px;color:#5a6a7a;letter-spacing:0.1em;text-transform:uppercase;">
            Peptide Protocol Management Platform
          </div>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <h1 style="font-size:24px;font-weight:600;color:#0f1a2e;margin:0 0 8px 0;">
            Welcome, ${clientName}
          </h1>
          <p style="color:#5a6a7a;font-size:14px;margin:0 0 24px 0;">
            Your care team at ${locationName} has created your client profile in ${APP_NAME}.
          </p>

          ${protocolName ? `
          <div style="background-color:#f5f3ee;border-radius:8px;padding:16px;border:1px solid #e8e0d0;margin-bottom:24px;border-left:3px solid #c9973a;">
            <div style="font-size:10px;color:#5a6a7a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;font-family:monospace;">
              Assigned Protocol
            </div>
            <div style="font-size:16px;color:#c9973a;font-weight:600;">${protocolName}</div>
          </div>
          ` : ""}

          <p style="color:#0f1a2e;font-size:14px;line-height:1.7;margin:0 0 16px 0;">
            Your practitioner <strong style="color:#c9973a;">${practitionerName}</strong> will guide you through your protocol.
            Please follow the dosing schedule provided and report any questions or concerns to your care team.
          </p>

          <div style="background-color:#f5f3ee;border-radius:8px;padding:16px;border:1px solid #e8e0d0;margin-bottom:24px;">
            <p style="margin:0;font-size:12px;color:#5a6a7a;line-height:1.6;">
              <strong style="color:#e8b86d;">Important:</strong> This is a clinical management communication from your healthcare provider.
              Peptide protocols should only be administered under qualified medical supervision.
              Contact your practitioner immediately if you experience unexpected side effects.
            </p>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}"
             style="display:inline-block;background-color:#c9973a;color:#0b1120;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
            View My Protocol
          </a>
        </div>

        <!-- Footer -->
        <div style="padding:24px 32px;border-top:1px solid #e8e0d0;background-color:#0b1120;">
          <p style="margin:0;font-size:11px;color:#5a6a7a;">
            This email was sent by ${APP_NAME} on behalf of ${locationName}.
            If you have questions, contact your care team directly.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await getResend().emails.send({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to,
    subject: `Welcome to Your Peptide Protocol — ${locationName}`,
    html,
  });
}

export interface ProtocolPDFEmailData {
  clientName: string;
  clientEmail: string;
  protocolName: string;
  locationName: string;
  pdfBuffer: Buffer;
}

export async function sendProtocolPDFEmail(data: ProtocolPDFEmailData) {
  const { clientName, clientEmail, protocolName, locationName, pdfBuffer } = data;

  return await getResend().emails.send({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to: clientEmail,
    subject: `Your ${protocolName} Protocol — ${locationName}`,
    html: `
      <div style="font-family:sans-serif;background:#0b1120;color:#0f1a2e;padding:32px;max-width:600px;margin:0 auto;border-radius:12px;">
        <h2 style="color:#c9973a;">Your Protocol Document</h2>
        <p>Hi ${clientName},</p>
        <p>Please find attached your ${protocolName} protocol document from ${locationName}.</p>
        <p style="color:#5a6a7a;font-size:12px;">Follow dosing instructions as directed by your practitioner.</p>
      </div>
    `,
    attachments: [
      {
        filename: `${protocolName.replace(/\s+/g, "_")}_Protocol.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
