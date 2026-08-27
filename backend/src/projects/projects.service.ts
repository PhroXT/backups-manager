import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ConnectionService } from '../database/connection/connection.service';
import { PaginationDto } from "../common/dto/pagination.dto";
import { PaginationService } from '../common/pagination/pagination.service';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UsersService } from '../auth/users.service';
import { EncryptionService } from '../common/encryption/encryption.service';

@Injectable()
export class ProjectsService {
    constructor(
        private prisma: PrismaService,
        private connectionService: ConnectionService,
        private paginationService: PaginationService,
        private usersService: UsersService,
        private encryptionService: EncryptionService,
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
            },
            {
                select: {
                    id: true,
                    name: true,
                    type: true,
                    host: true,
                    port: true,
                    database: true,
                    username: true,
                    sslMode: true,
                    enabled: true,
                    createdAt: true,
                    updatedAt: true,
                    sshEnabled: true,
                    sshHost: true,
                    sshPort: true,
                    sshUsername: true,
                },
            },
        );
    }

    async create(data: CreateProjectDto) {

        const password =
            this.encryptionService.encrypt(
                data.password,
            );

        const sshPassword =
            data.sshPassword
                ? this.encryptionService.encrypt(
                    data.sshPassword,
                )
                : null;

        return this.prisma.project.create({
            data: {
                ...data,
                password,
                sshPassword,
            },
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

        const updateData = {
            ...data,
            ...(data.password
                ? {
                    password:
                        this.encryptionService.encrypt(
                            data.password,
                        ),
                }
                : {}),
            ...(data.sshPassword
                ? {
                    sshPassword:
                        this.encryptionService.encrypt(
                            data.sshPassword,
                        ),
                }
                : {}),
        };

        return this.prisma.project.update({
            where: { id },
            data: updateData,
        });
    }

    async remove(
        id: string,
        userId: string,
        password: string,
    ) {
        const user = await this.usersService.findByIdWithPassword(userId);

        if (!user) {
            throw new UnauthorizedException();
        }

        const validPassword =
            await this.usersService.verifyPassword(
                user.passwordHash,
                password,
            );

        if (!validPassword) {
            throw new UnauthorizedException(
                'Invalid password',
            );
        }

        const project = await this.prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            throw new NotFoundException(
                'Project not found',
            );
        }

        await this.prisma.backup.updateMany({
            where: {
                projectId: id,
            },
            data: {
                projectName: project.name,
                projectId: null,
            },
        });

        await this.prisma.project.delete({
            where: { id },
        });

        return {
            success: true,
        };
    }
}