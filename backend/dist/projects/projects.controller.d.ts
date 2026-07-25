import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
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
    create(dto: CreateProjectDto): import("@prisma/client").Prisma.Prisma__ProjectClient<{
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
