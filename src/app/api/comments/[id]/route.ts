import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE(
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

        const interaction = await prisma.interaction.findUnique({ where: { id } });
        if (!interaction) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

        // User must be the author of the comment OR the author of the doodle
        const doodle = await prisma.doodle.findUnique({ where: { id: interaction.doodle_id } });

        if (interaction.user_id !== user.id && doodle?.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (interaction.type !== 'COMMENT') {
            return NextResponse.json({ error: 'Not a comment' }, { status: 400 });
        }

        await prisma.interaction.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/comments/[id]]', error);
        return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }
}
