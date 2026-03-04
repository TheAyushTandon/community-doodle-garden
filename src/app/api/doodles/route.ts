import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/doodles — fetch all doodles for the garden map
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        const doodles = await prisma.doodle.findMany({
            orderBy: { timestamp: 'desc' },
            skip,
            take: limit,
            include: {
                user: {
                    select: { username: true, avatar_url: true, email: true },
                },
                interactions: {
                    where: { type: 'STAR' },
                    select: { id: true },
                },
            },
        });

        const total = await prisma.doodle.count();

        return NextResponse.json({
            doodles: doodles.map((d: typeof doodles[number]) => ({
                id: d.id,
                user_id: d.user_id,           // needed for golden ring
                image_url: d.image_url,
                flower_name: d.flower_name,
                coord_x: d.coord_x,
                coord_y: d.coord_y,
                timestamp: d.timestamp,
                user: {
                    username: d.user.username,
                    avatar_url: d.user.avatar_url,
                    email: d.user.email,       // needed for owner check fallback
                },
                star_count: d.interactions.length,
            })),
            total,
            page,
            limit,
        });
    } catch (error) {
        console.error('[GET /api/doodles]', error);
        return NextResponse.json({ error: 'Failed to fetch doodles' }, { status: 500 });
    }
}

// POST /api/doodles — save a new doodle
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { image_data, flower_name } = body;

        if (!image_data || !flower_name) {
            return NextResponse.json({ error: 'Missing image_data or flower_name' }, { status: 400 });
        }

        if (flower_name.trim().length < 1 || flower_name.trim().length > 50) {
            return NextResponse.json({ error: 'Flower name must be between 1 and 50 characters' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Random position on the garden map (0-100 range, percentage-based)
        const coord_x = Math.random() * 85 + 5; // 5–90%
        const coord_y = Math.random() * 75 + 10; // 10–85%

        const doodle = await prisma.doodle.create({
            data: {
                user_id: user.id,
                image_url: image_data, // base64 stored directly (can be swapped for CDN later)
                flower_name: flower_name.trim(),
                coord_x,
                coord_y,
            },
        });

        return NextResponse.json({ success: true, doodle }, { status: 201 });
    } catch (error) {
        console.error('[POST /api/doodles]', error);
        return NextResponse.json({ error: 'Failed to save doodle' }, { status: 500 });
    }
}
