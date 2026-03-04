import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/email';
import { randomUUID } from 'crypto';

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json();
        console.log(`📝 Signup attempt for: ${email}`);

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        // Check if a verified user already exists with this email
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser && existingUser.emailVerified) {
            return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
        }

        // Delete any unverified previous signup attempts for this email
        if (existingUser && !existingUser.emailVerified) {
            await prisma.otp.deleteMany({ where: { email } });
            await prisma.user.delete({ where: { email } });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create the user as unverified
        const user = await prisma.user.create({
            data: {
                id: randomUUID(),
                username: username || null,
                email,
                password: hashedPassword,
                emailVerified: false, // Will be set to true after OTP verification
            },
        });

        // Generate and store OTP
        const code = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.otp.create({
            data: { id: randomUUID(), email, code, expiresAt },
        });

        // Send OTP email - if this fails, rollback the user creation
        try {
            await sendOtpEmail(email, code);
            console.log(`✅ User created & OTP sent: ${email}`);
        } catch (emailError) {
            // Rollback: delete the user and OTP if email sending fails
            console.error('Email sending failed, rolling back user creation:', emailError);
            await prisma.otp.deleteMany({ where: { email } });
            await prisma.user.delete({ where: { id: user.id } });
            return NextResponse.json({ error: 'Failed to send verification email. Please check your connection and try again.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'OTP sent! Please check your email.', userId: user.id }, { status: 201 });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
