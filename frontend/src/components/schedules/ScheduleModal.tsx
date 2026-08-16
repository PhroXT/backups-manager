'use client';

import { useState } from 'react';
import Modal from '@/src/components/ui/Modal';
import Button from '@/src/components/ui/Button';
import { useProjects } from '@/src/hooks/useProjects';
import { apiFetch } from '@/src/lib/api';

type ScheduleModalProps = {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
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
    onClose,
    onCreated,
}: ScheduleModalProps) {

    const [creating, setCreating] = useState(false);
    const { projects, loading: projectsLoading } = useProjects();

    const [projectId, setProjectId] = useState('');
    const [time, setTime] = useState('02:00');

    const [days, setDays] = useState<string[]>([]);

    const [retentionType, setRetentionType] =
        useState<'weekly' | 'monthly'>('weekly');

    function toggleDay(day: string) {

        setDays(current =>
            current.includes(day)
                ? current.filter(value => value !== day)
                : [...current, day],
        );
    }

    function handleClose() {

        setProjectId('');
        setTime('02:00');
        setDays([]);
        setRetentionType('weekly');

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

    async function handleCreate() {

        if (!projectId) {
            return;
        }

        if (
            retentionType === 'weekly' &&
            days.length === 0
        ) {
            return;
        }

        setCreating(true);

        try {

            await apiFetch('/schedules', {
                method: 'POST',
                body: JSON.stringify({
                    projectId,
                    cron: buildCron(),
                    retentionType,
                }),
            });

            handleClose();
            onCreated?.();

        } finally {

            setCreating(false);

        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Create schedule"
        >

            <div className="space-y-5">

                {/* Project */}

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Project
                    </label>

                    <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        disabled={projectsLoading}
                        className="
                        w-full
                        rounded-md
                        border
                        border-border
                        bg-card
                        px-3
                        py-2
                        text-foreground
                        disabled:opacity-50"
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
                    <label className="block text-sm font-medium mb-2">
                        Backup time
                    </label>

                    <input
                        type="time"
                        value={time}
                        onChange={(e) =>
                            setTime(e.target.value)
                        }
                        className="
                            rounded-md
                            border
                            border-border
                            bg-card
                            px-3
                            py-2
                            text-foreground
                        "
                    />
                </div>


                {/* Retention */}

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Retention
                    </label>

                    <div className="flex gap-3">

                        <button
                            type="button"
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

                        <label className="block text-sm font-medium mb-2">
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
                    >
                        Cancel
                    </Button>

                    <Button
                        disabled={
                            creating ||
                            !projectId ||
                            (
                                retentionType === 'weekly' &&
                                days.length === 0
                            )
                        }
                        onClick={handleCreate}
                    >
                        {creating
                            ? 'Creating...'
                            : 'Create schedule'}
                    </Button>

                </div>

            </div>

        </Modal>
    );
}