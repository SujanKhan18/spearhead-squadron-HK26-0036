const nodemailer = require('nodemailer');

let testTransporter = null;

async function getTestTransporter() {
  if (!testTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      testTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (err) {
      console.warn('[EMAIL] Could not create Ethereal test account:', err.message);
    }
  }
  return {
    transporter: testTransporter,
    from: '"Safe-Era Women Safety Network" <alerts@safe-era.org>',
    isLive: false
  };
}

// Initialize transporter: uses real SMTP/Gmail if configured, or free Ethereal test account as fallback
async function getTransporter() {
  const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim().replace(/\s+/g, '') : '';

  if (user && pass) {
    return {
      transporter: nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: { user, pass }
      }),
      from: `"Safe-Era Emergency Network" <${user}>`,
      isLive: true
    };
  }

  // Fallback to free automated Ethereal transporter
  return await getTestTransporter();
}

/**
 * Send Guardian Verification OTP Email
 */
async function sendGuardianOtpEmail({ toEmail, guardianName, userName, otp }) {
  if (!toEmail) return { success: false, reason: 'No email provided' };

  try {
    const { transporter, from, isLive } = await getTransporter();
    if (!transporter) return { success: false, reason: 'Email transporter unavailable' };

    const mailOptions = {
      from,
      to: toEmail,
      subject: `🚨 Verification Code for ${guardianName} - Safe-Era Safety Network`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #FAF0EA; border-radius: 16px; overflow: hidden; border: 1px solid #DCDDD5;">
          <div style="background: linear-gradient(135deg, #7A8E72 0%, #4F7D55 100%); padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Safe-Era Guardian Network</h1>
            <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Women-First Emergency Safety Platform</p>
          </div>
          <div style="padding: 28px; background: #ffffff;">
            <p style="font-size: 16px; color: #28302A; margin-top: 0;">Hi <strong>${guardianName}</strong>,</p>
            <p style="font-size: 14px; color: #555e54; line-height: 1.6;">
              <strong>${userName}</strong> has added you as a trusted safety guardian on Safe-Era. In an emergency, you will receive real-time SOS alerts and live location updates.
            </p>
            <div style="margin: 28px 0; padding: 20px; background: #FAF8F5; border-radius: 12px; border: 1px dashed #7A8E72; text-align: center;">
              <span style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #7A8E72; letter-spacing: 1px; margin-bottom: 8px;">Your 6-Digit Verification Code</span>
              <span style="display: inline-block; font-size: 36px; font-family: monospace; font-weight: 800; letter-spacing: 8px; color: #28302A; padding: 6px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #DCDDD5;">${otp}</span>
              <p style="margin: 10px 0 0; font-size: 12px; color: #888;">Valid for 15 minutes. Share this code with ${userName} to confirm.</p>
            </div>
            <p style="font-size: 13px; color: #888; margin-bottom: 0;">
              If you did not expect this request, you can safely ignore this email.
            </p>
          </div>
          <div style="background: #FAF8F5; padding: 16px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #EFECE6;">
            Safe-Era Emergency Response Platform · Travel Without Fear · Built for Women's Safety
          </div>
        </div>
      `
    };

    let info;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch (sendErr) {
      if (isLive) {
        console.warn(`[EMAIL] Live delivery to ${toEmail} failed (${sendErr.message}). Falling back to free Ethereal web view.`);
        const fallback = await getTestTransporter();
        if (fallback.transporter) {
          info = await fallback.transporter.sendMail({ ...mailOptions, from: fallback.from });
          isLive = false;
        } else {
          throw sendErr;
        }
      } else {
        throw sendErr;
      }
    }

    const previewUrl = !isLive ? nodemailer.getTestMessageUrl(info) : null;
    
    if (previewUrl) {
      console.log(`[EMAIL] Preview URL (free web view): ${previewUrl}`);
    } else {
      console.log(`[EMAIL] Real email sent to ${toEmail}`);
    }

    return { success: true, messageId: info.messageId, previewUrl, isLive };
  } catch (error) {
    console.error('[EMAIL ERROR]:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Emergency SOS Broadcast Email to Guardians
 */
async function sendSosEmergencyEmail({ toEmail, guardianName, userName, userPhone, locationLink, threatScore, triggerSource, time }) {
  if (!toEmail) return { success: false, reason: 'No email provided' };

  try {
    const { transporter, from, isLive } = await getTransporter();
    if (!transporter) return { success: false, reason: 'Email transporter unavailable' };

    const sourceLabel = triggerSource === 'threat_detection'
      ? 'AI Threat Detection (Motion/Audio)'
      : triggerSource === 'voice_trigger'
      ? 'Voice-Activated Distress Phrase'
      : 'Manual Emergency SOS Tap';

    const mailOptions = {
      from,
      to: toEmail,
      subject: `🚨 EMERGENCY SOS ALERT: ${userName} NEEDS HELP!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF5F5; border-radius: 16px; overflow: hidden; border: 2px solid #EF4444;">
          <div style="background: #DC2626; padding: 24px; text-align: center; color: #ffffff;">
            <div style="display: inline-block; font-size: 28px; line-height: 1;">🚨 🚨 🚨</div>
            <h1 style="margin: 8px 0 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">EMERGENCY SOS ALERT</h1>
            <p style="margin: 4px 0 0; font-size: 15px; font-weight: 500; opacity: 0.95;">Immediate Guardian Attention Required</p>
          </div>

          <div style="padding: 28px; background: #ffffff;">
            <p style="font-size: 16px; color: #111827; margin-top: 0;">
              Dear <strong>${guardianName}</strong>,
            </p>
            <p style="font-size: 15px; color: #374151; line-height: 1.6;">
              <span style="color: #DC2626; font-weight: bold;">${userName}</span> has triggered an active <strong>Emergency SOS</strong> on Safe-Era and needs immediate assistance!
            </p>

            <div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #6B7280;">User:</td>
                  <td style="padding: 6px 0; color: #111827; font-weight: bold;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6B7280;">Phone:</td>
                  <td style="padding: 6px 0; color: #111827; font-weight: bold;"><a href="tel:${userPhone}" style="color: #DC2626; text-decoration: underline;">${userPhone || 'Not provided'}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6B7280;">Trigger Type:</td>
                  <td style="padding: 6px 0; color: #111827;">${sourceLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6B7280;">Threat Score:</td>
                  <td style="padding: 6px 0; color: #DC2626; font-weight: bold;">${threatScore || 'High'} / 100</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6B7280;">Time:</td>
                  <td style="padding: 6px 0; color: #111827;">${time || new Date().toLocaleTimeString()}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${locationLink}" target="_blank" style="display: inline-block; background: #DC2626; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);">
                📍 View Live Location on Google Maps
              </a>
              <p style="margin: 10px 0 0; font-size: 12px; color: #6B7280;">Or copy: <a href="${locationLink}" style="color: #6B7280; word-break: break-all;">${locationLink}</a></p>
            </div>

            <p style="font-size: 13px; color: #4B5563; line-height: 1.5; border-top: 1px solid #E5E7EB; padding-top: 16px;">
              <strong>Recommended Action:</strong> Try calling ${userName} immediately, contact emergency services (112 in India), or dispatch towards their live location.
            </p>
          </div>

          <div style="background: #FEF2F2; padding: 14px; text-align: center; font-size: 12px; color: #991B1B; border-top: 1px solid #FCA5A5;">
            Safe-Era Integrated Emergency System · Automated Guardian Dispatch
          </div>
        </div>
      `
    };

    let info;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch (sendErr) {
      if (isLive) {
        console.warn(`[SOS EMAIL] Live delivery to ${toEmail} failed (${sendErr.message}). Falling back to free Ethereal preview.`);
        const fallback = await getTestTransporter();
        if (fallback.transporter) {
          info = await fallback.transporter.sendMail({ ...mailOptions, from: fallback.from });
          isLive = false;
        } else {
          throw sendErr;
        }
      } else {
        throw sendErr;
      }
    }

    const previewUrl = !isLive ? nodemailer.getTestMessageUrl(info) : null;
    
    if (previewUrl) {
      console.log(`[SOS EMAIL] Preview URL: ${previewUrl}`);
    } else {
      console.log(`[SOS EMAIL] Real emergency email sent to ${toEmail}`);
    }

    return { success: true, messageId: info.messageId, previewUrl, isLive };
  } catch (error) {
    console.error('[SOS EMAIL ERROR]:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendGuardianOtpEmail,
  sendSosEmergencyEmail
};
