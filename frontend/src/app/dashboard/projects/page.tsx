"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import Link from "next/link";

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

    async function runBackup(id: string) {

        setRunning(id);

        try {

            const result = await apiFetch(
                `/backups/project/${id}`,
                {
                    method: "POST",
                }
            );


            alert("Backup started successfully");


        } catch {

            alert("Backup failed");

        } finally {

            setRunning(null);

        }

    }

    useEffect(() => {
        apiFetch<Project[]>("/projects")
            .then(setProjects)
            .catch(() => setError("Could not load projects"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p className="text-gray-600">Loading projects...</p>;
    }

    if (error) {
        return <p className="text-red-600">{error}</p>;
    }

    async function testConnection(id: string) {

        setTesting(id);

        try {

            const result = await apiFetch<Project[]>(
                `/projects/${id}/test-connection`,
                {
                    method: "POST",
                }
            );


            if (result) {
                alert("Connection successful");
            } else {
                alert(result);
            }


        } catch {

            alert("Connection failed");

        } finally {

            setTesting(null);

        }

    }

    return (
        <div>

            <div className="flex justify-between items-center mb-6">

                <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Projects
                    </h2>

                    <p className="text-gray-600 mt-1">
                        Database connections configured for backups.
                    </p>
                </div>


                <Link
                    href="/dashboard/projects/new"
                    className="
    bg-gray-900
    text-white
    px-4
    py-2
    rounded
    hover:bg-gray-700
  "
                >
                    New Project
                </Link>

            </div>


            <div className="bg-white rounded shadow overflow-x-auto">

                <table className="w-full">

                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left text-gray-700">
                                Name
                            </th>

                            <th className="p-3 text-left text-gray-700">
                                Type
                            </th>

                            <th className="p-3 text-left text-gray-700">
                                Host
                            </th>

                            <th className="p-3 text-left text-gray-700">
                                Database
                            </th>

                            <th className="p-3 text-left text-gray-700">
                                Status
                            </th>
                            <th className="p-3 text-left text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>


                    <tbody>

                        {projects.map((project) => (

                            <tr
                                key={project.id}
                                className="border-t border-gray-200"
                            >

                                <td className="p-3 text-gray-900">
                                    {project.name}
                                </td>

                                <td className="p-3 text-gray-700">
                                    {project.type}
                                </td>

                                <td className="p-3 text-gray-700">
                                    {project.host}:{project.port}
                                </td>

                                <td className="p-3 text-gray-700">
                                    {project.database}
                                </td>

                                <td className="p-3">

                                    <span
                                        className={`
                      px-2 py-1 rounded text-sm
                      ${project.enabled
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-200 text-gray-700"
                                            }
                    `}
                                    >
                                        {project.enabled ? "Active" : "Disabled"}
                                    </span>

                                </td>
                                <td className="p-3">

                                    <button
                                        onClick={() => testConnection(project.id)}
                                        disabled={testing === project.id}
                                        className="
      border
      border-gray-300
      px-3
      py-1
      rounded
      text-sm
      hover:bg-gray-100
      disabled:opacity-50
    "
                                    >
                                        {
                                            testing === project.id
                                                ? "Testing..."
                                                : "Test Connection"
                                        }

                                    </button>
                                    <button
                                        onClick={() => runBackup(project.id)}
                                        disabled={running === project.id}
                                        className="
        border
        border-gray-300
        px-3
        py-1
        rounded
        text-sm
        hover:bg-gray-100
        disabled:opacity-50
    "
                                    >
                                        {
                                            running === project.id
                                                ? "Running..."
                                                : "Run Backup"
                                        }

                                    </button>
                                </td>
                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}