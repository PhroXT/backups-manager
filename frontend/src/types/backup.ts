export interface Backup {
    id: string;
    filename: string;
    size: string;
    status: string;
    createdAt: string;

    project: {
        name: string;
    };
}