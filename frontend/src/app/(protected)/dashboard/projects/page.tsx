"use client";

import { useDataTable } from "@/src/hooks/useDataTable";
import { projectsService } from "@/src/services/projects.service";
import PageHeader from "@/src/components/ui/PageHeader";
import DataTable from "@/src/components/ui/DataTable";
import Button from "@/src/components/ui/Button";
import Badge from "@/src/components/ui/Badge";
import Alert from "@/src/components/ui/Alert";
import ProjectModal from "@/src/app/(protected)/dashboard/projects/components/NewProjectModal";
import { useState } from "react";
import { Project } from "@/src/types/project";
import { AlertState } from "@/src/types/Alert.type";


export default function ProjectsPage() {
    const table = useDataTable({
        service: projectsService,
        defaultSort: "name",
    });
    const [testing, setTesting] = useState<string | null>(null);
    const [running, setRunning] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [alert, setAlert] = useState<AlertState>(null);

    async function testConnection(id: string) {
        setTesting(id);

        try {
            const result = await projectsService.testConnection(id);

            setAlert({
                variant: result ? "success" : "error",
                title: result ? "Conexión correcta" : "Conexión fallida",
                message: result
                    ? "La conexión ha sido probada correctamente."
                    : "No se ha podido establecer la conexión.",
            });
        } catch {
            setAlert({
                variant: "error",
                title: "Error",
                message: "No se pudo probar la conexión.",
            });
        } finally {
            setTesting(null);
        }
    }

    async function runBackup(id: string) {
        setRunning(id);

        try {
            await projectsService.runBackup(id);

            setAlert({
                variant: "success",
                title: "Backup iniciado",
                message: "El backup se ha iniciado correctamente.",
            });
        } catch {
            setAlert({
                variant: "error",
                title: "Error",
                message: "No se pudo iniciar el backup.",
            });
        } finally {
            setRunning(null);
        }
    }

    const columns = [
        { key: "name" as keyof Project, label: "Name" },
        { key: "type" as keyof Project, label: "Type" },
        {
            label: "Host",
            render: (project: Project) => <>{project.host}:{project.port}</>,
        },
        { key: "database" as keyof Project, label: "Database" },
        {
            label: "Status",
            render: (project: Project) => (
                <Badge variant={project.enabled ? "success" : "neutral"}>
                    {project.enabled ? "Active" : "Disabled"}
                </Badge>
            ),
        },
        {
            label: "Actions",
            render: (project: Project) => (
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
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <PageHeader
                    title="Projects"
                    description="Database connections configured for backups."
                />

                <Button variant="secondary" onClick={() => setOpen(true)}>
                    New Project
                </Button>
            </div>

            {alert && (
                <Alert
                    variant={alert.variant}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                    durationMs={2000}
                />
            )}

            <DataTable
                columns={columns}
                data={table.data}
                search={table.searchProps}
                pageSize={table.pageSizeProps}
                pagination={table.paginationProps}
                sort={table.sortProps}
            />

            <ProjectModal open={open} onClose={() => setOpen(false)} />
        </div>
    );
}