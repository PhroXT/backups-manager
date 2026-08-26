import AuthProtection from "@/src/components/auth/auth-protection";
import SessionExpirationAlert from "@/src/components/auth/SessionExpirationAlert";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProtection>
            {children}
            <SessionExpirationAlert />
        </AuthProtection>
    );
}