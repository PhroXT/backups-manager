'use client'; "use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/src/components/ui/Card";
import DataTable from "@/src/components/ui/DataTable";
import Button from "@/src/components/ui/Button";
import Alert from "@/src/components/ui/Alert";
import PageHeader from "@/src/components/ui/PageHeader";
import CreateUserModal from "@/src/components/settingsPage/CreateUserModal";
import EditUserModal from "@/src/components/settingsPage/EditUserModal";
import ChangePasswordModal from "@/src/components/settingsPage/ChangePasswordModal";
import DeleteUserModal from "@/src/components/settingsPage/DeleteUserModal";

type User = {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SettingsPage() {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState("username");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const [alert, setAlert] = useState<{
        variant: "success" | "error" | "info" | "warning";
        title?: string;
        message?: string;
        durationMs?: number;
    } | null>(null);

    function handleEditUser(user: User) {
        setSelectedUser(user);
        setEditModalOpen(true);
    }

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
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => handleEditUser(user)}
                    >
                        Edit
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => {
                            setSelectedUser(user);
                            setPasswordModalOpen(true);
                        }}
                    >
                        Password
                    </Button>

                    <Button
                        variant="danger"
                        onClick={() => {
                            setSelectedUser(user);
                            setDeleteModalOpen(true);
                        }}
                    >
                        Delete
                    </Button>
                </div>
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
                        onClick={() => setCreateModalOpen(true)}
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

            <CreateUserModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreated={async () => {
                    await loadUsers();

                    setAlert({
                        variant: "success",
                        title: "User created",
                        message: "The user was created successfully.",
                    });
                }}
                onError={(message) => {
                    setAlert({
                        variant: "error",
                        title: "Unable to create user",
                        message,
                    });
                }}
            />

            <EditUserModal
                open={editModalOpen}
                user={selectedUser}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedUser(null);
                }}
                onUpdated={async () => {
                    await loadUsers();

                    setAlert({
                        variant: "success",
                        title: "User updated",
                        message:
                            "The user was updated successfully.",
                    });
                }}
                onError={(message) => {
                    setAlert({
                        variant: "error",
                        durationMs: 2000,
                        title: "Unable to update user",
                        message,
                    });
                }}
            />

            <ChangePasswordModal
                open={passwordModalOpen}
                user={selectedUser}
                onClose={() => {
                    setPasswordModalOpen(false);
                    setSelectedUser(null);
                }}
                onUpdated={() => {
                    setAlert({
                        variant: "success",
                        title: "Password changed",
                        durationMs: 2000,
                        message:
                            "The password was changed successfully.",
                    });
                }}
                onError={(message) => {
                    setAlert({
                        variant: "error",
                        title: "Unable to change password",
                        message,
                    });
                }}
            />
            <DeleteUserModal
                open={deleteModalOpen}
                user={selectedUser}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedUser(null);
                }}
                onDeleted={async () => {
                    await loadUsers();

                    setAlert({
                        variant: "success",
                        title: "User deleted",
                        durationMs: 2000,
                        message:
                            "The user was deleted successfully.",
                    });
                }}
                onError={(message) => {
                    setAlert({
                        variant: "error",
                        durationMs: 2000,
                        title: "Unable to delete user",
                        message,
                    });
                }}
            />
        </main>
    );
}