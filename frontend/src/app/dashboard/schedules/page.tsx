'use client';

import { useState } from 'react';

import PageHeader from '@/src/components/ui/PageHeader';
import Button from '@/src/components/ui/Button';
import Badge from '@/src/components/ui/Badge';
import Alert from '@/src/components/ui/Alert';

import ScheduleModal from '@/src/components/schedules/ScheduleModal';
import { useSchedules, Schedule, } from '@/src/hooks/useSchedules';
import { AlertState } from '@/src/types/Alert.type';
import DataTable from '@/src/components/ui/DataTable';
import DeleteScheduleModal from '@/src/components/schedules/DeleteScheduleModal';

export default function SchedulesPage() {

    const {
        schedules,
        loading,
        reload,
        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        totalPages,
        sort,
        order,
        changeSort,
        toggleEnabled,
    } = useSchedules();

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [open, setOpen] = useState(false);
    const [alert, setAlert] = useState<AlertState>(null);

    async function handleSaved() {
        await reload();

        setSelectedSchedule(null);
        setOpen(false);

        setAlert({
            variant: 'success',
            title: selectedSchedule
                ? 'Schedule updated'
                : 'Schedule created',
            message: selectedSchedule
                ? 'The backup schedule was updated successfully.'
                : 'The backup schedule was created successfully.',
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

    const columns = [
        {
            key: 'project' as keyof Schedule,
            label: 'Project',
            render: (schedule: Schedule) => (
                <span className="font-medium">
                    {schedule.project.name}
                </span>
            ),
        },

        {
            label: 'Schedule',
            render: (schedule: Schedule) => (
                <>
                    {formatSchedule(
                        schedule.cron,
                        schedule.retentionType,
                    )}
                </>
            ),
        },

        {
            key: 'retentionType' as keyof Schedule,
            label: 'Retention',
            render: (schedule: Schedule) => (
                <>
                    {schedule.retentionType === 'monthly'
                        ? 'Monthly'
                        : 'Weekly'}
                </>
            ),
        },

        {
            key: 'enabled' as keyof Schedule,
            label: 'Status',
            render: (schedule: Schedule) => (
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
            ),
        },

        {
            key: 'lastRun' as keyof Schedule,
            label: 'Last Run',
            render: (schedule: Schedule) => (
                <span className="text-muted">
                    {schedule.lastRun
                        ? new Date(
                            schedule.lastRun,
                        ).toLocaleString()
                        : 'Never'}
                </span>
            ),
        },

        {
            label: 'Actions',
            render: (schedule: Schedule) => (
                <div className="flex gap-2">

                    <Button
                        variant="secondary"
                        onClick={() => toggleEnabled(schedule.id)}
                    >
                        {schedule.enabled
                            ? 'Disable'
                            : 'Enable'}
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setSelectedSchedule(schedule);
                                setOpen(true);
                            }}
                        >
                            Edit
                        </Button>
                    </div>

                    <Button
                        variant="danger"
                        onClick={() => {
                            setSelectedSchedule(schedule);
                            setDeleteOpen(true);
                        }}
                    >
                        Delete
                    </Button>

                </div>

            ),
        },
    ];

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


            <DataTable
                columns={columns}
                data={schedules}
                loading={loading}
                search={{
                    value: search,
                    onChange: setSearch,
                }}
                pageSize={{
                    value: limit,
                    options: [5, 10, 20, 50],
                    onChange: (value) => {
                        setLimit(value);
                        setPage(1);
                    },
                }}
                pagination={{
                    page,
                    totalPages,
                    onPageChange: setPage,
                }}
                sort={{
                    field: sort,
                    order,
                    onChange: changeSort,
                }}
            />

            <ScheduleModal
                open={open}
                schedule={selectedSchedule}
                onClose={() => {
                    setOpen(false);
                    setSelectedSchedule(null);
                }}
                onSaved={handleSaved}
            />

            <DeleteScheduleModal
                open={deleteOpen}
                schedule={selectedSchedule}
                onClose={() => {
                    setDeleteOpen(false);
                    setSelectedSchedule(null);
                }}
                onDeleted={async () => {
                    await reload();

                    setDeleteOpen(false);
                    setSelectedSchedule(null);

                    setAlert({
                        variant: 'success',
                        title: 'Schedule deleted',
                        message:
                            'The backup schedule was deleted successfully.',
                    });
                }}
                onError={(message) => {
                    setAlert({
                        variant: 'error',
                        title: 'Unable to delete schedule',
                        message,
                    });
                }}
            />

        </div>
    );
}