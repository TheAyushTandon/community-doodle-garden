import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required.");
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                    });

                    if (!user) {
                        throw new Error("No account found with this email.");
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        throw new Error("Incorrect password.");
                    }

                    if (!user.emailVerified) {
                        throw new Error("Please verify your email first. Check your inbox for the OTP.");
                    }

                    return {
                        id: user.id,
                        name: user.username || user.email,
                        email: user.email,
                        image: user.avatar_url,
                    };
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        throw error;
                    }
                    throw new Error("Authentication failed.");
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET || "doodlegarden-super-secret-key-change-in-prod",
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt' as const,
    },
    callbacks: {
        async session({ session, token }: { session: any; token: any }) {
            if (session.user) {
                session.user.id = token.sub;
            }
            return session;
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
