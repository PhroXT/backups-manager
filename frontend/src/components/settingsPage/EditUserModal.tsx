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

type NotificationSettings = {
    telegramEnabled: boolean;
    telegramChatId: string | null;
    reportEnabled: boolean;
    reportTime: string | null;
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

    const [telegramEnabled, setTelegramEnabled] = useState(false);
    const [telegramChatId, setTelegramChatId] = useState("");
    const [reportEnabled, setReportEnabled] = useState(false);
    const [reportTime, setReportTime] = useState("08:00");

    const [loading, setLoading] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(false);

    useEffect(() => {
        if (!user || !open) {
            return;
        }

        setUsername(user.username);
        setEmail(user.email);

        loadNotificationSettings(user.id);
    }, [user, open]);

    async function loadNotificationSettings(userId: string) {
        setLoadingSettings(true);

        try {
            const response = await fetch(
                `${API_URL}/notifications/settings/${userId}`,
                {
                    credentials: "include",
                },
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load notification settings.",
                );
            }

            const data: NotificationSettings | null =
                await response.json();

            if (!data) {
                setTelegramEnabled(false);
                setTelegramChatId("");
                setReportEnabled(false);
                setReportTime("08:00");
                return;
            }

            setTelegramEnabled(data.telegramEnabled);
            setTelegramChatId(data.telegramChatId ?? "");
            setReportEnabled(data.reportEnabled);
            setReportTime(data.reportTime ?? "08:00");
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : "Unable to load notification settings.",
            );
        } finally {
            setLoadingSettings(false);
        }
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!user) {
            return;
        }

        if (telegramEnabled && !telegramChatId.trim()) {
            onError("Telegram Chat ID is required.");
            return;
        }

        if (reportEnabled && !reportTime) {
            onError("Report time is required.");
            return;
        }

        setLoading(true);

        try {
            // Update user
            const userResponse = await fetch(
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

            const userData =
                await userResponse.json().catch(() => null);

            if (!userResponse.ok) {
                const message =
                    Array.isArray(userData?.message)
                        ? userData.message.join(", ")
                        : userData?.message ||
                        "Unable to update user.";

                throw new Error(message);
            }

            // Update notification settings
            const notificationResponse = await fetch(
                `${API_URL}/notifications/settings/${user.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        telegramEnabled,
                        telegramChatId: telegramEnabled
                            ? telegramChatId.trim()
                            : null,
                        reportEnabled,
                        reportTime: reportEnabled
                            ? reportTime
                            : null,
                    }),
                },
            );

            const notificationData =
                await notificationResponse
                    .json()
                    .catch(() => null);

            if (!notificationResponse.ok) {
                const message =
                    Array.isArray(notificationData?.message)
                        ? notificationData.message.join(", ")
                        : notificationData?.message ||
                        "Unable to update notification settings.";

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
                className="space-y-6"
            >
                {/* User information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold">
                        User information
                    </h3>

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
                </div>

                {/* Telegram */}
                <div className="space-y-4 border-t border-border pt-6">
                    <div>
                        <h3 className="text-sm font-semibold">
                            Notifications
                        </h3>

                        <p className="mt-1 text-xs text-muted">
                            Configure Telegram notifications and
                            daily backup reports.
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label
                                htmlFor="telegram-enabled"
                                className="text-sm font-medium"
                            >
                                Telegram notifications
                            </label>

                            <p className="text-xs text-muted">
                                Send backup reports through Telegram.
                            </p>
                        </div>

                        <input
                            id="telegram-enabled"
                            type="checkbox"
                            checked={telegramEnabled}
                            onChange={(event) =>
                                setTelegramEnabled(
                                    event.target.checked,
                                )
                            }
                            disabled={loadingSettings || loading}
                            className="h-4 w-4"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="telegram-chat-id"
                            className="mb-1 block text-sm font-medium"
                        >
                            Telegram Chat ID
                        </label>

                        <input
                            id="telegram-chat-id"
                            type="text"
                            value={telegramChatId}
                            onChange={(event) =>
                                setTelegramChatId(event.target.value)
                            }
                            disabled={
                                !telegramEnabled ||
                                loadingSettings ||
                                loading
                            }
                            placeholder="-1001234567890"
                            className="w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:ring-2 focus:ring-foreground/20"
                        />
                    </div>

                    {/* Report */}
                    <div className="flex items-center justify-between">
                        <div>
                            <label
                                htmlFor="report-enabled"
                                className="text-sm font-medium"
                            >
                                Daily backup report
                            </label>

                            <p className="text-xs text-muted">
                                Send a summary of the previous day's
                                scheduled backups.
                            </p>
                        </div>

                        <input
                            id="report-enabled"
                            type="checkbox"
                            checked={reportEnabled}
                            onChange={(event) =>
                                setReportEnabled(
                                    event.target.checked,
                                )
                            }
                            disabled={loadingSettings || loading}
                            className="h-4 w-4"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="report-time"
                            className="mb-1 block text-sm font-medium"
                        >
                            Report time
                        </label>

                        <input
                            id="report-time"
                            type="time"
                            value={reportTime}
                            onChange={(event) =>
                                setReportTime(event.target.value)
                            }
                            disabled={
                                !reportEnabled ||
                                loadingSettings ||
                                loading
                            }
                            className="w-full rounded-md border border-border bg-card px-3 py-2 text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:ring-2 focus:ring-foreground/20"
                        />
                    </div>
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
                        disabled={loading || loadingSettings}
                    >
                        {loading
                            ? "Saving..."
                            : "Save changes"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}