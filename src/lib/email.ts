import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your regular password)
    },
})

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
        from: `"Doodle Garden 🌸" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: '🌸 Your Doodle Garden Verification Code',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #fffdf7; border-radius: 24px; border: 3px solid #111827;">
                <div style="text-align: center; margin-bottom: 28px;">
                    <h1 style="font-size: 2rem; font-weight: 900; color: #111827; margin: 0;">🌸 Doodle Garden</h1>
                    <p style="color: #6b7280; font-size: 1rem; margin-top: 6px;">Verify your email to start planting!</p>
                </div>

                <div style="background: #f5f0ff; border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 24px; border: 2px solid #7c3aed;">
                    <p style="color: #4b5563; font-size: 0.95rem; margin: 0 0 12px 0; font-weight: 600;">Your verification code is:</p>
                    <div style="letter-spacing: 10px; font-size: 3rem; font-weight: 900; color: #7c3aed; font-family: monospace;">${otp}</div>
                    <p style="color: #9ca3af; font-size: 0.85rem; margin: 12px 0 0 0;">Expires in 10 minutes</p>
                </div>

                <p style="color: #6b7280; font-size: 0.875rem; text-align: center;">
                    If you didn't sign up for Doodle Garden, you can safely ignore this email.
                </p>
            </div>
        `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ OTP email sent to ${email}`)
}
