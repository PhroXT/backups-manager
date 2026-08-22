"use client";

import { FormEvent, useEffect, useState } from "react";
import Modal from "@/src/components/ui/Modal";
import Button from "@/src/components/ui/Button";

type User = {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
};

type EditUserModalProps = {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onUpdated: () => void;
    onError: (message: string) => void;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditUserModal({
    open,
    user,
    onClose,
    onUpdated,
    onError,
}: EditUserModalProps) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            setUsername("");
            setEmail("");
            return;
        }

        setUsername(user.username);
        setEmail(user.email);
    }, [user]);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!user) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/users/${user.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        username,
                        email,
                    }),
                },
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    Array.isArray(data?.message)
                        ? data.message.join(", ")
                        : data?.message ||
                        "Unable to update user.";

                throw new Error(message);
            }

            onUpdated();
            onClose();
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : "Unable to update user.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                if (!loading) {
                    onClose();
                }
            }}
            title="Edit user"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div>
                    <label
                        htmlFor="edit-username"
                        className="mb-1 block text-sm font-medium"
                    >
                        Username
                    </label>

                    <input
                        id="edit-username"
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
                        htmlFor="edit-email"
                        className="mb-1 block text-sm font-medium"
                    >
                        Email
                    </label>

                    <input
                        id="edit-email"
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

                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}