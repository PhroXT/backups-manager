import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { StorageService } from '../storage/storage.service';
import { BackupRunnerService } from './backups-runner.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackupExecutorService {

    private readonly cancelledBackups = new Set<string>();

    constructor(
        private readonly storage: StorageService,
        private readonly runner: BackupRunnerService,
        private readonly prisma: PrismaService,
    ) { }

    async cancel(backupId: string): Promise<boolean> {

        const cancelled =
            await this.runner.cancel(backupId);

        if (!cancelled) {

            return false;
        }

        this.cancelledBackups.add(backupId);

        return true;
    }


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

        if (!backup.project) {

            throw new Error(
                'Cannot execute backup: project no longer exists',
            );
        }

        if (backup.status === 'completed') {

            return {
                success: true,
                filename: backup.filename,
            };
        }

        if (
            backup.status !== 'pending' &&
            backup.status !== 'running'
        ) {

            return {
                success: false,
                cancelled: backup.status === 'cancelled',
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

            await this.removeLocalFile(file);

            await this.runner.runPgDump({
                backupId: backup.id,
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

            const stats = await fs.promises.stat(file);

            if (stats.size === 0) {

                throw new Error(
                    'Generated backup file is empty',
                );
            }

            await this.runner.validatePgDump(filename);

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
                    size: stats.size,
                    status: 'completed',
                    finishedAt: new Date(),
                    errorMessage: null,
                },
            });

            if (backup.weeklyKey || backup.monthlyKey) {

                const oldBackups =
                    await this.prisma.backup.findMany({
                        where: {
                            projectId: backup.projectId,
                            status: 'completed',
                            id: {
                                not: backup.id,
                            },
                            OR: [
                                ...(backup.weeklyKey
                                    ? [{
                                        weeklyKey:
                                            backup.weeklyKey,
                                    }]
                                    : []),

                                ...(backup.monthlyKey
                                    ? [{
                                        monthlyKey:
                                            backup.monthlyKey,
                                    }]
                                    : []),
                            ],
                        },
                    });

                for (const oldBackup of oldBackups) {

                    if (oldBackup.filename) {

                        try {

                            await this.storage.deleteFile(
                                'backups',
                                oldBackup.filename,
                            );

                        } catch (error) {

                            continue;
                        }
                    }

                    await this.prisma.backup.delete({
                        where: {
                            id: oldBackup.id,
                        },
                    });
                }
            }

            await this.removeLocalFile(file);

            return {
                success: true,
                filename,
            };

        } catch (error) {

            const wasCancelled =
                this.cancelledBackups.delete(backupId);

            if (wasCancelled) {

                await this.prisma.backup.update({
                    where: {
                        id: backupId,
                    },
                    data: {
                        status: 'cancelled',
                        errorMessage: null,
                        finishedAt: new Date(),
                    },
                });

                await this.removeLocalFile(file);

                return {
                    success: false,
                    cancelled: true,
                };
            }

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
        }
    }
}