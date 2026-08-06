"use client";

import { useProjects } from "@/src/hooks/useProjects";
import PageHeader from "@/src/components/ui/PageHeader";
import DataTable from "@/src/components/ui/DataTable";
import Button from "@/src/components/ui/Button";
import Badge from "@/src/components/ui/Badge";
import LoadingState from "@/src/components/ui/LoadingState";
import ProjectModal from "@/src/app/dashboard/projects/components/NewProjectModal";
import { useState } from "react";
import { apiFetch } from "@/src/lib/api";

type Project = {
    id: string;
    name: string;
    type: string;
    host: string;
    port: number;
    database: string;
    username: string;
    enabled: boolean;
};

export default function ProjectsPage() {
    const {
        projects,
        search,
        setSearch,
        page,
        setPage,
        totalPages,
        sort,
        order,
        changeSort,
    } = useProjects();
    const [testing, setTesting] = useState<string | null>(null);
    const [running, setRunning] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    async function testConnection(id: string) {
        setTesting(id);

        try {
            const result = await apiFetch(`/projects/${id}/test-connection`, { method: "POST" });

            if (result) alert("Connection successful");
            else alert(result);
        } catch {
            alert("Connection failed");
        } finally {
            setTesting(null);
        }
    }

    async function runBackup(id: string) {
        setRunning(id);

        try {
            await apiFetch(`/backups/project/${id}`, { method: "POST" });
            alert("Backup started successfully");
        } catch {
            alert("Backup failed");
        } finally {
            setRunning(null);
        }
    }

    const columns = [
        { key: "name" as keyof Project, label: "Name" },
        { key: "type" as keyof Project, label: "Type" },
        {
            label: "Host",
            render: (project: Project) => <>{project.host}:{project.port}</>
        },
        { key: "database" as keyof Project, label: "Database" },
        {
            label: "Status",
            render: (project: Project) =>
                <Badge variant={project.enabled ? "success" : "neutral"}>
                    {project.enabled ? "Active" : "Disabled"}
                </Badge>
        },
        {
            label: "Actions",
            render: (project: Project) =>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        disabled={testing === project.id}
                        onClick={() => testConnection(project.id)}
                    >
                        {testing === project.id ? "Testing..." : "Test Connection"}
                    </Button>

                    <Button
                        variant="secondary"
                        disabled={running === project.id}
                        onClick={() => runBackup(project.id)}
                    >
                        {running === project.id ? "Running..." : "Run Backup"}
                    </Button>
                </div>
        }
    ];

    return <div>
        <div className="flex justify-between items-center mb-6">
            <PageHeader
                title="Projects"
                description="Database connections configured for backups."
            />

            <Button variant="secondary" onClick={() => setOpen(true)}>
                New Project
            </Button>

        </div>

        <DataTable
            columns={columns}
            data={projects}
            search={{
                value: search,
                onChange: (value) => {
                    setPage(1);
                    setSearch(value);
                }
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

        <ProjectModal open={open} onClose={() => setOpen(false)} />
    </div>;
}