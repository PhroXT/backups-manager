import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ConnectionService } from '../database/connection/connection.service';
import { PaginationDto } from "../common/dto/pagination.dto";
import { PaginationService } from '../common/pagination/pagination.service';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        private prisma: PrismaService,
        private connectionService: ConnectionService,
        private paginationService: PaginationService,
    ) { }

    async findAll(query: PaginationDto) {

        return this.paginationService.paginate(
            this.prisma.project,
            query,
            {
                searchableFields: [
                    "name",
                    "host",
                    "database",
                ],
                sortableFields: [
                    "name",
                    "createdAt",
                ],
            }
        );
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

    async update(id: string, data: UpdateProjectDto) {
        return this.prisma.project.update({
            where: { id },
            data,
        });
    }
}