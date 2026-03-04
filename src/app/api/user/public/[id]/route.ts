import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/user/public/[id] — fetch public profile data by UID
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                doodles: {
                    orderBy: { timestamp: 'desc' },
                    include: {
                        interactions: {
                            include: {
                                user: { select: { username: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let totalStarsReceived = 0;

        const formattedDoodles = user.doodles.map((doodle: typeof user.doodles[number]) => {
            const stars = doodle.interactions.filter((i: { type: string }) => i.type === 'STAR');
            const comments = doodle.interactions.filter((i: { type: string }) => i.type === 'COMMENT');
            totalStarsReceived += stars.length;

            return {
                id: doodle.id,
                flower_name: doodle.flower_name,
                image_url: doodle.image_url,
                timestamp: doodle.timestamp,
                star_count: stars.length,
                comments: comments.map((c: { id: string; content: string | null; user: { username: string | null } }) => ({
                    id: c.id,
                    content: c.content,
                    username: c.user.username,
                })),
            };
        });

        return NextResponse.json({
            profile: {
                username: user.username,
                avatar_url: user.avatar_url,
                stats: {
                    total_planted: user.doodles.length,
                    total_stars_received: totalStarsReceived,
                },
                doodles: formattedDoodles,
            }
        });

    } catch (error) {
        console.error('[GET /api/user/public/[id]]', error);
        return NextResponse.json({ error: 'Failed to fetch public profile' }, { status: 500 });
    }
}
