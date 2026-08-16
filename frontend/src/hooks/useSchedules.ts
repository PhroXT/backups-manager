'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/src/lib/api';
import { useDebounce } from "@/src/hooks/useDebounce";

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
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [sort, setSort] = useState("createdAt");
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [limit, setLimit] = useState(10);

    const debouncedSearch = useDebounce(search);

    function changeSort(field: string) {

        if (sort === field) {
            setOrder(
                order === "asc"
                    ? "desc"
                    : "asc",
            );
        } else {
            setSort(field);
            setOrder("asc");
        }

        setPage(1);
    }

    async function load() {

        try {

            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                search: debouncedSearch,
                sort,
                order,
            });

            const response = await apiFetch<{
                items: Schedule[];
                totalPages: number;
            }>(
                `/schedules?${params.toString()}`,
            );

            setSchedules(response.items);
            setTotalPages(response.totalPages);

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {
        load();
    }, [page, debouncedSearch, sort, order]);

    return {
        schedules,
        loading,
        reload: load,

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
    };
}