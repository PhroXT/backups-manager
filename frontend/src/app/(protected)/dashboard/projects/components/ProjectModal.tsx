"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import Modal from "@/src/components/ui/Modal";
import Button from "@/src/components/ui/Button";
import { Project } from "@/src/types/project";

type ProjectModalProps = {
    open: boolean;
    project?: Project | null;
    onClose: () => void;
    onSaved?: () => void;
};

type ProjectForm = {
    name: string;
    type: string;
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    sslMode: string;
    enabled: boolean;
};

const emptyForm: ProjectForm = {
    name: "",
    type: "postgres",
    host: "",
    port: 5432,
    database: "",
    username: "",
    password: "",
    sslMode: "prefer",
    enabled: true,
};

export default function ProjectModal({
    open,
    project,
    onClose,
    onSaved,
}: ProjectModalProps) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<ProjectForm>(emptyForm);

    const isEditing = !!project;

    useEffect(() => {
        if (!open) {
            return;
        }

        if (project) {
            setForm({
                name: project.name,
                type: project.type,
                host: project.host,
                port: project.port,
                database: project.database,
                username: project.username,
                password: "",
                sslMode: project.sslMode,
                enabled: project.enabled,
            });
        } else {
            setForm(emptyForm);
        }
    }, [open, project]);

    function handleChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: name === "port" ? Number(value) : value,
        }));
    }

    function handleCheckboxChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        setForm((current) => ({
            ...current,
            enabled: event.target.checked,
        }));
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setLoading(true);

        try {
            const data = {
                name: form.name,
                type: form.type,
                host: form.host,
                port: form.port,
                database: form.database,
                username: form.username,
                sslMode: form.sslMode,
                enabled: form.enabled,
                ...(form.password
                    ? { password: form.password }
                    : {}),
            };

            if (isEditing && project) {
                await apiFetch(`/projects/${project.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });
            } else {
                await apiFetch("/projects", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...data,
                        password: form.password,
                    }),
                });
            }

            onSaved?.();
            onClose();
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Project" : "New Project"}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    name="host"
                    placeholder="Host"
                    value={form.host}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    name="port"
                    type="number"
                    placeholder="Port"
                    value={form.port}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    name="database"
                    placeholder="Database"
                    value={form.database}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />

                <input
                    name="password"
                    placeholder={
                        isEditing
                            ? "Leave blank to keep current password"
                            : "Password"
                    }
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required={!isEditing}
                />

                <select
                    name="sslMode"
                    value={form.sslMode}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                >
                    <option value="disable">Disable</option>
                    <option value="allow">Allow</option>
                    <option value="prefer">Prefer</option>
                    <option value="require">Require</option>
                    <option value="verify-ca">Verify CA</option>
                    <option value="verify-full">Verify Full</option>
                </select>

                {isEditing && (
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.enabled}
                            onChange={handleCheckboxChange}
                        />

                        <span className="text-sm">
                            Enabled
                        </span>
                    </label>
                )}

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button type="submit" disabled={loading}>
                        {loading
                            ? "Saving..."
                            : isEditing
                                ? "Save Changes"
                                : "Save Project"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}