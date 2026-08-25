'use client';

import { useEffect, useState } from 'react';
import { useActiveBackups } from '@/src/hooks/useActiveBackups';
import Modal from "@/src/components/ui/Modal";
import Button from "@/src/components/ui/Button";

function formatBytes(bytes: string | null) {

    if (!bytes) {
        return '0 MB';
    }

    const value = Number(bytes);

    if (value < 1024 * 1024) {
        return `${(value / 1024).toFixed(1)} KB`;
    }

    if (value < 1024 * 1024 * 1024) {
        return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}


function formatElapsed(startedAt: string | null) {

    if (!startedAt) {
        return '—';
    }

    const elapsed = Math.max(
        0,
        Date.now() - new Date(startedAt).getTime(),
    );

    const totalSeconds = Math.floor(elapsed / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
}


export default function ActiveBackups() {

    const [backupToCancel, setBackupToCancel] = useState<string | null>(null);
    const { backups, loading, cancelBackup } = useActiveBackups();
    const [, setNow] = useState(Date.now());
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {

        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(interval);

    }, []);


    if (loading) {
        return null;
    }

    return (
        <section className="mt-6">

            <h2 className="text-xl font-semibold mb-3">
                Backups in progress
            </h2>

            {backups.length === 0 ? (

                <div className="border rounded-lg p-4">
                    <p className="text-muted">
                        No backups are currently in progress.
                    </p>
                </div>

            ) : (

                <div className="space-y-3">

                    {backups.map((backup) => (

                        <div
                            key={backup.id}
                            className="border rounded-lg p-4"
                        >

                            <div className="flex items-center justify-between">

                                <div>
                                    <h3 className="font-semibold">
                                        {backup.project.name}
                                    </h3>

                                    <p className="text-sm text-muted">
                                        {backup.status === 'running'
                                            ? 'Generating backup...'
                                            : 'Waiting to start...'}
                                    </p>
                                </div>

                                <span className="text-sm font-medium">
                                    {backup.status}
                                </span>

                            </div>


                            {backup.status === 'running' && (

                                <div className="mt-4 flex gap-8 items-center">

                                    <div>
                                        <p className="text-sm text-muted">
                                            Generated
                                        </p>

                                        <p className="font-semibold">
                                            {formatBytes(
                                                backup.lastActivitySize,
                                            )}
                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-sm text-muted">
                                            Elapsed
                                        </p>

                                        <p className="font-semibold">
                                            {formatElapsed(
                                                backup.startedAt,
                                            )}
                                        </p>
                                    </div>

                                    <div className="ml-auto">
                                        <Button
                                            variant="danger"
                                            disabled={cancelling}
                                            onClick={() => setBackupToCancel(backup.id)}
                                        >
                                            {cancelling && backupToCancel === backup.id
                                                ? 'Cancelling...'
                                                : 'Cancel'}
                                        </Button>
                                    </div>

                                </div>

                            )}

                        </div>

                    ))}

                </div>

            )}

            <Modal
                open={backupToCancel !== null}
                onClose={() => {
                    if (!cancelling) {
                        setBackupToCancel(null);
                    }
                }}
                title="Cancel backup?"
            >
                <p className="text-sm text-muted">
                    Are you sure you want to cancel this backup?
                </p>

                <p className="mt-2 text-sm text-muted">
                    The current operation will be stopped and the
                    generated data will be discarded.
                </p>

                <div className="mt-6 flex justify-end gap-2">

                    <Button
                        variant="secondary"
                        disabled={cancelling}
                        onClick={() => setBackupToCancel(null)}
                    >
                        Keep running
                    </Button>

                    <Button
                        variant="danger"
                        disabled={cancelling}
                        onClick={async () => {

                            if (!backupToCancel) {
                                return;
                            }

                            setCancelling(true);

                            try {

                                await cancelBackup(
                                    backupToCancel,
                                );

                                setBackupToCancel(null);

                            } finally {

                                setCancelling(false);

                            }
                        }}
                    >
                        {cancelling
                            ? "Cancelling..."
                            : "Cancel backup"}
                    </Button>

                </div>
            </Modal>

        </section>
    );
}