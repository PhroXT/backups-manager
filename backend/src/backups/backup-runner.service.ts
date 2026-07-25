import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);


@Injectable()
export class BackupRunnerService {


    async runPgDump(config: {
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
        filename: string;
    }) {


        const command = `
      docker exec backups-manager-tools \
      sh -c "PGPASSWORD='${config.password}' pg_dump \
      -h ${config.host} \
      -p ${config.port} \
      -U ${config.username} \
      -d ${config.database} \
      -F c \
      -f /backup/${config.filename}"
    `;


        await execAsync(command);


        return {
            success: true,
            file: config.filename,
        };

    }

}