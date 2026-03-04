import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/user/profile — fetch authenticated user's stats and doodles
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                friends: {
                    select: {
                        id: true,
                        username: true,
                        avatar_url: true,
                    }
                },
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

        const formattedDoodles = user.doodles.map(doodle => {
            const stars = doodle.interactions.filter(i => i.type === 'STAR');
            const comments = doodle.interactions.filter(i => i.type === 'COMMENT');

            totalStarsReceived += stars.length;

            return {
                id: doodle.id,
                flower_name: doodle.flower_name,
                image_url: doodle.image_url,
                coord_x: doodle.coord_x,
                coord_y: doodle.coord_y,
                timestamp: doodle.timestamp,
                star_count: stars.length,
                comments: comments.map(c => ({
                    id: c.id,
                    content: c.content,
                    username: c.user.username,
                })),
            };
        });

        return NextResponse.json({
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
            friends: user.friends,
            stats: {
                total_planted: user.doodles.length,
                total_stars_received: totalStarsReceived,
            },
            doodles: formattedDoodles,
        });

    } catch (error) {
        console.error('[GET /api/user/profile]', error);
        return NextResponse.json({ error: 'Failed to fetch user profile data' }, { status: 500 });
    }
}
