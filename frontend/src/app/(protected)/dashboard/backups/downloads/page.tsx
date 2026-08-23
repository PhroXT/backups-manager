"use client";

import { useEffect, useState } from "react";
import { backupsService } from "@/src/services/backups.service";
import {
    AvailableBackupProject,
    AvailableBackup,
} from "@/src/types/backup";
import { formatBytes, formatDate } from "@/src/lib/format";
import PageHeader from "@/src/components/ui/PageHeader";
import Card from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import Badge from "@/src/components/ui/Badge";

export default function BackupDownloadsPage() {

    const [projects, setProjects] = useState<AvailableBackupProject[]>([]);
    const [expandedProject, setExpandedProject] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        loadBackups();
    }, []);

    async function loadBackups() {
        try {
            const data =
                await backupsService.getAvailableBackups();

            setProjects(data);
        } finally {
            setLoading(false);
        }
    }

    function toggleProject(id: string) {
        setExpandedProject((current) =>
            current === id ? null : id
        );
    }

    async function downloadBackup(backup: AvailableBackup) {

        setDownloading(backup.id);

        try {
            const result =
                await backupsService.getDownloadUrl(
                    backup.id
                );

            window.location.href = result.url;

        } finally {
            setDownloading(null);
        }
    }

    if (loading) {
        return (
            <div>
                <PageHeader
                    title="Available Backups"
                    description="Backups currently retained and available for download."
                />

                <div className="rounded-lg border border-border bg-card p-6 text-muted">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div>

            <PageHeader
                title="Available Backups"
                description="Backups currently retained and available for download."
            />

            <div className="mt-6 space-y-4">

                {projects.map((project) => {

                    const isExpanded =
                        expandedProject === project.id;

                    const backupCount =
                        project.backups.length;

                    return (
                        <Card key={project.id}>

                            <button
                                type="button"
                                onClick={() =>
                                    toggleProject(project.id)
                                }
                                className="w-full text-left"
                            >
                                <div className="flex items-center justify-between">

                                    <div className="flex items-center gap-3">

                                        <span className="text-muted">
                                            {isExpanded ? "▼" : "▶"}
                                        </span>

                                        <div>
                                            <h2 className="font-semibold text-foreground">
                                                {project.name}
                                            </h2>

                                            <p className="text-sm text-muted">
                                                {project.type}
                                            </p>
                                        </div>

                                    </div>

                                    <Badge
                                        variant={
                                            backupCount > 0
                                                ? "success"
                                                : "neutral"
                                        }
                                    >
                                        {backupCount}{" "}
                                        {backupCount === 1
                                            ? "backup"
                                            : "backups"}
                                    </Badge>

                                </div>
                            </button>

                            {isExpanded && (
                                <div className="mt-5 border-t border-border pt-5">

                                    {backupCount === 0 ? (

                                        <p className="text-sm text-muted">
                                            No backups are currently
                                            available for this project.
                                        </p>

                                    ) : (

                                        <div className="overflow-x-auto">

                                            <table className="w-full">

                                                <thead>
                                                    <tr className="border-b border-border">
                                                        <th className="p-3 text-left text-sm font-medium text-muted">
                                                            File
                                                        </th>

                                                        <th className="p-3 text-left text-sm font-medium text-muted">
                                                            Size
                                                        </th>

                                                        <th className="p-3 text-left text-sm font-medium text-muted">
                                                            Date
                                                        </th>

                                                        <th className="p-3 text-right text-sm font-medium text-muted">
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {project.backups.map(
                                                        (backup) => (
                                                            <tr
                                                                key={backup.id}
                                                                className="border-b border-border last:border-b-0"
                                                            >
                                                                <td className="p-3 text-sm text-foreground">
                                                                    {backup.filename}
                                                                </td>

                                                                <td className="p-3 text-sm">
                                                                    {formatBytes(
                                                                        backup.size
                                                                    )}
                                                                </td>

                                                                <td className="p-3 text-sm">
                                                                    {formatDate(
                                                                        backup.createdAt
                                                                    )}
                                                                </td>

                                                                <td className="p-3 text-right">
                                                                    <Button
                                                                        variant="secondary"
                                                                        disabled={
                                                                            downloading ===
                                                                            backup.id
                                                                        }
                                                                        onClick={() =>
                                                                            downloadBackup(
                                                                                backup
                                                                            )
                                                                        }
                                                                    >
                                                                        {downloading ===
                                                                            backup.id
                                                                            ? "Preparing..."
                                                                            : "Download"}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>

                                            </table>

                                        </div>
                                    )}

                                </div>
                            )}

                        </Card>
                    );
                })}

            </div>

        </div>
    );
}