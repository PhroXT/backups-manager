"use client";

import { useState } from "react";
import Modal from "@/src/components/ui/Modal";
import Button from "@/src/components/ui/Button";
import { Project } from "@/src/types/project";
import { projectsService } from "@/src/services/projects.service";

type DeleteProjectModalProps = {
    open: boolean;
    project: Project | null;
    onClose: () => void;
    onDeleted: () => void;
    onError: (message: string) => void;
};

export default function DeleteProjectModal({
    open,
    project,
    onClose,
    onDeleted,
    onError,
}: DeleteProjectModalProps) {
    const [loading, setLoading] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const [password, setPassword] = useState("");
    const canDelete = confirmation === "delete" && password.length > 0;

    function handleClose() {
        if (loading) {
            return;
        }

        setConfirmation("");
        setPassword("");
        onClose();
    }

    async function handleDelete() {
        if (!project || !canDelete) {
            return;
        }

        setLoading(true);

        try {
            await projectsService.deleteWithPassword(
                project.id,
                password,
            );

            setConfirmation("");
            setPassword("");
            onDeleted();
            onClose();
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : "Unable to delete project.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Delete project"
        >
            <div className="space-y-5">
                <div>
                    <p className="text-sm text-muted">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">
                            {project?.name}
                        </span>
                        ?
                    </p>

                    <p className="mt-2 text-sm text-muted">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-muted">
                        Type{" "}
                        <span className="font-semibold text-foreground">
                            delete
                        </span>{" "}
                        to confirm.
                    </p>

                    <div className="space-y-2">
                        <p className="text-sm text-muted">
                            Enter your current password to confirm.
                        </p>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Current password"
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            autoComplete="current-password"
                        />
                    </div>

                    <input
                        type="text"
                        value={confirmation}
                        onChange={(event) =>
                            setConfirmation(event.target.value)
                        }
                        placeholder="delete"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        variant="danger"
                        onClick={handleDelete}
                        disabled={!canDelete || loading}
                    >
                        {loading ? "Deleting..." : "Delete project"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}