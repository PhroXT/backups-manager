import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ConnectionService } from '../database/connection/connection.service';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService,
        private connectionService: ConnectionService) { }

    findAll() {
        return this.prisma.project.findMany();
    }

    create(data: CreateProjectDto) {
        return this.prisma.project.create({
            data,
        });
    }

    async testConnection(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            return { success: false, message: 'Project not found' };
        }

        return this.connectionService.testPostgresConnection(project);
    }
}