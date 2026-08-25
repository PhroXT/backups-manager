"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "./useDebounce";
import { CrudService } from "@/src/types/crud";
import { QueryParams } from "@/src/types/api";

type Options<T> = {
    service: CrudService<T>;
    defaultSort?: string;
    defaultLimit?: number;
};

export function useDataTable<T>({
    service,
    defaultSort = "name",
    defaultLimit = 10,
}: Options<T>) {

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(defaultLimit);

    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(1);

    const [sort, setSort] = useState(defaultSort);
    const [order, setOrder] = useState<"asc" | "desc">("desc");

    const debouncedSearch = useDebounce(search);

    async function load() {
        try {
            setLoading(true);

            const params: QueryParams = {
                page,
                limit,
                search: debouncedSearch,
                sort,
                order,
            };

            const response = await service.getAll(params);

            setData(response.items ?? []);
            setTotalPages(response.totalPages);

        } finally {
            setLoading(false);
        }
    }

    function changeSort(field: string) {

        if (sort === field) {
            setOrder(order === "asc" ? "desc" : "asc");
        } else {
            setSort(field);
            setOrder("asc");
        }

        setPage(1);
    }

    function changePageSize(value: number) {
        setPage(1);
        setLimit(value);
    }

    function changeSearch(value: string) {
        setPage(1);
        setSearch(value);
    }

    useEffect(() => {
        load();
    }, [
        page,
        limit,
        debouncedSearch,
        sort,
        order,
    ]);

    return {

        data,
        loading,

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

        reload: load,

        // Helpers para DataTable
        searchProps: {
            value: search,
            onChange: changeSearch,
        },

        pageSizeProps: {
            value: limit,
            options: [10, 25, 50, 100],
            onChange: changePageSize,
        },

        paginationProps: {
            page,
            totalPages,
            onPageChange: setPage,
        },

        sortProps: {
            field: sort,
            order,
            onChange: changeSort,
        },
    };
}