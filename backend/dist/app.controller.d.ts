import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
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
