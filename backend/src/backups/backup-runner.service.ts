import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

@Injectable()
export class BackupRunnerService {

    async runPgDump(config: {
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
        sslMode: string;
        filename: string;
    }) {
        console.log({
            user: config.username,
            passwordLength: config.password.length,
            host: config.host,
            database: config.database,
        });

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

        console.log("Ejecutando docker exec con args (sin exponer password)");

        await execFileAsync('docker', args);

        return {
            success: true,
            file: config.filename,
        };
    }
}