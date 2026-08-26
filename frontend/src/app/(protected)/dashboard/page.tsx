"use client";

import Card from "@/src/components/ui/Card";
import PageHeader from "@/src/components/ui/PageHeader";
import ActiveBackups from "@/src/components/backups/ActiveBackups";
import { useDashboardStats } from "@/src/hooks/useDashboardStats";

function formatStorage(bytes: number) {

    if (bytes < 1024 * 1024 * 1024) {
        return `${(
            bytes / (1024 * 1024)
        ).toFixed(1)} MB`;
    }

    return `${(
        bytes / (1024 * 1024 * 1024)
    ).toFixed(2)} GB`;
}

export default function DashboardPage() {

    const { stats, loading } =
        useDashboardStats();

    return (
        <div>

            <PageHeader
                title="Dashboard"
                description="Backup management system"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <Card>
                    <h3 className="text-muted">
                        Active projects
                    </h3>

                    <p className="text-3xl font-bold">
                        {loading
                            ? "..."
                            : stats?.projects ?? 0}
                    </p>
                </Card>


                <Card>
                    <h3 className="text-muted">
                        Backups
                    </h3>

                    <p className="text-3xl font-bold">
                        {loading
                            ? "..."
                            : stats?.backups ?? 0}
                    </p>
                </Card>


                <Card>
                    <h3 className="text-muted">
                        Storage
                    </h3>

                    <p className="text-3xl font-bold">
                        {loading
                            ? "..."
                            : formatStorage(
                                stats?.storageBytes ?? 0,
                            )}
                    </p>
                </Card>

            </div>

            <ActiveBackups />

        </div>
    );
}