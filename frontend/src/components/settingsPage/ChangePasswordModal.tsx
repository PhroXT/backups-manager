"use client";

import { FormEvent, useState } from "react";
import Modal from "@/src/components/ui/Modal";
import Button from "@/src/components/ui/Button";

type User = {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
};

type ChangePasswordModalProps = {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onUpdated: () => void;
    onError: (message: string) => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ChangePasswordModal({
    open,
    user,
    onClose,
    onUpdated,
    onError,
}: ChangePasswordModalProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] = useState(false);

    function resetForm() {
        setPassword("");
        setConfirmPassword("");
    }

    function handleClose() {
        if (loading) return;

        resetForm();
        onClose();
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!user) {
            return;
        }

        if (password !== confirmPassword) {
            onError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/users/${user.id}/password`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        password,
                    }),
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
                        "Unable to change password.";

                throw new Error(message);
            }

            resetForm();
            onUpdated();
            onClose();
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : "Unable to change password.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Change password"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div className="rounded-md bg-foreground/5 p-3 text-sm">
                    Changing password for{" "}
                    <span className="font-medium">
                        {user?.username}
                    </span>
                </div>

                <div>
                    <label
                        htmlFor="change-password"
                        className="mb-1 block text-sm font-medium"
                    >
                        New password
                    </label>

                    <input
                        id="change-password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-foreground/20"
                    />

                    <p className="mt-1 text-xs text-muted">
                        Minimum 8 characters.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="confirm-password"
                        className="mb-1 block text-sm font-medium"
                    >
                        Confirm new password
                    </label>

                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(event.target.value)
                        }
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={
                            loading ||
                            !password ||
                            !confirmPassword
                        }
                    >
                        {loading
                            ? "Changing..."
                            : "Change password"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}