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


    findAll() {

        return this.prisma.backup.findMany({
            include: {
                project: true,
            },
        });

    }

}