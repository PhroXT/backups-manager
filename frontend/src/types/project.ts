export interface Project {
    id: string;
    name: string;
    type: string;
    host: string;
    port: number;
    database: string;
    username: string;
    enabled: boolean;
    sslMode: string;
    sshEnabled: boolean;
    sshHost: string | null;
    sshPort: number | null;
    sshUsername: string | null;
}