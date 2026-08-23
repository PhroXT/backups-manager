"use client";

import { AvailableBackup, AvailableBackupProject as Project } from "@/src/types/backup";
import { formatBytes, formatDate } from "@/src/lib/format";
import Button from "@/src/components/ui/Button";

type BackupState = {
    data: AvailableBackup[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    loading: boolean;
    loaded: boolean;
};

type Props = {
    project: Project;
    expanded: boolean;
    backups?: BackupState;
    downloading: string | null;

    onToggle: () => void;
    onBackupPageChange: (page: number) => void;
    onDownload: (backup: AvailableBackup) => void;
};

export default function AvailableBackupProject({
    project,
    expanded,
    backups,
    downloading,
    onToggle,
    onBackupPageChange,
    onDownload,
}: Props) {

    const backupData = backups?.data ?? [];

    return (
        <div className="rounded-lg border border-border bg-card overflow-hidden">

            <button
                type="button"
                onClick={onToggle}
                className="
                    w-full
                    flex
                    items-center
                    justify-between
                    p-4
                    text-left
                    hover:bg-foreground/5
                    transition
                "
            >
                <div>
                    <h2 className="font-semibold text-foreground">
                        {project.name}
                    </h2>

                    <p className="text-sm text-muted">
                        {project.type}
                    </p>
                </div>

                <div className="flex items-center gap-4">

                    <span className="text-sm text-muted">
                        {project.backupCount}{" "}
                        {project.backupCount === 1
                            ? "backup"
                            : "backups"}
                    </span>

                    <span className="text-muted text-lg">
                        {expanded ? "⌃" : "⌄"}
                    </span>

                </div>
            </button>

            {expanded && (
                <div className="border-t border-border p-4">

                    {backups?.loading && (
                        <div className="py-6 text-center text-muted">
                            Loading backups...
                        </div>
                    )}

                    {!backups?.loading &&
                        backups?.loaded &&
                        backupData.length === 0 && (
                            <div className="py-6 text-center text-muted">
                                This project has no available backups.
                            </div>
                        )}

                    {!backups?.loading &&
                        backups?.loaded &&
                        backupData.length > 0 && (
                            <div className="space-y-2">

                                {backupData.map((backup) => (
                                    <div
                                        key={backup.id}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                            rounded
                                            border
                                            border-border
                                            p-3
                                        "
                                    >
                                        <div className="min-w-0">

                                            <p className="truncate font-medium">
                                                {backup.filename}
                                            </p>

                                            <div className="flex gap-4 text-sm text-muted">
                                                <span>
                                                    {formatBytes(backup.size)}
                                                </span>

                                                <span>
                                                    {formatDate(backup.createdAt)}
                                                </span>
                                            </div>

                                        </div>

                                        <Button
                                            variant="secondary"
                                            disabled={
                                                downloading === backup.id
                                            }
                                            onClick={() =>
                                                onDownload(backup)
                                            }
                                        >
                                            {downloading === backup.id
                                                ? "Preparing..."
                                                : "Download"}
                                        </Button>
                                    </div>
                                ))}

                                {backups.totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-4">

                                        <button
                                            disabled={backups.page === 1}
                                            onClick={() =>
                                                onBackupPageChange(backups.page - 1)
                                            }
                                            className="
                rounded
                border
                border-border
                px-3
                py-1
                text-sm
                disabled:opacity-50
            "
                                        >
                                            Previous
                                        </button>

                                        <span className="text-sm text-muted">
                                            Page {backups.page} of {backups.totalPages}
                                        </span>

                                        <button
                                            disabled={
                                                backups.page === backups.totalPages
                                            }
                                            onClick={() =>
                                                onBackupPageChange(backups.page + 1)
                                            }
                                            className="
                rounded
                border
                border-border
                px-3
                py-1
                text-sm
                disabled:opacity-50
            "
                                        >
                                            Next
                                        </button>

                                    </div>
                                )}

                            </div>
                        )}

                </div>
            )}

        </div>
    );
}