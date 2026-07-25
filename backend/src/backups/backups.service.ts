import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackupsService {

    constructor(
        private prisma: PrismaService,
    ) { }


    create(projectId: string) {

        return this.prisma.backup.create({
            data: {
                projectId,
                filename: 'pending.dump',
                status: 'pending',
            },
        });

    }

    async findAll() {

        const backups = await this.prisma.backup.findMany({
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });


        return backups.map((backup) => ({
            ...backup,
            size: backup.size?.toString() ?? null,
        }));

    }

    async findOne(id: string) {

        const backup = await this.prisma.backup.findUnique({
            where: {
                id,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });


        if (!backup) {
            return null;
        }


        return {
            ...backup,
            size: backup.size?.toString() ?? null,
        };

    }

}