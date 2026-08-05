"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import { formatBytes, formatDate } from "@/src/lib/format"
import DataTable from "@/src/components/ui/DataTable";
import PageHeader from "@/src/components/ui/PageHeader";

type Backup = {
    id: string;
    filename: string;
    size: string;
    status: string;
    createdAt: string;
    project: {
        name: string;
    };
};


export default function BackupsPage() {

    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        apiFetch<Backup[]>("/backups")
            .then(setBackups)
            .finally(() => setLoading(false));

    }, []);

    const columns = [
        {
            label: "Project",
            render: (backup: Backup) => backup.project.name,
        },
        {
            label: "File",
            render: (backup: Backup) => backup.filename,
        },
        {
            label: "Size",
            render: (backup: Backup) => formatBytes(backup.size),
        },
        {
            label: "Status",
            render: (backup: Backup) => backup.status,
        },
        {
            label: "Date",
            render: (backup: Backup) => formatDate(backup.createdAt),
        },
    ];

    if (loading) {
        return <p className="text-gray-600">
            Loading backups...
        </p>;
    }


    return (
        <div>

            <PageHeader
                title="Backups"
                description="Backups list"
            />

            <DataTable columns={columns} data={backups} />

        </div>
    );
}