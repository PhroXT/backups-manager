import Sidebar from "@/src/components/layout/Sidebar";
import AuthProtection from "@/src/components/auth/auth-protection"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <div className="flex min-h-screen">

            <Sidebar />

            <main className="flex-1 bg-background text-foreground p-6">
                <AuthProtection>
                    {children}
                </AuthProtection>
            </main>

        </div>
    );
}