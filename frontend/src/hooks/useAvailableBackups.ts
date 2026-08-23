import { useCallback, useEffect, useState } from "react";
import { backupsService } from "@/src/services/backups.service";
import {
    AvailableBackup,
    AvailableBackupProject,
} from "@/src/types/backup";

type ProjectPagination = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

type ProjectBackupsState = {
    data: AvailableBackup[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    loading: boolean;
    loaded: boolean;
};

export function useAvailableBackups() {

    const [projects, setProjects] = useState<
        AvailableBackupProject[]
    >([]);

    const [projectPagination, setProjectPagination] =
        useState<ProjectPagination>({
            page: 1,
            pageSize: 25,
            total: 0,
            totalPages: 0,
        });

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [loadingProjects, setLoadingProjects] =
        useState(true);

    const [expandedProject, setExpandedProject] =
        useState<string | null>(null);

    const [projectBackups, setProjectBackups] =
        useState<Record<string, ProjectBackupsState>>({});

    const [downloading, setDownloading] =
        useState<string | null>(null);


    /*
     * Debounce del buscador
     */
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search);
        }, 350);

        return () => {
            clearTimeout(timeout);
        };
    }, [search]);


    /*
     * Carga de proyectos
     */
    const loadProjects = useCallback(
        async (
            page: number = 1,
            currentSearch: string = debouncedSearch,
        ) => {

            setLoadingProjects(true);

            try {
                const response =
                    await backupsService.getAvailableProjects({
                        page,
                        pageSize: projectPagination.pageSize,
                        search: currentSearch,
                    });

                setProjects(response.data);

                setProjectPagination({
                    page: response.page,
                    pageSize: response.pageSize,
                    total: response.total,
                    totalPages: response.totalPages,
                });

            } finally {
                setLoadingProjects(false);
            }
        },
        [
            projectPagination.pageSize,
            debouncedSearch,
        ],
    );


    /*
     * Cuando termina el debounce,
     * volvemos a la página 1.
     */
    useEffect(() => {
        loadProjects(1, debouncedSearch);
    }, [
        debouncedSearch,
        loadProjects,
    ]);


    /*
     * Carga de backups de un proyecto
     */
    const loadProjectBackups = useCallback(
        async (
            projectId: string,
            page = 1,
        ) => {

            const previous =
                projectBackups[projectId];

            setProjectBackups((current) => ({
                ...current,
                [projectId]: {
                    data: previous?.data ?? [],
                    page: previous?.page ?? 1,
                    pageSize: previous?.pageSize ?? 10,
                    total: previous?.total ?? 0,
                    totalPages: previous?.totalPages ?? 0,
                    loading: true,
                    loaded: previous?.loaded ?? false,
                },
            }));

            try {

                const response =
                    await backupsService.getAvailableBackups(
                        projectId,
                        {
                            page,
                            pageSize:
                                previous?.pageSize ?? 10,
                        },
                    );

                setProjectBackups((current) => ({
                    ...current,
                    [projectId]: {
                        data: response.data,
                        page: response.page,
                        pageSize: response.pageSize,
                        total: response.total,
                        totalPages: response.totalPages,
                        loading: false,
                        loaded: true,
                    },
                }));

            } catch (error) {

                setProjectBackups((current) => ({
                    ...current,
                    [projectId]: {
                        data: [],
                        page: 1,
                        pageSize:
                            previous?.pageSize ?? 10,
                        total: 0,
                        totalPages: 0,
                        loading: false,
                        loaded: false,
                    },
                }));

                throw error;
            }
        },
        [projectBackups],
    );


    /*
     * Abrir / cerrar proyecto
     */
    const toggleProject = useCallback(
        async (projectId: string) => {

            if (expandedProject === projectId) {
                setExpandedProject(null);
                return;
            }

            setExpandedProject(projectId);

            const state =
                projectBackups[projectId];

            if (!state?.loaded) {
                await loadProjectBackups(
                    projectId,
                    1,
                );
            }
        },
        [
            expandedProject,
            projectBackups,
            loadProjectBackups,
        ],
    );


    /*
     * Cambiar página de proyectos
     */
    const changeProjectPage = useCallback(
        async (page: number) => {
            await loadProjects(
                page,
                debouncedSearch,
            );
        },
        [
            loadProjects,
            debouncedSearch,
        ],
    );


    /*
     * Cambiar página de backups
     */
    const changeBackupPage = useCallback(
        async (
            projectId: string,
            page: number,
        ) => {
            await loadProjectBackups(
                projectId,
                page,
            );
        },
        [loadProjectBackups],
    );


    /*
     * Descargar backup
     */
    const downloadBackup = useCallback(
        async (backup: AvailableBackup) => {

            setDownloading(backup.id);

            try {

                const response =
                    await backupsService.getDownloadUrl(
                        backup.id,
                    );

                window.location.href =
                    response.url;

            } finally {
                setDownloading(null);
            }
        },
        [],
    );


    return {
        projects,

        projectPagination,
        loadingProjects,

        search,
        setSearch,

        expandedProject,
        toggleProject,

        projectBackups,
        changeProjectPage,
        changeBackupPage,

        downloading,
        downloadBackup,

        reload: () =>
            loadProjects(
                projectPagination.page,
                debouncedSearch,
            ),
    };
}