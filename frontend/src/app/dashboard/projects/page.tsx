"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import PageHeader from "@/src/components/ui/PageHeader";
import DataTable from "@/src/components/ui/DataTable";
import Button from "@/src/components/ui/Button";
import Badge from "@/src/components/ui/Badge";
import LoadingState from "@/src/components/ui/LoadingState";
import ProjectModal from "@/src/app/dashboard/projects/components/NewProjectModal";
import { Paginated } from "@/src/types/pagination";

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
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [testing, setTesting] = useState<string | null>(null);
    const [running, setRunning] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        apiFetch<Paginated<Project>>("/projects?page=1&limit=10")
            .then(result => setProjects(result.items))
            .catch(() => setError("Could not load projects"))
            .finally(() => setLoading(false));
    }, []);

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

    if (loading) return <LoadingState message="Loading projects..." />;
    if (error) return <p className="text-red-600">{error}</p>;

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

        <DataTable columns={columns} data={projects} />

        <ProjectModal open={open} onClose={() => setOpen(false)} />
    </div>;
}