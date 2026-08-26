"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/api";
import Button from "@/src/components/ui/Button";

type SessionResponse = {
    expiresAt: string;
};

const WARNING_TIME_MS = 2 * 60 * 1000;

export default function SessionExpirationAlert() {

    const router = useRouter();

    const [expiresAt, setExpiresAt] = useState<number | null>(null);
    const [remainingMs, setRemainingMs] = useState<number | null>(null);
    const [extending, setExtending] = useState(false);

    useEffect(() => {

        let mounted = true;

        async function loadSession() {

            try {

                const data =
                    await apiFetch<SessionResponse>(
                        "/auth/session",
                    );

                if (!mounted) {
                    return;
                }

                const expiration =
                    new Date(data.expiresAt).getTime();

                setExpiresAt(expiration);
                setRemainingMs(
                    expiration - Date.now(),
                );

            } catch {

                if (mounted) {
                    router.replace("/login");
                }

            }

        }

        loadSession();

        return () => {
            mounted = false;
        };

    }, [router]);

    useEffect(() => {

        if (expiresAt === null) {
            return;
        }

        const interval = setInterval(() => {

            const remaining =
                expiresAt - Date.now();

            setRemainingMs(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                router.replace("/login");
            }

        }, 1000);

        return () => clearInterval(interval);

    }, [expiresAt, router]);

    async function extendSession() {

        if (extending) {
            return;
        }

        setExtending(true);

        try {

            const data =
                await apiFetch<SessionResponse>(
                    "/auth/session/extend",
                    {
                        method: "POST",
                    },
                );

            const expiration =
                new Date(data.expiresAt).getTime();

            setExpiresAt(expiration);
            setRemainingMs(
                expiration - Date.now(),
            );

        } catch {

            router.replace("/login");

        } finally {

            setExtending(false);

        }

    }

    if (
        remainingMs === null ||
        remainingMs <= 0 ||
        remainingMs > WARNING_TIME_MS
    ) {
        return null;
    }

    const totalSeconds =
        Math.ceil(remainingMs / 1000);

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    const formattedSeconds =
        String(seconds).padStart(2, "0");

    return (
        <div
            className="fixed right-4 top-4 z-50 w-[min(92vw,24rem)] rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-amber-800 shadow-lg"
            role="alert"
            aria-live="polite"
        >
            <div className="flex items-start justify-between gap-4">

                <div>
                    <p className="font-medium">
                        Session expiring soon
                    </p>

                    <p className="mt-1 text-sm">
                        Your session will expire in{" "}
                        <span className="font-semibold">
                            {minutes}:{formattedSeconds}
                        </span>
                        .
                    </p>
                </div>

                <Button
                    variant="primary"
                    disabled={extending}
                    onClick={extendSession}
                >
                    {extending
                        ? "Extending..."
                        : "Extend session"}
                </Button>

            </div>
        </div>
    );
}