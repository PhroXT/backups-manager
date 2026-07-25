import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ConnectionService } from '../database/connection/connection.service';
export declare class ProjectsService {
    private prisma;
    private connectionService;
    constructor(prisma: PrismaService, connectionService: ConnectionService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
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
    create(data: CreateProjectDto): import("@prisma/client").Prisma.Prisma__ProjectClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    testConnection(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
