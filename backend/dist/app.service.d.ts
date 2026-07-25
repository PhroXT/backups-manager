import { PrismaService } from './prisma/prisma.service';
export declare class AppService {
    private prisma;
    constructor(prisma: PrismaService);
    getHello(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        type: string;
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
        enabled: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
