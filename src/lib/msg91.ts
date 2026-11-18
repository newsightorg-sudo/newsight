/**
 * MSG91 Email Integration Module
 *
 * Dispatches transactional email verification codes using MSG91 v5 Email API
 * with the pre-configured global OTP template: "global_otp".
 */

export interface Msg91EmailOtpOptions {
  toEmail: string;
  toName?: string;
  otp: string;
  companyName?: string;
}

export interface Msg91SendResult {
  success: boolean;
  message?: string;
  error?: string;
  devMode?: boolean;
}

export async function sendAdminOtpViaMsg91({
  toEmail,
  toName = 'Administrator',
  otp,
  companyName = 'NEWSIGHT',
}: Msg91EmailOtpOptions): Promise<Msg91SendResult> {
  const authKey = process.env.MSG91_AUTH_KEY?.trim();
  const templateId = process.env.MSG91_TEMPLATE_ID?.trim() || 'global_otp';
  const fromEmail = process.env.MSG91_FROM_EMAIL?.trim() || 'support@newsight.media';
  const fromName = process.env.MSG91_FROM_NAME?.trim() || 'NEWSIGHT Editorial';
  const domain =
    process.env.MSG91_DOMAIN?.trim() ||
    (fromEmail.includes('@') ? fromEmail.split('@')[1] : 'newsight.media');

  // If no auth key is set in local/development environments, log OTP safely to console for verification testing
  if (!authKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `\n[MSG91 DEV MODE] =============================================\n` +
        `Template ID: ${templateId}\n` +
        `Recipient:   ${toEmail} (${toName})\n` +
        `OTP Code:    ${otp}\n` +
        `From:        ${fromName} <${fromEmail}> via ${domain}\n` +
        `===============================================================\n`
      );
      return {
        success: true,
        devMode: true,
        message: 'Development mode: Verification OTP logged to server console.',
      };
    }

    return {
      success: false,
      error: 'MSG91_AUTH_KEY is not configured in production environment variables.',
    };
  }

  const payload = {
    recipients: [
      {
        to: [
          {
            name: toName,
            email: toEmail,
          },
        ],
        variables: {
          otp,
          OTP: otp,
          company_name: companyName,
        },
      },
    ],
    from: {
      name: fromName,
      email: fromEmail,
    },
    domain,
    template_id: templateId,
  };

  try {
    const res = await fetch('https://control.msg91.com/api/v5/email/send', {
      method: 'POST',
      headers: {
        authkey: authKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg =
        data?.message ||
        data?.errors?.[0] ||
        `MSG91 API error with HTTP status ${res.status}`;
      console.error('[MSG91 Error]', { status: res.status, data });
      return { success: false, error: errMsg };
    }

    // MSG91 may return { status: "error", message: "..." } with 200 HTTP status
    if (data?.status === 'error' || data?.has_error === true) {
      console.error('[MSG91 Error Body]', data);
      return {
        success: false,
        error: data.message || 'MSG91 reported a delivery error.',
      };
    }

    return {
      success: true,
      message: data?.message || 'Verification email dispatched via MSG91.',
    };
  } catch (err: any) {
    console.error('[MSG91 Network Exception]', err);
    return {
      success: false,
      error: err?.message || 'Failed to connect to MSG91 delivery service.',
    };
  }
}
