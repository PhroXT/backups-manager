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

        if (backup.status === 'completed') {
            return {
                success: true,
                filename: backup.filename,
            };
        }

        if (backup.status === 'running') {
            throw new Error('Backup is already running');
        }

        await this.prisma.backup.update({
            where: {
                id: backupId,
            },
            data: {
                status: 'running',
                startedAt: new Date(),
                finishedAt: null,
                errorMessage: null,
            },
        });

        const filename = `${backup.id}.dump`;

        const file = path.join(
            process.cwd(),
            '..',
            'storage',
            filename,
        );

        try {

            // 1. GENERACIÓN

            await this.runner.runPgDump({
                host: backup.project.host,
                port: backup.project.port,
                database: backup.project.database,
                username: backup.project.username,
                password: backup.project.password,
                sslMode: backup.project.sslMode,
                filename,
            });

            // 2. VALIDACIÓN DEL ARCHIVO

            const stats = await fs.promises.stat(file);

            if (stats.size === 0) {
                throw new Error(
                    'Generated backup file is empty',
                );
            }

            await this.runner.validatePgDump(filename);

            // 3. UPLOAD

            await this.storage.uploadFile(
                'backups',
                filename,
                file,
            );


            // 4. COMPLETADO

            await this.prisma.backup.update({
                where: {
                    id: backupId,
                },
                data: {
                    filename,
                    size: stats.size,
                    status: 'completed',
                    finishedAt: new Date(),
                },
            });

            // 5. CLEANUP

            await this.removeLocalFile(file);


            return {
                success: true,
                filename,
            };

        } catch (error) {

            await this.prisma.backup.update({
                where: {
                    id: backupId,
                },
                data: {
                    status: 'failed',
                    errorMessage:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                    finishedAt: new Date(),
                },
            });

            // Si algo falla, limpiar el archivo temporal.
            await this.removeLocalFile(file);

            throw error;
        }
    }

    private async removeLocalFile(file: string) {

        try {

            await fs.promises.unlink(file);

        } catch (error) {

            if (
                error instanceof Error &&
                'code' in error &&
                error.code === 'ENOENT'
            ) {
                return;
            }

            console.error(
                'Failed to remove local backup file:',
                file,
                error,
            );
        }
    }
}