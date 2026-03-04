import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/user/friends — list friends
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                friends: {
                    select: {
                        id: true,
                        username: true,
                        avatar_url: true,
                    }
                }
            }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        console.log(`[GET /api/user/friends] Returning friends for ${user.username}, UID: ${user.id}`);
        return NextResponse.json({ friends: user.friends, my_uid: user.id });
    } catch (error) {
        console.error('[GET /api/user/friends]', error);
        return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
    }
}

// POST /api/user/friends — add friend by UID
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { friend_uid } = await req.json();
        if (!friend_uid) return NextResponse.json({ error: 'Friend UID required' }, { status: 400 });

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { friends: true }
        });

        if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        if (currentUser.id === friend_uid) return NextResponse.json({ error: 'You cannot friend yourself!' }, { status: 400 });

        const friendUser = await prisma.user.findUnique({ where: { id: friend_uid } });
        if (!friendUser) return NextResponse.json({ error: 'Friend not found with that UID' }, { status: 404 });

        // Check if already friends
        if (currentUser.friends.some((f: any) => f.id === friend_uid)) {
            return NextResponse.json({ error: 'Already in your friends list' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                friends: {
                    connect: { id: friend_uid }
                }
            }
        });

        return NextResponse.json({ success: true, friend: { id: friendUser.id, username: friendUser.username } });
    } catch (error) {
        console.error('[POST /api/user/friends]', error);
        return NextResponse.json({ error: 'Failed to add friend' }, { status: 500 });
    }
}
