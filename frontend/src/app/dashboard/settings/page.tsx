'use client'; "use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/src/components/ui/Card";
import DataTable from "@/src/components/ui/DataTable";
import Button from "@/src/components/ui/Button";
import Alert from "@/src/components/ui/Alert";
import PageHeader from "@/src/components/ui/PageHeader";

type User = {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SettingsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState("username");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const [alert, setAlert] = useState<{
        variant: "success" | "error" | "info" | "warning";
        title?: string;
        message?: string;
    } | null>(null);

    async function loadUsers() {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/users`, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to load users");
            }

            const data = await response.json();

            setUsers(data);
        } catch {
            setAlert({
                variant: "error",
                title: "Error",
                message: "Unable to load users.",
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.toLowerCase().trim();

        const filtered = users.filter((user) => {
            if (!normalizedSearch) {
                return true;
            }

            return (
                user.username
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                user.email
                    .toLowerCase()
                    .includes(normalizedSearch)
            );
        });

        return [...filtered].sort((a, b) => {
            const aValue = String(
                a[sortField as keyof User] ?? "",
            ).toLowerCase();

            const bValue = String(
                b[sortField as keyof User] ?? "",
            ).toLowerCase();

            const comparison = aValue.localeCompare(bValue);

            return sortOrder === "asc"
                ? comparison
                : -comparison;
        });
    }, [users, search, sortField, sortOrder]);

    const columns = [
        {
            key: "username" as keyof User,
            label: "Username",
        },
        {
            key: "email" as keyof User,
            label: "Email",
        },
        {
            key: "createdAt" as keyof User,
            label: "Created",
            render: (user: User) =>
                new Date(user.createdAt).toLocaleDateString(),
        },
        {
            label: "Actions",
            render: (user: User) => (
                <Button
                    variant="secondary"
                    onClick={() => {
                        console.log("Edit user:", user);
                    }}
                >
                    Edit
                </Button>
            ),
        },
    ];

    function handleSort(field: string) {
        if (sortField === field) {
            setSortOrder((current) =>
                current === "asc" ? "desc" : "asc",
            );
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    }

    return (
        <main className="space-y-6">
            {alert && (
                <Alert
                    variant={alert.variant}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <PageHeader
                title="Settings"
                description="Manage Backup Manager settings and users."
            />

            <Card>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Users
                        </h2>

                        <p className="mt-1 text-sm text-muted">
                            Manage the administrators who can
                            access Backup Manager.
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => {
                            console.log("Create user");
                        }}
                    >
                        Add user
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    loading={loading}
                    search={{
                        value: search,
                        onChange: setSearch,
                    }}
                    sort={{
                        field: sortField,
                        order: sortOrder,
                        onChange: handleSort,
                    }}
                />
            </Card>
        </main>
    );
}