import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// PATCH /api/doodles/[id]/relocate  { coord_x, coord_y }
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { coord_x, coord_y } = await req.json();
        if (coord_x == null || coord_y == null) {
            return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Only the owner can relocate
        const doodle = await prisma.doodle.findUnique({ where: { id } });
        if (!doodle) return NextResponse.json({ error: 'Doodle not found' }, { status: 404 });
        if (doodle.user_id !== user.id) {
            return NextResponse.json({ error: 'Not your flower' }, { status: 403 });
        }

        const updated = await prisma.doodle.update({
            where: { id },
            data: {
                coord_x: Math.max(0, Math.min(100, coord_x)),
                coord_y: Math.max(0, Math.min(100, coord_y)),
            },
        });

        return NextResponse.json({ coord_x: updated.coord_x, coord_y: updated.coord_y });
    } catch (error) {
        console.error('[PATCH /api/doodles/[id]/relocate]', error);
        return NextResponse.json({ error: 'Failed to relocate' }, { status: 500 });
    }
}
