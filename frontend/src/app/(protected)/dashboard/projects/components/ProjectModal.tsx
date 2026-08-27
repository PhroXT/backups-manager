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
    sshEnabled: boolean;
    sshHost: string;
    sshPort: number;
    sshUsername: string;
    sshPassword: string;
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
    sshEnabled: false,
    sshHost: "",
    sshPort: 22,
    sshUsername: "",
    sshPassword: "",
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
                sshEnabled: project.sshEnabled ?? false,
                sshHost: project.sshHost ?? "",
                sshPort: project.sshPort ?? 22,
                sshUsername: project.sshUsername ?? "",
                sshPassword: "",
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
            [name]:
                name === "port" || name === "sshPort"
                    ? Number(value)
                    : value,
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
                ...(form.sshPassword
                    ? { sshPassword: form.sshPassword }
                    : {}),
                sshEnabled: form.sshEnabled,
                sshHost: form.sshEnabled ? form.sshHost : undefined,
                sshPort: form.sshEnabled ? form.sshPort : undefined,
                sshUsername: form.sshEnabled
                    ? form.sshUsername
                    : undefined,
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

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="sshEnabled"
                        checked={form.sshEnabled ?? false}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                sshEnabled: event.target.checked,
                            }))
                        }
                    />

                    <span className="text-sm">
                        Use SSH Tunnel
                    </span>
                </label>

                {form.sshEnabled && (
                    <div className="space-y-4 rounded border p-4">
                        <div className="text-sm font-medium">
                            SSH Configuration
                        </div>

                        <input
                            name="sshHost"
                            placeholder="SSH Host"
                            value={form.sshHost}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />

                        <input
                            name="sshPort"
                            type="number"
                            placeholder="SSH Port"
                            value={form.sshPort}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />

                        <input
                            name="sshUsername"
                            placeholder="SSH Username"
                            value={form.sshUsername}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />

                        <input
                            name="sshPassword"
                            type="password"
                            placeholder={
                                isEditing
                                    ? "Leave blank to keep current password"
                                    : "SSH Password"
                            }
                            value={form.sshPassword}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required={!isEditing}
                        />
                    </div>
                )}


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