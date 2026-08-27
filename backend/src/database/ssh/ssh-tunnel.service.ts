import { Injectable } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';

type SshTunnel = {
    process: ChildProcess;
    localPort: number;
};

@Injectable()
export class SshTunnelService {

    private readonly containerName =
        'backups-manager-tools';

    async openTunnel(config: {
        sshHost: string;
        sshPort: number;
        sshUsername: string;
        sshPassword: string;
        remoteHost: string;
        remotePort: number;
    }): Promise<SshTunnel> {

        const localPort =
            await this.findAvailablePort();

        console.log(
            '[SSH tunnel] opening',
            {
                sshHost: config.sshHost,
                sshPort: config.sshPort,
                sshUsername: config.sshUsername,
                remoteHost: config.remoteHost,
                remotePort: config.remotePort,
                localPort,
            },
        );

        const args = [
            'exec',

            '-u',
            'root',

            '-e',
            `SSHPASS=${config.sshPassword}`,

            this.containerName,

            'sshpass',
            '-e',
            'ssh',

            '-o',
            'StrictHostKeyChecking=no',

            '-o',
            'UserKnownHostsFile=/dev/null',

            '-o',
            'ExitOnForwardFailure=yes',

            '-N',

            '-L',
            `${localPort}:${config.remoteHost}:${config.remotePort}`,

            '-p',
            String(config.sshPort),

            `${config.sshUsername}@${config.sshHost}`,
        ];

        const child =
            spawn(
                'docker',
                args,
                {
                    stdio: [
                        'ignore',
                        'pipe',
                        'pipe',
                    ],
                },
            );

        let stderr = '';

        child.stderr?.on(
            'data',
            (data: Buffer) => {
                stderr += data.toString();
            },
        );

        try {

            await this.waitForTunnel(
                child,
                localPort,
                () => stderr,
            );

        } catch (error) {

            child.kill('SIGTERM');

            throw error;
        }

        console.log(
            '[SSH tunnel] ready',
            {
                localPort,
            },
        );

        return {
            process: child,
            localPort,
        };
    }


    async closeTunnel(
        tunnel: SshTunnel,
    ): Promise<void> {

        if (
            tunnel.process.exitCode !== null
        ) {
            return;
        }

        console.log(
            '[SSH tunnel] closing',
            {
                localPort: tunnel.localPort,
            },
        );

        tunnel.process.kill(
            'SIGTERM',
        );

        await new Promise<void>((resolve) => {

            const timeout =
                setTimeout(
                    resolve,
                    3000,
                );

            tunnel.process.once(
                'close',
                () => {

                    clearTimeout(
                        timeout,
                    );

                    resolve();
                },
            );
        });

        console.log(
            '[SSH tunnel] closed',
            {
                localPort: tunnel.localPort,
            },
        );
    }


    private async findAvailablePort(): Promise<number> {

        return new Promise(
            (resolve, reject) => {

                const child =
                    spawn(
                        'docker',
                        [
                            'exec',
                            '-u',
                            'root',
                            this.containerName,
                            'sh',
                            '-c',
                            `
                            for port in $(seq 20000 20100); do
                                if ! nc -z 127.0.0.1 "$port" 2>/dev/null; then
                                    echo "$port";
                                    exit 0;
                                fi
                            done
                            exit 1
                            `,
                        ],
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
                    reject,
                );

                child.on(
                    'close',
                    (code) => {

                        if (code !== 0) {

                            reject(
                                new Error(
                                    stderr.trim() ||
                                    'Unable to find available SSH tunnel port',
                                ),
                            );

                            return;
                        }

                        const port =
                            Number(
                                stdout.trim(),
                            );

                        if (
                            !Number.isInteger(port) ||
                            port <= 0
                        ) {

                            reject(
                                new Error(
                                    'Invalid SSH tunnel port',
                                ),
                            );

                            return;
                        }

                        resolve(port);
                    },
                );
            },
        );
    }


    private async waitForTunnel(
        child: ChildProcess,
        localPort: number,
        getStderr: () => string,
    ): Promise<void> {

        const timeoutMs =
            10000;

        const startedAt =
            Date.now();

        return new Promise(
            (resolve, reject) => {

                const check =
                    setInterval(
                        () => {

                            if (
                                child.exitCode !== null
                            ) {

                                clearInterval(
                                    check,
                                );

                                reject(
                                    new Error(
                                        getStderr().trim() ||
                                        `SSH exited with code ${child.exitCode}`,
                                    ),
                                );

                                return;
                            }

                            if (
                                Date.now() -
                                startedAt >=
                                timeoutMs
                            ) {

                                clearInterval(
                                    check,
                                );

                                reject(
                                    new Error(
                                        getStderr().trim() ||
                                        'SSH tunnel timed out',
                                    ),
                                );

                                return;
                            }

                            const probe =
                                spawn(
                                    'docker',
                                    [
                                        'exec',
                                        '-u',
                                        'root',
                                        this.containerName,
                                        'sh',
                                        '-c',
                                        `nc -z 127.0.0.1 ${localPort}`,
                                    ],
                                );

                            probe.on(
                                'close',
                                (code) => {

                                    if (
                                        code === 0
                                    ) {

                                        clearInterval(
                                            check,
                                        );

                                        resolve();
                                    }
                                },
                            );

                        },
                        100,
                    );
            },
        );
    }
}