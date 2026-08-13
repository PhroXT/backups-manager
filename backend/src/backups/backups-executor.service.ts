import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { StorageService } from '../storage/storage.service';
import { BackupRunnerService } from './backups-runner.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackupExecutorService {

    constructor(
        private readonly storage: StorageService,
        private readonly runner: BackupRunnerService,
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        backupId: string,
        attemptsMade = 0,
        maxAttempts = 1,
    ) {

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

        await this.prisma.backup.update({
            where: {
                id: backupId,
            },
            data: {
                status: 'running',
                startedAt: new Date(),
                finishedAt: null,
                errorMessage: null,
                lastActivityAt: new Date(),
                lastActivitySize: 0,
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

            // Elimina un archivo parcial de un intento anterior.
            await this.removeLocalFile(file);

            // Genera el dump de PostgreSQL.
            await this.runner.runPgDump({
                host: backup.project.host,
                port: backup.project.port,
                database: backup.project.database,
                username: backup.project.username,
                password: backup.project.password,
                sslMode: backup.project.sslMode,
                filename,

                onProgress: async ({ bytes }) => {

                    await this.prisma.backup.update({
                        where: {
                            id: backupId,
                        },
                        data: {
                            lastActivityAt: new Date(),
                            lastActivitySize: bytes,
                        },
                    });
                },
            });

            // Valida que el archivo exista y tenga contenido.
            const stats = await fs.promises.stat(file);

            if (stats.size === 0) {
                throw new Error(
                    'Generated backup file is empty',
                );
            }

            // Valida la estructura del dump.
            await this.runner.validatePgDump(filename);

            // Sube el backup al almacenamiento.
            await this.storage.uploadFile(
                'backups',
                filename,
                file,
            );

            // Marca el backup como completado.
            await this.prisma.backup.update({
                where: {
                    id: backupId,
                },
                data: {
                    filename,
                    size: stats.size,
                    status: 'completed',
                    finishedAt: new Date(),
                    errorMessage: null,
                },
            });

            // Elimina el archivo temporal.
            await this.removeLocalFile(file);

            return {
                success: true,
                filename,
            };

        } catch (error) {

            const isLastAttempt =
                attemptsMade + 1 >= maxAttempts;

            if (isLastAttempt) {

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

            } else {

                await this.prisma.backup.update({
                    where: {
                        id: backupId,
                    },
                    data: {
                        status: 'pending',
                        errorMessage:
                            error instanceof Error
                                ? error.message
                                : 'Unknown error',
                        finishedAt: null,
                    },
                });
            }

            // Limpia el archivo temporal del intento.
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