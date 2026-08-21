import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
    const username = 'root';
    const email = 'samuel_07argueta@yahoo.es';
    const password = 'P@s$w0rd246';

    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
    });

    const user = await prisma.user.create({
        data: {
            username,
            email,
            passwordHash,
        },
        select: {
            id: true,
            username: true,
            email: true,
        },
    });

    console.log('Admin created:');
    console.log(user);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });