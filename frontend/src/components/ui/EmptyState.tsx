type EmptyStateProps = {
    title?: string;
    message: string;
};

export default function EmptyState({ title = "No data found", message }: EmptyStateProps) {
    return <div className="flex flex-col items-center justify-center p-10 text-center border border-border rounded-lg bg-card">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-muted">{message}</p>
    </div>;
}