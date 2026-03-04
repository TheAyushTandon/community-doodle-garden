import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/doodles/[id]/star — toggle star on a doodle
export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Check if already starred
        const existing = await prisma.interaction.findFirst({
            where: { doodle_id: id, user_id: user.id, type: 'STAR' },
        });

        if (existing) {
            // Unstar
            await prisma.interaction.delete({ where: { id: existing.id } });
            return NextResponse.json({ starred: false });
        } else {
            // Star — connect via relation
            await prisma.interaction.create({
                data: {
                    type: 'STAR',
                    doodle: { connect: { id } },
                    user: { connect: { id: user.id } },
                },
            });
            return NextResponse.json({ starred: true });
        }
    } catch (error) {
        console.error('[POST /api/doodles/[id]/star]', error);
        return NextResponse.json({ error: 'Failed to star doodle' }, { status: 500 });
    }
}
