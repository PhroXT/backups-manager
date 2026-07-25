'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/src/lib/api';


export type Backup = {
    id: string;
    filename: string | null;
    status: string;
    size: string | null;
    createdAt: string;
    project: {
        id: string;
        name: string;
    };
};


export function useBackups() {

    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);


    async function load() {

        try {

            const data = await apiFetch<Backup[]>(
                '/backups',
            );

            setBackups(data);

        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {
        load();
    }, []);


    return {
        backups,
        loading,
        reload: load,
    };
}