'use client';

import { useEffect, useState } from 'react';
import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';
import { useProjects } from '@/src/hooks/useProjects';
import { apiFetch } from '@/src/lib/api';
import { Schedule } from '@/src/hooks/useSchedules';

type ScheduleModalProps = {
    open: boolean;
    schedule?: Schedule | null;
    onClose: () => void;
    onSaved?: () => void;
};

const weekDays = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '0', label: 'Sunday' },
];

export default function ScheduleModal({
    open,
    schedule,
    onClose,
    onSaved,
}: ScheduleModalProps) {

    const { projects, loading: projectsLoading } = useProjects();

    const [saving, setSaving] = useState(false);

    const [projectId, setProjectId] = useState('');
    const [time, setTime] = useState('02:00');
    const [days, setDays] = useState<string[]>([]);

    const [retentionType, setRetentionType] =
        useState<'weekly' | 'monthly'>('weekly');

    const editing = Boolean(schedule);

    /*
     * Load schedule data when editing.
     */
    useEffect(() => {
        if (!open) {
            return;
        }

        if (!schedule) {
            resetForm();
            return;
        }

        const parts = schedule.cron.split(' ');

        const minutes = parts[0];
        const hours = parts[1];
        const cronDays = parts[4];

        setProjectId(schedule.projectId);

        setTime(
            `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`,
        );

        setRetentionType(
            schedule.retentionType === 'monthly'
                ? 'monthly'
                : 'weekly',
        );

        if (schedule.retentionType === 'weekly') {
            setDays(
                cronDays
                    .split(',')
                    .filter(Boolean),
            );
        } else {
            setDays([]);
        }
    }, [open, schedule]);

    function resetForm() {
        setProjectId('');
        setTime('02:00');
        setDays([]);
        setRetentionType('weekly');
    }

    function toggleDay(day: string) {
        setDays(current =>
            current.includes(day)
                ? current.filter(value => value !== day)
                : [...current, day],
        );
    }

    function handleClose() {
        if (saving) {
            return;
        }

        resetForm();
        onClose();
    }

    function buildCron(): string {
        const [hours, minutes] = time.split(':');

        if (retentionType === 'monthly') {
            return `${Number(minutes)} ${Number(hours)} 1 * *`;
        }

        const sortedDays = [...days]
            .sort((a, b) => Number(a) - Number(b))
            .join(',');

        return `${Number(minutes)} ${Number(hours)} * * ${sortedDays}`;
    }

    async function handleSave() {
        if (!projectId) {
            return;
        }

        if (
            retentionType === 'weekly' &&
            days.length === 0
        ) {
            return;
        }

        setSaving(true);

        try {
            const payload = {
                projectId,
                cron: buildCron(),
                retentionType,
            };

            if (editing) {
                await apiFetch(
                    `/schedules/${schedule!.id}`,
                    {
                        method: 'PATCH',
                        body: JSON.stringify(payload),
                    },
                );
            } else {
                await apiFetch('/schedules', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            }

            resetForm();
            onSaved?.();
            onClose();

        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={
                editing
                    ? 'Edit schedule'
                    : 'Create schedule'
            }
        >
            <div className="space-y-5">

                {/* Project */}

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Project
                    </label>

                    <select
                        value={projectId}
                        onChange={(e) =>
                            setProjectId(e.target.value)
                        }
                        disabled={
                            projectsLoading || saving
                        }
                        className="
                            w-full
                            rounded-md
                            border
                            border-border
                            bg-card
                            px-3
                            py-2
                            text-foreground
                            disabled:opacity-50
                        "
                    >
                        <option value="">
                            {projectsLoading
                                ? 'Loading projects...'
                                : 'Select a project'}
                        </option>

                        {projects.map((project) => (
                            <option
                                key={project.id}
                                value={project.id}
                            >
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Time */}

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Backup time
                    </label>

                    <input
                        type="time"
                        value={time}
                        onChange={(e) =>
                            setTime(e.target.value)
                        }
                        disabled={saving}
                        className="
                            rounded-md
                            border
                            border-border
                            bg-card
                            px-3
                            py-2
                            text-foreground
                            disabled:opacity-50
                        "
                    />
                </div>

                {/* Retention */}

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Retention
                    </label>

                    <div className="flex gap-3">

                        <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                                setRetentionType('weekly')
                            }
                            className={`
                                rounded-md
                                border
                                px-4
                                py-2
                                transition
                                ${retentionType === 'weekly'
                                    ? 'border-foreground bg-foreground text-background'
                                    : 'border-border hover:bg-foreground/5'
                                }
                            `}
                        >
                            Weekly
                        </button>

                        <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                                setRetentionType('monthly')
                            }
                            className={`
                                rounded-md
                                border
                                px-4
                                py-2
                                transition
                                ${retentionType === 'monthly'
                                    ? 'border-foreground bg-foreground text-background'
                                    : 'border-border hover:bg-foreground/5'
                                }
                            `}
                        >
                            Monthly
                        </button>

                    </div>
                </div>

                {/* Days */}

                {retentionType === 'weekly' && (
                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Days
                        </label>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                            {weekDays.map((day) => {

                                const selected =
                                    days.includes(day.value);

                                return (
                                    <button
                                        key={day.value}
                                        type="button"
                                        disabled={saving}
                                        onClick={() =>
                                            toggleDay(day.value)
                                        }
                                        className={`
                                            rounded-md
                                            border
                                            px-3
                                            py-2
                                            text-sm
                                            transition
                                            ${selected
                                                ? 'border-foreground bg-foreground text-background'
                                                : 'border-border hover:bg-foreground/5'
                                            }
                                        `}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}

                        </div>

                    </div>
                )}

                {/* Actions */}

                <div className="flex justify-end gap-2 pt-2">

                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        disabled={saving}
                    >
                        Cancel
                    </Button>

                    <Button
                        disabled={
                            saving ||
                            !projectId ||
                            (
                                retentionType === 'weekly' &&
                                days.length === 0
                            )
                        }
                        onClick={handleSave}
                    >
                        {saving
                            ? 'Saving...'
                            : editing
                                ? 'Save changes'
                                : 'Create schedule'}
                    </Button>

                </div>

            </div>
        </Modal>
    );
}