import Card from "@/src/components/ui/Card";
import PageHeader from "@/src/components/ui/PageHeader";

export default function DashboardPage() {
    return <div>
        <PageHeader title="Dashboard" description="Backup management system" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <h3 className="text-muted">Projects</h3>
                <p className="text-3xl font-bold">0</p>
            </Card>

            <Card>
                <h3 className="text-muted">Backups</h3>
                <p className="text-3xl font-bold">0</p>
            </Card>

            <Card>
                <h3 className="text-muted">Storage</h3>
                <p className="text-3xl font-bold">0 GB</p>
            </Card>
        </div>
    </div>;
}