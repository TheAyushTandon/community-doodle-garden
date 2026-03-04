import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create the user with manually generated ID
        const user = await prisma.user.create({
            data: {
                id: randomUUID(),
                username: username || null,
                email,
                password: hashedPassword,
                emailVerified: false,
            },
        });

        return NextResponse.json({ message: 'Account created successfully!', userId: user.id }, { status: 201 });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
