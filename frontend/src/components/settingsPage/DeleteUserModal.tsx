"use client";

import { useState } from "react";
import Modal from "@/src/components/ui/Modal";
import Button from "@/src/components/ui/Button";

type User = {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
};

type DeleteUserModalProps = {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onDeleted: () => void;
    onError: (message: string) => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DeleteUserModal({
    open,
    user,
    onClose,
    onDeleted,
    onError,
}: DeleteUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const canDelete = confirmation === "delete";

    async function handleDelete() {
        if (!user) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/users/${user.id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                },
            );

            const data = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                const message =
                    Array.isArray(data?.message)
                        ? data.message.join(", ")
                        : data?.message ||
                        "Unable to delete user.";

                throw new Error(message);
            }

            setConfirmation("");
            onDeleted();
            onClose();

        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : "Unable to delete user.",
            );
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        if (loading) {
            return;
        }

        setConfirmation("");
        onClose();
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Delete user"
        >
            <div className="space-y-5">
                <div>
                    <p className="text-sm text-muted">
                        Are you sure you want to delete
                        {" "}
                        <span className="font-semibold text-foreground">
                            {user?.username}
                        </span>
                        ?
                    </p>

                    <p className="mt-2 text-sm text-muted">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-muted">
                        Type <span className="font-semibold text-foreground">delete</span>{" "}
                        to confirm.
                    </p>

                    <input
                        type="text"
                        value={confirmation}
                        onChange={(event) => setConfirmation(event.target.value)}
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
                        {loading ? "Deleting..." : "Delete user"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}