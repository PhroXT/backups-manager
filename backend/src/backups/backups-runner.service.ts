import { Injectable } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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

            child.on('close', (code, signal) => {

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

            const progressInterval = setInterval(async () => {

                try {
                    const stats = await fs.promises.stat(file);

                    config.onProgress?.({
                        bytes: stats.size,
                        elapsedMs: Date.now() - startedAt,
                    });

                } catch {
                }

            }, 10000);

            child.stderr.on('data', (data: Buffer) => {

                stderr += data.toString();

            });

            child.on('error', (error) => {

                clearInterval(progressInterval);

                this.processes.delete(
                    config.backupId,
                );

                reject(error);
            });

            child.on('exit', (code, signal) => {
            });

            child.on('close', (code, signal) => {

                clearInterval(progressInterval);

                this.processes.delete(
                    config.backupId,
                );

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
                        `pg_dump exited with code ${code}`,
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

        const args = [
            'exec',
            'backups-manager-tools',
            'pkill',
            '-TERM',
            '-f',
            filename,
        ];

        await new Promise<void>((resolve, reject) => {

            const killer = spawn('docker', args);

            killer.on('error', reject);

            killer.on('close', () => {
                resolve();
            });
        });

        return true;
    }
}