"use client";

import { FormEvent, useState } from "react";
import Modal from "@/src/components/ui/Modal";
import Button from "@/src/components/ui/Button";

type CreateUserModalProps = {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
    onError: (message: string) => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateUserModal({
    open,
    onClose,
    onCreated,
    onError,
}: CreateUserModalProps) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    function resetForm() {
        setUsername("");
        setEmail("");
        setPassword("");
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

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    Array.isArray(data?.message)
                        ? data.message.join(", ")
                        : data?.message ||
                        "Unable to create user.";

                throw new Error(message);
            }

            resetForm();
            onCreated();
            onClose();
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : "Unable to create user.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Create user"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div>
                    <label
                        htmlFor="create-username"
                        className="mb-1 block text-sm font-medium"
                    >
                        Username
                    </label>

                    <input
                        id="create-username"
                        type="text"
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
                        required
                        minLength={3}
                        autoComplete="username"
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                </div>

                <div>
                    <label
                        htmlFor="create-email"
                        className="mb-1 block text-sm font-medium"
                    >
                        Email
                    </label>

                    <input
                        id="create-email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                        autoComplete="email"
                        className="w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                </div>

                <div>
                    <label
                        htmlFor="create-password"
                        className="mb-1 block text-sm font-medium"
                    >
                        Password
                    </label>

                    <input
                        id="create-password"
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
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create user"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}