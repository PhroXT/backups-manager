export declare class ConnectionService {
    testPostgresConnection(config: {
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
