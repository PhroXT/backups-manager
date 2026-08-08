"use client";

import { formatBytes, formatDate } from "@/src/lib/format"
import DataTable from "@/src/components/ui/DataTable";
import PageHeader from "@/src/components/ui/PageHeader";
import { useDataTable } from "@/src/hooks/useDataTable";
import { backupsService } from "@/src/services/backups.service";
import { Backup } from "@/src/types/backup";

export default function BackupsPage() {

    const table = useDataTable({
        service: backupsService,
        defaultSort: "createdAt",
    });

    const columns = [
        {
            label: "Project", key: "name" as keyof Backup,
            render: (backup: Backup) => backup.project.name,
        },
        {
            label: "File",
            key: "filename" as keyof Backup,
            render: (backup: Backup) => backup.filename,
        },
        {
            label: "Size",
            key: "size" as keyof Backup,
            render: (backup: Backup) => formatBytes(backup.size),
        },
        {
            label: "Status",
            key: "status" as keyof Backup,
            render: (backup: Backup) => backup.status,
        },
        {
            label: "Date",
            key: "createdAt" as keyof Backup,
            render: (backup: Backup) => formatDate(backup.createdAt),
        },
    ];

    return (
        <div>

            <PageHeader
                title="Backups"
                description=""
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