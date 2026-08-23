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

export type AvailableBackup = {
    id: string;
    filename: string;
    size: string | null;
    createdAt: string;
};

export type AvailableBackupProject = {
    id: string;
    name: string;
    type: string;
    backups: AvailableBackup[];
};