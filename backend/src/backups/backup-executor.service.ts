import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { StorageService } from '../storage/storage.service';
import { BackupRunnerService } from './backup-runner.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackupExecutorService {

    constructor(
        private readonly storage: StorageService,
        private readonly runner: BackupRunnerService,
        private readonly prisma: PrismaService,
    ) { }

    async execute(backupId: string) {

        const backup = await this.prisma.backup.findUnique({
            where: {
                id: backupId,
            },
            include: {
                project: true,
            },
        });


        if (!backup) {
            throw new Error('Backup not found');
        }


        const filename = `${backup.id}.dump`;


        await this.runner.runPgDump({
            host: backup.project.host,
            port: backup.project.port,
            database: backup.project.database,
            username: backup.project.username,
            password: backup.project.password,
            filename,
        });


        const file = path.join(
            process.cwd(),
            '..',
            'storage',
            filename,
        );


        await this.storage.uploadFile(
            'backups',
            filename,
            file,
        );


        await this.prisma.backup.update({
            where: {
                id: backupId,
            },
            data: {
                filename,
                status: 'completed',
            },
        });


        console.log('Real backup completed');


        return {
            success: true,
            filename,
        };

    }

}