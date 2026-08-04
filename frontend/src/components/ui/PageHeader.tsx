export default function PageHeader({ title, description }: { title: string; description?: string }) {
    return <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        {description && <p className="mt-2 text-muted">{description}</p>}
    </div>;
}