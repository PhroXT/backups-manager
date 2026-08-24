import { Injectable } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PG_DUMP_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

@Injectable()
export class BackupRunnerService {

    private readonly processes = new Map<string, ChildProcess>();

    async validatePgDump(filename: string): Promise<void> {

        const args = [
            'exec',
            'backups-manager-tools',
            'pg_restore',
            '--list',
            `/backup/${filename}`,
        ];

        return new Promise((resolve, reject) => {

            const child = spawn('docker', args);

            let stderr = '';

            child.stdout.resume();

            child.stderr.on('data', (data: Buffer) => {
                stderr += data.toString();
            });

            child.on('error', (error) => {
                reject(error);
            });

            child.on('close', (code) => {

                if (code === 0) {
                    resolve();
                    return;
                }

                reject(
                    new Error(
                        stderr.trim() ||
                        `pg_restore validation failed with code ${code}`,
                    ),
                );
            });
        });
    }

    runPgDump(config: {
        backupId: string;
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
        sslMode: string;
        filename: string;
        onProgress?: (info: {
            bytes: number;
            elapsedMs: number;
        }) => void;
    }): Promise<{
        success: true;
        file: string;
    }> {

        return new Promise((resolve, reject) => {

            const args = [
                'exec',
                '-e', `PGPASSWORD=${config.password}`,
                '-e', `PGSSLMODE=${config.sslMode}`,
                'backups-manager-tools',
                'pg_dump',
                '-h', config.host,
                '-p', String(config.port),
                '-U', config.username,
                '-d', config.database,
                '-F', 'c',
                '-f', `/backup/${config.filename}`,
            ];

            const file = path.join(
                process.cwd(),
                '..',
                'storage',
                config.filename,
            );

            const startedAt = Date.now();

            const child = spawn('docker', args);

            this.processes.set(
                config.backupId,
                child,
            );

            let stderr = '';
            let lastSize = 0;
            let lastProgressAt = Date.now();
            let settled = false;

            const cleanup = () => {

                clearInterval(progressInterval);

                this.processes.delete(
                    config.backupId,
                );
            };

            const terminate = async (): Promise<void> => {

                try {

                    const killer = spawn(
                        'docker',
                        [
                            'exec',
                            'backups-manager-tools',
                            'pkill',
                            '-TERM',
                            '-f',
                            config.filename,
                        ],
                    );

                    await new Promise<void>((resolve) => {

                        killer.on('close', () => {
                            resolve();
                        });

                        killer.on('error', () => {
                            resolve();
                        });
                    });

                } catch {
                }
            };

            const progressInterval = setInterval(
                async () => {

                    if (settled) {
                        return;
                    }

                    try {

                        const stats =
                            await fs.promises.stat(file);

                        const now = Date.now();
                        const currentSize = stats.size;

                        if (currentSize > lastSize) {

                            lastSize = currentSize;
                            lastProgressAt = now;

                        }

                        config.onProgress?.({
                            bytes: currentSize,
                            elapsedMs:
                                now - startedAt,
                        });

                        const inactiveFor =
                            now - lastProgressAt;

                        if (
                            inactiveFor >=
                            PG_DUMP_INACTIVITY_TIMEOUT_MS
                        ) {

                            settled = true;

                            cleanup();

                            console.error(
                                `[pg_dump] INACTIVITY TIMEOUT backup=${config.backupId}`,
                                {
                                    inactiveForMs:
                                        inactiveFor,
                                    lastSize,
                                    filename:
                                        config.filename,
                                },
                            );

                            await terminate();

                            reject(
                                new Error(
                                    `pg_dump stopped after ${PG_DUMP_INACTIVITY_TIMEOUT_MS / 60000} minutes without progress`,
                                ),
                            );
                        }

                    } catch {
                    }

                },
                10000,
            );

            child.stderr.on('data', (data: Buffer) => {

                stderr += data.toString();

            });

            child.on('error', (error) => {

                if (settled) {
                    return;
                }

                settled = true;

                cleanup();

                reject(error);
            });

            child.on('exit', (code, signal) => {

                console.log(
                    `[pg_dump] EXIT backup=${config.backupId}`,
                    {
                        code,
                        signal,
                    },
                );

            });

            child.on('close', (code, signal) => {

                if (settled) {
                    return;
                }

                settled = true;

                cleanup();

                if (code === 0) {

                    resolve({
                        success: true,
                        file: config.filename,
                    });

                    return;
                }

                reject(
                    new Error(
                        stderr.trim() ||
                        `pg_dump exited with code ${code}${signal
                            ? ` by signal ${signal}`
                            : ''}`,
                    ),
                );
            });
        });
    }

    async cancel(backupId: string): Promise<boolean> {

        const child = this.processes.get(backupId);

        if (!child) {
            return false;
        }

        const filename = `${backupId}.dump`;

        await new Promise<void>((resolve, reject) => {

            const killer = spawn(
                'docker',
                [
                    'exec',
                    'backups-manager-tools',
                    'pkill',
                    '-TERM',
                    '-f',
                    filename,
                ],
            );

            killer.on('error', reject);

            killer.on('close', () => {
                resolve();
            });
        });

        return true;
    }
}