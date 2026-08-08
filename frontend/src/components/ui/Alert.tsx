import { useEffect, useState } from "react";
import { X } from "lucide-react";

type AlertVariant = "success" | "error" | "info" | "warning";

type AlertProps = {
    variant?: AlertVariant;
    title?: string;
    message?: string;
    onClose?: () => void;
    className?: string;
    durationMs?: number;
};

const variantStyles: Record<AlertVariant, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
};

export default function Alert({
    variant = "info",
    title,
    message,
    onClose,
    className = "",
    durationMs = 1000,
}: AlertProps) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!onClose || durationMs <= 0) {
            return;
        }

        const start = performance.now();

        let animationFrameId: number;
        let timeoutId: number;

        const updateProgress = (currentTime: number) => {
            const elapsed = currentTime - start;
            const remaining = Math.max(0, durationMs - elapsed);

            const nextProgress = (remaining / durationMs) * 100;

            setProgress(nextProgress);

            if (elapsed < durationMs) {
                animationFrameId =
                    window.requestAnimationFrame(updateProgress);
            }
        };

        animationFrameId =
            window.requestAnimationFrame(updateProgress);

        timeoutId = window.setTimeout(() => {
            setProgress(0);
            onClose();
        }, durationMs);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.clearTimeout(timeoutId);
        };
    }, [durationMs, onClose]);

    return (
        <div
            className={`fixed right-4 top-4 z-50 flex w-[min(92vw,24rem)] flex-col overflow-hidden rounded-lg border px-4 py-3 shadow-lg ${variantStyles[variant]} ${className}`}
            role="status"
            aria-live="polite"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    {title && (
                        <p className="font-medium">
                            {title}
                        </p>
                    )}

                    {message && (
                        <p className="mt-1 text-sm opacity-90">
                            {message}
                        </p>
                    )}
                </div>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 transition hover:bg-black/5"
                        aria-label="Cerrar alerta"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/10">
                <div
                    className="h-full rounded-full bg-current"
                    style={{
                        width: `${progress}%`,
                    }}
                />
            </div>
        </div>
    );
}
