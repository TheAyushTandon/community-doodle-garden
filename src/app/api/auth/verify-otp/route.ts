import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json({ error: 'Email and OTP code are required.' }, { status: 400 });
        }

        // Find the OTP
        const otp = await prisma.otp.findFirst({
            where: { email, code },
            orderBy: { createdAt: 'desc' },
        });

        if (!otp) {
            return NextResponse.json({ error: 'Invalid OTP code.' }, { status: 400 });
        }

        // Check if expired
        if (new Date() > otp.expiresAt) {
            await prisma.otp.delete({ where: { id: otp.id } });
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        // Verify the user
        await prisma.user.update({
            where: { email },
            data: { emailVerified: true },
        });

        // Delete all OTPs for this email
        await prisma.otp.deleteMany({ where: { email } });

        return NextResponse.json({ message: 'Email verified successfully!' }, { status: 200 });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
    }
}
