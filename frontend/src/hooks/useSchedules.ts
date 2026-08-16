'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/src/lib/api';

export type Schedule = {
    id: string;
    projectId: string;
    cron: string;
    enabled: boolean;
    lastRun: string | null;
    retentionType: string;
    project: {
        id: string;
        name: string;
    };
};

export function useSchedules() {

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {

        try {

            const data = await apiFetch<Schedule[]>(
                '/schedules',
            );

            setSchedules(data);

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {
        load();
    }, []);

    return {
        schedules,
        loading,
        reload: load,
    };
}