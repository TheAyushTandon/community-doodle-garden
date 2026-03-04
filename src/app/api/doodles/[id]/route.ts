import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/doodles/[id] — fetch single doodle with interactions
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const doodle = await prisma.doodle.findUnique({
            where: { id },
            include: {
                user: { select: { username: true, avatar_url: true } },
                interactions: {
                    include: {
                        user: { select: { username: true, email: true } },
                    },
                },
            },
        });

        if (!doodle) {
            return NextResponse.json({ error: 'Doodle not found' }, { status: 404 });
        }

        const session = await getServerSession(authOptions);
        const currentUserEmail = session?.user?.email;

        const stars = doodle.interactions.filter(i => i.type === 'STAR');
        const comments = doodle.interactions.filter(i => i.type === 'COMMENT');

        const has_starred = currentUserEmail
            ? stars.some(star => star.user?.email === currentUserEmail)
            : false;

        return NextResponse.json({
            id: doodle.id,
            flower_name: doodle.flower_name,
            image_url: doodle.image_url,
            star_count: stars.length,
            has_starred,
            user: doodle.user,
            comments: comments.map(c => ({
                id: c.id,
                content: c.content,
                username: c.user.username,
            })),
        });
    } catch (error) {
        console.error('[GET /api/doodles/[id]]', error);
        return NextResponse.json({ error: 'Failed to fetch doodle' }, { status: 500 });
    }
}

// DELETE /api/doodles/[id] — delete doodle (owner only)
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

        const doodle = await prisma.doodle.findUnique({ where: { id } });
        if (!doodle) return NextResponse.json({ error: 'Doodle not found' }, { status: 404 });

        if (doodle.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden. You can only delete your own doodles.' }, { status: 403 });
        }

        // Delete interactions first, then doodle
        await prisma.interaction.deleteMany({ where: { doodle_id: id } });
        await prisma.doodle.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/doodles/[id]]', error);
        return NextResponse.json({ error: 'Failed to delete doodle' }, { status: 500 });
    }
}

