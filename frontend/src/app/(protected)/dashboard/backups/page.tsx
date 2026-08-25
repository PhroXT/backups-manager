"use client";

import { formatBytes, formatDate } from "@/src/lib/format";
import DataTable from "@/src/components/ui/DataTable";
import PageHeader from "@/src/components/ui/PageHeader";
import { useDataTable } from "@/src/hooks/useDataTable";
import { backupsService } from "@/src/services/backups.service";
import { Backup } from "@/src/types/backup";

function formatDuration(
    startedAt: string | null,
    finishedAt: string | null,
) {
    if (!startedAt || !finishedAt) {
        return "—";
    }

    const elapsed =
        new Date(finishedAt).getTime() -
        new Date(startedAt).getTime();

    if (elapsed < 0) {
        return "—";
    }

    const totalSeconds = Math.floor(elapsed / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(
        (totalSeconds % 3600) / 60,
    );
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours} h ${minutes} min ${seconds} s`;
    }

    if (minutes > 0) {
        return `${minutes} min ${seconds} s`;
    }

    return `${seconds} s`;
}

function formatRetention(backup: Backup) {
    if (backup.weeklyKey) {
        return `Weekly: ${backup.weeklyKey}`;
    }

    if (backup.monthlyKey) {
        return `Monthly: ${backup.monthlyKey}`;
    }

    return "—";
}

export default function BackupsPage() {

    const table = useDataTable({
        service: backupsService,
        defaultSort: "createdAt",
    });

    const columns = [
        {
            label: "Project",
            key: "name" as keyof Backup,
            render: (backup: Backup) =>
                backup.project?.name ?? "—",
        },
        {
            label: "File",
            key: "filename" as keyof Backup,
            render: (backup: Backup) =>
                backup.filename,
        },
        {
            label: "Size",
            key: "size" as keyof Backup,
            render: (backup: Backup) =>
                formatBytes(backup.size),
        },
        {
            label: "Duration",
            key: "finishedAt" as keyof Backup,
            render: (backup: Backup) =>
                formatDuration(
                    backup.startedAt,
                    backup.finishedAt,
                ),
        },
        {
            label: "Retention",
            key: "weeklyKey" as keyof Backup,
            render: (backup: Backup) =>
                formatRetention(backup),
        },
        {
            label: "Status",
            key: "status" as keyof Backup,
            render: (backup: Backup) =>
                backup.status,
        },
        {
            label: "Date",
            key: "createdAt" as keyof Backup,
            render: (backup: Backup) =>
                formatDate(backup.createdAt),
        },
    ];

    return (
        <div>

            <PageHeader
                title="Backups"
                description="Backups generation, history and status."
            />

            <DataTable
                columns={columns}
                data={table.data}
                search={table.searchProps}
                pageSize={table.pageSizeProps}
                pagination={table.paginationProps}
                sort={table.sortProps}
            />

        </div>
    );
}