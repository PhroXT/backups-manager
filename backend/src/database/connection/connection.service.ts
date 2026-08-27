import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { EncryptionService } from '../../common/encryption/encryption.service';
import { SshTunnelService } from '../ssh/ssh-tunnel.service';

@Injectable()
export class ConnectionService {

    constructor(
        private readonly encryptionService: EncryptionService,
        private readonly sshTunnelService: SshTunnelService,
    ) { }

    async testPostgresConnection(config: {
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
        sslMode: string;
        //For SSH
        sshEnabled: boolean;
        sshHost?: string | null;
        sshPort?: number | null;
        sshUsername?: string | null;
        sshPassword?: string | null;
    }) {

        const password =
            this.encryptionService.decrypt(
                config.password,
            );

        let tunnel:
            Awaited<
                ReturnType<
                    SshTunnelService['openTunnel']
                >
            > | null = null;

        try {

            /*
             * SSH Tunnel
             */

            if (config.sshEnabled) {

                if (
                    !config.sshHost ||
                    !config.sshPort ||
                    !config.sshUsername ||
                    !config.sshPassword
                ) {

                    return {
                        success: false,
                        message: 'SSH configuration is incomplete',
                    };
                }

                const sshPassword =
                    this.encryptionService.decrypt(
                        config.sshPassword,
                    );

                tunnel =
                    await this.sshTunnelService.openTunnel({
                        sshHost: config.sshHost,
                        sshPort: config.sshPort,
                        sshUsername: config.sshUsername,
                        sshPassword,
                        remoteHost: config.host,
                        remotePort: config.port,
                    });
            }

            /*
             * PostgreSQL connection target
             */

            const databaseHost =
                tunnel
                    ? '127.0.0.1'
                    : config.host;

            const databasePort =
                tunnel
                    ? tunnel.localPort
                    : config.port;

            const args = [
                'exec',

                '-e',
                `PGPASSWORD=${password}`,

                '-e',
                `PGSSLMODE=${config.sslMode}`,

                'backups-manager-tools',

                'psql',

                '-h',
                databaseHost,

                '-p',
                String(databasePort),

                '-U',
                config.username,

                '-d',
                config.database,

                '-c',
                'SELECT NOW();',
            ];

            console.log(
                '[PostgreSQL connection test]',
                {
                    host: databaseHost,
                    port: databasePort,
                    database: config.database,
                    username: config.username,
                    sslMode: config.sslMode,
                    sshEnabled: config.sshEnabled,
                },
            );

            const result =
                await new Promise<{
                    success: boolean;
                    message: string;
                }>((resolve) => {

                    const child =
                        spawn(
                            'docker',
                            args,
                        );

                    let stdout = '';
                    let stderr = '';

                    child.stdout.on(
                        'data',
                        (data: Buffer) => {
                            stdout += data.toString();
                        },
                    );

                    child.stderr.on(
                        'data',
                        (data: Buffer) => {
                            stderr += data.toString();
                        },
                    );

                    child.on(
                        'error',
                        (error) => {

                            console.error(
                                '[PostgreSQL connection test error]',
                                error,
                            );

                            resolve({
                                success: false,
                                message: error.message,
                            });
                        },
                    );

                    child.on(
                        'close',
                        (code) => {

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
                        },
                    );
                });

            return result;

        } catch (error) {

            console.error(
                '[PostgreSQL connection test error]',
                error,
            );

            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Unable to test PostgreSQL connection',
            };

        } finally {

            /*
             * The SSH tunnel must always be closed,
             * whether PostgreSQL succeeded or failed.
             */

            if (tunnel) {

                await this.sshTunnelService.closeTunnel(
                    tunnel,
                );
            }
        }
    }
}