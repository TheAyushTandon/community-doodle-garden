import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/leaderboard — top 10 doodles by star count
export async function GET() {
    try {
        const doodles = await prisma.doodle.findMany({
            include: {
                user: { select: { username: true, avatar_url: true } },
                interactions: { where: { type: 'STAR' } },
            },
            orderBy: { timestamp: 'desc' },
            take: 50,
        });

        const ranked = doodles
            .map(d => ({
                id: d.id,
                flower_name: d.flower_name,
                image_url: d.image_url,
                star_count: d.interactions.length,
                username: d.user.username,
                avatar_url: d.user.avatar_url,
            }))
            .sort((a, b) => b.star_count - a.star_count)
            .slice(0, 10);

        return NextResponse.json({ leaderboard: ranked });
    } catch (error) {
        console.error('[GET /api/leaderboard]', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
