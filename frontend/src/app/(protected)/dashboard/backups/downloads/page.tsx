"use client";

import PageHeader from "@/src/components/ui/PageHeader";
import AvailableBackupProject from "./components/AvailableBackupProject";
import { useAvailableBackups } from "@/src/hooks/useAvailableBackups";

export default function DownloadsPage() {

    const {
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
    } = useAvailableBackups();


    return (
        <div>

            <PageHeader
                title="Downloads"
                description="Available database backups."
            />


            {/* Search */}
            <div className="mb-6">

                <input
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search projects..."
                    className="
                        w-full
                        rounded
                        border
                        border-border
                        bg-card
                        px-3
                        py-2
                        text-foreground
                        md:w-80
                    "
                />

            </div>


            {/* Loading */}
            {loadingProjects && (
                <div className="
                    rounded-lg
                    border
                    border-border
                    bg-card
                    p-6
                    text-muted
                ">
                    Loading projects...
                </div>
            )}


            {/* Empty */}
            {!loadingProjects &&
                projects.length === 0 && (
                    <div className="
                        rounded-lg
                        border
                        border-border
                        bg-card
                        p-6
                        text-center
                        text-muted
                    ">
                        No projects found.
                    </div>
                )}


            {/* Projects */}
            {!loadingProjects &&
                projects.length > 0 && (
                    <div className="space-y-3">

                        {projects.map((project) => (
                            <AvailableBackupProject
                                key={project.id}
                                project={project}
                                expanded={
                                    expandedProject === project.id
                                }
                                backups={
                                    projectBackups[project.id]
                                }
                                downloading={downloading}
                                onToggle={() =>
                                    toggleProject(project.id)
                                }
                                onBackupPageChange={(page) =>
                                    changeBackupPage(
                                        project.id,
                                        page,
                                    )
                                }
                                onDownload={downloadBackup}
                            />
                        ))}

                    </div>
                )}


            {/* Project pagination */}
            {!loadingProjects &&
                projectPagination.totalPages > 1 && (
                    <div className="
                        flex
                        items-center
                        justify-between
                        pt-6
                    ">

                        <button
                            disabled={
                                projectPagination.page === 1
                            }
                            onClick={() =>
                                changeProjectPage(
                                    projectPagination.page - 1
                                )
                            }
                            className="
                                rounded
                                border
                                border-border
                                px-3
                                py-1
                                text-sm
                                disabled:opacity-50
                            "
                        >
                            Previous
                        </button>

                        <span className="text-sm text-muted">
                            Page {projectPagination.page} of{" "}
                            {projectPagination.totalPages}
                        </span>

                        <button
                            disabled={
                                projectPagination.page ===
                                projectPagination.totalPages
                            }
                            onClick={() =>
                                changeProjectPage(
                                    projectPagination.page + 1
                                )
                            }
                            className="
                                rounded
                                border
                                border-border
                                px-3
                                py-1
                                text-sm
                                disabled:opacity-50
                            "
                        >
                            Next
                        </button>

                    </div>
                )}

        </div>
    );
}