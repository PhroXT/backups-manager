'use client';

import { useState } from 'react';
import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';
import { apiFetch } from '@/src/lib/api';
import { Schedule } from '@/src/hooks/useSchedules';

type DeleteScheduleModalProps = {
    open: boolean;
    schedule: Schedule | null;
    onClose: () => void;
    onDeleted: () => void;
    onError: (message: string) => void;
};

export default function DeleteScheduleModal({
    open,
    schedule,
    onClose,
    onDeleted,
    onError,
}: DeleteScheduleModalProps) {

    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        if (!schedule) {
            return;
        }

        setDeleting(true);

        try {
            await apiFetch(
                `/schedules/${schedule.id}`,
                {
                    method: 'DELETE',
                },
            );

            onDeleted();
            onClose();

        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : 'Unable to delete schedule.',
            );
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                if (!deleting) {
                    onClose();
                }
            }}
            title="Delete schedule"
        >
            <div className="space-y-5">

                <div>
                    <p className="text-sm text-foreground">
                        Are you sure you want to delete this
                        schedule?
                    </p>

                    {schedule && (
                        <div className="mt-3 rounded-md border border-border bg-card p-3">
                            <p className="text-sm font-medium">
                                {schedule.project.name}
                            </p>

                            <p className="mt-1 text-sm text-muted">
                                {schedule.retentionType === 'monthly'
                                    ? 'Monthly'
                                    : 'Weekly'}
                            </p>
                        </div>
                    )}

                    <p className="mt-3 text-xs text-muted">
                        This will only delete the schedule.
                        Existing backups will not be deleted.
                    </p>
                </div>

                <div className="flex justify-end gap-2">

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={deleting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting
                            ? 'Deleting...'
                            : 'Delete schedule'}
                    </Button>

                </div>

            </div>
        </Modal>
    );
}