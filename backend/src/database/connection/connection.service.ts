import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class ConnectionService {

    async testPostgresConnection(config: {
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
        sslMode: string;
    }) {

        return new Promise<{
            success: boolean;
            message: string;
        }>((resolve) => {

            const args = [
                'exec',
                '-e', `PGPASSWORD=${config.password}`,
                '-e', `PGSSLMODE=${config.sslMode}`,
                'backups-manager-tools',
                'psql',
                '-h', config.host,
                '-p', String(config.port),
                '-U', config.username,
                '-d', config.database,
                '-c', 'SELECT NOW();',
            ];

            console.log(
                '[PostgreSQL connection test]',
                {
                    host: config.host,
                    port: config.port,
                    database: config.database,
                    username: config.username,
                    sslMode: config.sslMode,
                },
            );

            const child = spawn('docker', args);

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data: Buffer) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data: Buffer) => {
                stderr += data.toString();
            });

            child.on('error', (error) => {

                console.error(
                    '[PostgreSQL connection test error]',
                    error,
                );

                resolve({
                    success: false,
                    message: error.message,
                });
            });

            child.on('close', (code) => {

                if (code === 0) {

                    console.log(
                        '[PostgreSQL connection test] success',
                        stdout.trim(),
                    );

                    resolve({
                        success: true,
                        message: 'Connection successful',
                    });

                    return;
                }

                const message =
                    stderr.trim() ||
                    `psql exited with code ${code}`;

                console.error(
                    '[PostgreSQL connection test] failed',
                    message,
                );

                resolve({
                    success: false,
                    message,
                });
            });
        });
    }
}