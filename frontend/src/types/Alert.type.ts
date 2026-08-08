export type AlertState = {
    variant: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
} | null;