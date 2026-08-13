'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/src/lib/api';


export type ActiveBackup = {
    id: string;
    status: string;

    startedAt: string | null;
    lastActivityAt: string | null;
    lastActivitySize: string | null;

    createdAt: string;

    project: {
        id: string;
        name: string;
    };
};


export function useActiveBackups() {

    const [backups, setBackups] = useState<ActiveBackup[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {

        try {

            const data = await apiFetch<ActiveBackup[]>(
                '/backups/active',
            );

            setBackups(data);

        } finally {

            setLoading(false);

        }

    }

    async function cancelBackup(id: string) {

        await apiFetch(
            `/backups/${id}/cancel`,
            {
                method: 'POST',
            },
        );

        await load();
    }

    useEffect(() => {

        load();

        const interval = setInterval(load, 5000);

        return () => clearInterval(interval);

    }, []);


    return {
        backups,
        loading,
        reload: load,
        cancelBackup,
    };
}