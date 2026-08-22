import { Injectable } from '@nestjs/common';
import { Client } from 'pg';

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
        const client = new Client({
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.username,
            password: config.password,
            ssl:
                config.sslMode === "disable"
                    ? false
                    : {
                        rejectUnauthorized: false,
                    },
        });

        try {
            await client.connect();
            await client.query('SELECT NOW()');
            await client.end();

            return { success: true, message: 'Connection successful' };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}