export interface Backup {
    id: string;
    filename: string;
    size: string;
    status: string;
    createdAt: string;

    project: {
        name: string;
    };

    weeklyKey: string | null;
    monthlyKey: string | null;
    startedAt: string | null;
    finishedAt: string | null;
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
    backupCount: number;
};

export type AvailableBackupProjectsResponse = {
    data: AvailableBackupProject[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

export type AvailableBackupsResponse = {
    project: {
        id: string;
        name: string;
    };
    data: AvailableBackup[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};