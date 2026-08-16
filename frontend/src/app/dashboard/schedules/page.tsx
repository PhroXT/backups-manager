'use client';

import { useState } from 'react';

import PageHeader from '@/src/components/ui/PageHeader';
import Button from '@/src/components/ui/Button';
import Badge from '@/src/components/ui/Badge';
import Alert from '@/src/components/ui/Alert';

import ScheduleModal from '@/src/components/schedules/ScheduleModal';
import { useSchedules } from '@/src/hooks/useSchedules';
import { AlertState } from '@/src/types/Alert.type';

export default function SchedulesPage() {

    const {
        schedules,
        loading,
        reload,
    } = useSchedules();

    const [open, setOpen] = useState(false);
    const [alert, setAlert] = useState<AlertState>(null);

    async function handleCreated() {

        await reload();

        setAlert({
            variant: 'success',
            title: 'Schedule created',
            message: 'The backup schedule was created successfully.',
        });
    }

    function formatSchedule(
        cron: string,
        retentionType: string,
    ) {

        const parts = cron.split(' ');

        const minutes = parts[0];
        const hours = parts[1];

        const time =
            `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

        if (retentionType === 'monthly') {
            return `Monthly · ${time}`;
        }

        const dayMap: Record<string, string> = {
            '0': 'Sun',
            '1': 'Mon',
            '2': 'Tue',
            '3': 'Wed',
            '4': 'Thu',
            '5': 'Fri',
            '6': 'Sat',
        };

        const days = parts[4]
            .split(',')
            .map(day => dayMap[day] ?? day);

        return `${days.join(' · ')} · ${time}`;
    }

    return (
        <div>

            <div className="flex items-center justify-between mb-6">

                <PageHeader
                    title="Schedules"
                    description="Configure when backups should run automatically."
                />

                <Button
                    variant="secondary"
                    onClick={() => setOpen(true)}
                >
                    New Schedule
                </Button>

            </div>


            {alert && (
                <Alert
                    variant={alert.variant}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                    durationMs={2000}
                />
            )}


            <div className="border border-border rounded-lg overflow-hidden">

                {loading ? (

                    <div className="p-6 text-muted">
                        Loading schedules...
                    </div>

                ) : schedules.length === 0 ? (

                    <div className="p-6 text-muted">
                        No schedules configured.
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead className="border-b border-border">
                                <tr className="text-left">

                                    <th className="px-4 py-3">
                                        Project
                                    </th>

                                    <th className="px-4 py-3">
                                        Schedule
                                    </th>

                                    <th className="px-4 py-3">
                                        Retention
                                    </th>

                                    <th className="px-4 py-3">
                                        Status
                                    </th>

                                    <th className="px-4 py-3">
                                        Last Run
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {schedules.map((schedule) => (

                                    <tr
                                        key={schedule.id}
                                        className="border-b border-border last:border-0"
                                    >

                                        <td className="px-4 py-3 font-medium">
                                            {schedule.project.name}
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatSchedule(
                                                schedule.cron,
                                                schedule.retentionType,
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            {schedule.retentionType === 'monthly'
                                                ? 'Monthly'
                                                : 'Weekly'}
                                        </td>

                                        <td className="px-4 py-3">

                                            <Badge
                                                variant={
                                                    schedule.enabled
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {schedule.enabled
                                                    ? 'Active'
                                                    : 'Disabled'}
                                            </Badge>

                                        </td>

                                        <td className="px-4 py-3 text-muted">
                                            {schedule.lastRun
                                                ? new Date(
                                                    schedule.lastRun,
                                                ).toLocaleString()
                                                : 'Never'}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            <ScheduleModal
                open={open}
                onClose={() => setOpen(false)}
                onCreated={handleCreated}
            />

        </div>
    );
}