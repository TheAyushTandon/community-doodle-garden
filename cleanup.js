const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDB() {
    try {
        const mainEmail = 'ayushtandon2005@gmail.com';

        // Find all users except the main one
        const usersToDelete = await prisma.user.findMany({
            where: {
                email: {
                    not: mainEmail
                }
            }
        });

        console.log(`Found ${usersToDelete.length} users to delete.`);

        for (const user of usersToDelete) {
            console.log(`Deleting user: ${user.email} (${user.username})`);

            // Delete interactions by the user
            await prisma.interaction.deleteMany({
                where: { user_id: user.id }
            });

            // Delete doodles by the user (and their interactions)
            // First find doodles
            const userDoodles = await prisma.doodle.findMany({
                where: { user_id: user.id }
            });

            for (const doodle of userDoodles) {
                // Delete interactions on this doodle
                await prisma.interaction.deleteMany({
                    where: { doodle_id: doodle.id }
                });
            }

            await prisma.doodle.deleteMany({
                where: { user_id: user.id }
            });

            // User has friends/friendOf relations that might need to be explicitly removed
            // or Prisma handles them automatically? Let's just try to delete the user.
            await prisma.user.delete({
                where: { id: user.id }
            });
        }

        console.log('Database cleanup complete.');
    } catch (e) {
        console.error('Error cleaning database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

cleanDB();
