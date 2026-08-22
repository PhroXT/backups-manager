import AuthProtection from "@/src/components/auth/auth-protection";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProtection>
            {children}
        </AuthProtection>
    );
}