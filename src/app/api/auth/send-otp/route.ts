import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/email';
import { randomUUID } from 'crypto';

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
        }

        // Delete any existing OTPs for this email
        await prisma.otp.deleteMany({ where: { email } });

        // Generate new OTP
        const code = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP with manually generated ID
        await prisma.otp.create({
            data: { id: randomUUID(), email, code, expiresAt },
        });

        // Send email
        await sendOtpEmail(email, code);

        return NextResponse.json({ message: 'OTP sent successfully!' }, { status: 200 });
    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
    }
}
