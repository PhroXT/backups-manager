export default function Card({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            className="
                bg-card
                border
                border-border
                rounded-lg
                shadow-sm
                p-6
            "
        >
            {children}
        </div>
    );
}