import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/doodles/[id]/comment
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await req.json();
        if (!content?.trim()) {
            return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const comment = await prisma.interaction.create({
            data: {
                type: 'COMMENT',
                content: content.trim().slice(0, 300),
                doodle: { connect: { id } },
                user: { connect: { id: user.id } },
            },
            include: { user: { select: { username: true, avatar_url: true } } },
        });

        return NextResponse.json({
            id: comment.id,
            content: comment.content,
            username: comment.user.username,
            avatar_url: comment.user.avatar_url,
        });
    } catch (error) {
        console.error('[POST /api/doodles/[id]/comment]', error);
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }
}
