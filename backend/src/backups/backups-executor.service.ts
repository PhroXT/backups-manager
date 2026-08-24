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

        console.log(
            `[backup ${backupId}] CANCEL requested`,
        );

        const cancelled =
            await this.runner.cancel(backupId);

        if (!cancelled) {

            console.log(
                `[backup ${backupId}] CANCEL failed - process not found`,
            );

            return false;
        }

        this.cancelledBackups.add(backupId);

        console.log(
            `[backup ${backupId}] CANCEL registered`,
        );

        return true;
    }


    async execute(
        backupId: string,
        attemptsMade = 0,
        maxAttempts = 1,
    ) {

        console.log(
            `[backup ${backupId}] EXECUTE START`,
            {
                attemptsMade,
                maxAttempts,
            },
        );

        const backup = await this.prisma.backup.findUnique({
            where: {
                id: backupId,
            },
            include: {
                project: true,
            },
        });

        if (!backup) {

            console.log(
                `[backup ${backupId}] Backup not found`,
            );

            throw new Error('Backup not found');
        }

        if (!backup.project) {

            console.log(
                `[backup ${backupId}] Project no longer exists`,
            );

            throw new Error(
                'Cannot execute backup: project no longer exists',
            );
        }

        console.log(
            `[backup ${backupId}] Current status: ${backup.status}`,
        );

        if (backup.status === 'completed') {

            console.log(
                `[backup ${backupId}] Already completed`,
            );

            return {
                success: true,
                filename: backup.filename,
            };
        }

        if (
            backup.status !== 'pending' &&
            backup.status !== 'running'
        ) {

            console.log(
                `[backup ${backupId}] Cannot execute because status is ${backup.status}`,
            );

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

        console.log(
            `[backup ${backupId}] Status changed to RUNNING`,
        );

        const filename = `${backup.id}.dump`;

        const file = path.join(
            process.cwd(),
            '..',
            'storage',
            filename,
        );

        console.log(
            `[backup ${backupId}] Local file path: ${file}`,
        );

        try {

            console.log(
                `[backup ${backupId}] removeLocalFile START`,
            );

            await this.removeLocalFile(file);

            console.log(
                `[backup ${backupId}] removeLocalFile END`,
            );


            // ---------------------------------------------------------
            // PG_DUMP
            // ---------------------------------------------------------

            console.log(
                `[backup ${backupId}] runPgDump START`,
                {
                    host: backup.project.host,
                    port: backup.project.port,
                    database: backup.project.database,
                    username: backup.project.username,
                    filename,
                },
            );

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

                    console.log(
                        `[backup ${backupId}] PROGRESS`,
                        {
                            bytes,
                        },
                    );

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

            console.log(
                `[backup ${backupId}] runPgDump END`,
            );


            // ---------------------------------------------------------
            // FILE STAT
            // ---------------------------------------------------------

            console.log(
                `[backup ${backupId}] fs.stat START`,
            );

            const stats = await fs.promises.stat(file);

            console.log(
                `[backup ${backupId}] fs.stat END`,
                {
                    size: stats.size,
                },
            );

            if (stats.size === 0) {

                console.log(
                    `[backup ${backupId}] ERROR: generated file is empty`,
                );

                throw new Error(
                    'Generated backup file is empty',
                );
            }


            // ---------------------------------------------------------
            // VALIDATE DUMP
            // ---------------------------------------------------------

            console.log(
                `[backup ${backupId}] validatePgDump START`,
                {
                    filename,
                    size: stats.size,
                },
            );

            await this.runner.validatePgDump(filename);

            console.log(
                `[backup ${backupId}] validatePgDump END`,
            );


            // ---------------------------------------------------------
            // UPLOAD
            // ---------------------------------------------------------

            console.log(
                `[backup ${backupId}] uploadFile START`,
                {
                    bucket: 'backups',
                    filename,
                    size: stats.size,
                },
            );

            await this.storage.uploadFile(
                'backups',
                filename,
                file,
            );

            console.log(
                `[backup ${backupId}] uploadFile END`,
            );


            // ---------------------------------------------------------
            // MARK COMPLETED
            // ---------------------------------------------------------

            console.log(
                `[backup ${backupId}] Prisma completed UPDATE START`,
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

            console.log(
                `[backup ${backupId}] Prisma completed UPDATE END`,
            );


            // ---------------------------------------------------------
            // RETENTION
            // ---------------------------------------------------------

            if (backup.weeklyKey || backup.monthlyKey) {

                console.log(
                    `[backup ${backupId}] Retention cleanup START`,
                    {
                        weeklyKey: backup.weeklyKey,
                        monthlyKey: backup.monthlyKey,
                    },
                );

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

                console.log(
                    `[backup ${backupId}] Retention backups found`,
                    {
                        count: oldBackups.length,
                    },
                );

                for (const oldBackup of oldBackups) {

                    console.log(
                        `[backup ${backupId}] Processing old backup`,
                        {
                            oldBackupId: oldBackup.id,
                            filename: oldBackup.filename,
                        },
                    );

                    if (oldBackup.filename) {

                        try {

                            console.log(
                                `[backup ${backupId}] Deleting old storage file START`,
                                {
                                    filename:
                                        oldBackup.filename,
                                },
                            );

                            await this.storage.deleteFile(
                                'backups',
                                oldBackup.filename,
                            );

                            console.log(
                                `[backup ${backupId}] Deleting old storage file END`,
                                {
                                    filename:
                                        oldBackup.filename,
                                },
                            );

                        } catch (error) {

                            console.error(
                                `[backup ${backupId}] Failed to delete old backup from storage`,
                                {
                                    oldBackupId:
                                        oldBackup.id,
                                    error,
                                },
                            );

                            continue;
                        }
                    }

                    console.log(
                        `[backup ${backupId}] Deleting old Prisma backup`,
                        {
                            oldBackupId: oldBackup.id,
                        },
                    );

                    await this.prisma.backup.delete({
                        where: {
                            id: oldBackup.id,
                        },
                    });
                }

                console.log(
                    `[backup ${backupId}] Retention cleanup END`,
                );
            }


            // ---------------------------------------------------------
            // LOCAL FILE CLEANUP
            // ---------------------------------------------------------

            console.log(
                `[backup ${backupId}] Final removeLocalFile START`,
            );

            await this.removeLocalFile(file);

            console.log(
                `[backup ${backupId}] Final removeLocalFile END`,
            );


            console.log(
                `[backup ${backupId}] EXECUTE SUCCESS`,
                {
                    filename,
                    size: stats.size,
                },
            );

            return {
                success: true,
                filename,
            };

        } catch (error) {

            console.error(
                `[backup ${backupId}] EXECUTE ERROR`,
                {
                    attemptsMade,
                    maxAttempts,
                    error,
                },
            );

            const wasCancelled =
                this.cancelledBackups.delete(backupId);

            if (wasCancelled) {

                console.log(
                    `[backup ${backupId}] Handling cancellation`,
                );

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

                console.log(
                    `[backup ${backupId}] CANCELLED`,
                );

                return {
                    success: false,
                    cancelled: true,
                };
            }

            const isLastAttempt =
                attemptsMade + 1 >= maxAttempts;

            console.log(
                `[backup ${backupId}] Retry decision`,
                {
                    attemptsMade,
                    maxAttempts,
                    isLastAttempt,
                },
            );

            if (isLastAttempt) {

                console.log(
                    `[backup ${backupId}] Marking backup as FAILED`,
                );

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

                console.log(
                    `[backup ${backupId}] Marking backup as PENDING for retry`,
                );

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

            console.log(
                `[backup ${backupId}] Error cleanup START`,
            );

            await this.removeLocalFile(file);

            console.log(
                `[backup ${backupId}] Error cleanup END`,
            );

            throw error;
        }
    }


    private async removeLocalFile(file: string) {

        console.log(
            `[backup cleanup] removeLocalFile START`,
            {
                file,
            },
        );

        try {

            await fs.promises.unlink(file);

            console.log(
                `[backup cleanup] File deleted`,
                {
                    file,
                },
            );

        } catch (error) {

            if (
                error instanceof Error &&
                'code' in error &&
                error.code === 'ENOENT'
            ) {

                console.log(
                    `[backup cleanup] File does not exist`,
                    {
                        file,
                    },
                );

                return;
            }

            console.error(
                `[backup cleanup] Failed to remove local backup file`,
                {
                    file,
                    error,
                },
            );
        }
    }
}