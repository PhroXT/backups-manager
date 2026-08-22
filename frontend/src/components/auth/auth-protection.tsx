"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuthProtection({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch(
                    `${API_URL}/auth/me`,
                    {
                        credentials: "include",
                    },
                );

                if (!response.ok) {
                    router.replace("/login");
                    return;
                }

                setAuthenticated(true);
            } catch {
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!authenticated) {
        return null;
    }

    return children;
}