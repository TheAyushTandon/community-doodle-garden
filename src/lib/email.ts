import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, code: string) {
    const { error } = await resend.emails.send({
        from: 'Doodle Garden <onboarding@resend.dev>',
        to: email,
        subject: `🌸 Your Doodle Garden Code: ${code}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;border:3px solid #1e1e1e;box-shadow:6px 6px 0 #1e1e1e;overflow:hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background:#fc8d8d;padding:32px 40px;text-align:center;">
                            <div style="font-size:40px;margin-bottom:8px;">🌻</div>
                            <h1 style="margin:0;font-size:28px;color:#1e1e1e;font-weight:800;">Doodle Garden</h1>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <p style="font-size:18px;color:#333;margin:0 0 8px;font-weight:600;">Hey there, artist! 🎨</p>
                            <p style="font-size:16px;color:#666;margin:0 0 32px;line-height:1.5;">
                                Here's your verification code to join the garden. Enter it on the verification page:
                            </p>
                            
                            <div style="background:#f7d046;border:3px solid #1e1e1e;border-radius:16px;padding:24px;text-align:center;margin:0 0 32px;box-shadow:4px 4px 0 #1e1e1e;">
                                <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#1e1e1e;font-family:monospace;">${code}</span>
                            </div>
                            
                            <p style="font-size:14px;color:#999;margin:0;line-height:1.5;">
                                ⏰ This code expires in <strong>10 minutes</strong>.<br>
                                If you didn't request this, just ignore this email.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
                            <p style="font-size:12px;color:#aaa;margin:0;">
                                © ${new Date().getFullYear()} Doodle Garden · Bloom Together 🌸
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
    });

    if (error) {
        console.error('⚠️ Resend Email Error (Likely Free Tier Limit):', error.message);
        console.log(`\n🔑 [LOCAL DEV] YOUR OTP CODE IS: ${code}\n`);
        // We return without throwing so the signup doesn't 500 block the user.
        return;
    }
}
