"use client";

import { useEffect, useState } from "react";
import { projectsService } from "@/src/services/projects.service";
import { Project } from "@/src/types/project";
import { useDebounce } from "@/src/hooks/useDebounce";

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [sort, setSort] = useState("name");
    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const debouncedSearch = useDebounce(search);
    const [limit, setLimit] = useState(10);

    async function load() {
        setLoading(true);

        const response = await projectsService.getAll({
            page,
            limit: limit,
            search: debouncedSearch,
            sort,
            order,
        });

        setProjects(response.items);
        setTotalPages(response.totalPages);

        setLoading(false);
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

    useEffect(() => {
        load();
    }, [page, limit, debouncedSearch, sort, order]);

    return {
        projects,
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
    };
}