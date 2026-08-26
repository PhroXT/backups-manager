"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api";

type DashboardStats = {
    projects: number;
    backups: number;
    storageBytes: number;
};

export function useDashboardStats() {

    const [stats, setStats] =
        useState<DashboardStats | null>(null);

    const [loading, setLoading] =
        useState(true);

    const load = useCallback(async () => {

        setLoading(true);

        try {

            const response =
                await apiFetch<DashboardStats>(
                    "/dashboard/stats",
                );

            setStats(response);

        } finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return {
        stats,
        loading,
        reload: load,
    };
}