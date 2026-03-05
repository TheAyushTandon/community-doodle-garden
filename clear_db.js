require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Clearing all data...');
    await prisma.interaction.deleteMany({});
    console.log('Interactions cleared');
    await prisma.otp.deleteMany({});
    console.log('OTPs cleared');
    await prisma.doodle.deleteMany({});
    console.log('Doodles cleared');
    await prisma.user.deleteMany({});
    console.log('Users cleared');
    console.log('Database is clean!');
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
