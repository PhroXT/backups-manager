type BadgeProps = {
    children: React.ReactNode;
    variant?: "success" | "danger" | "warning" | "neutral";
};

export default function Badge({ children, variant = "neutral" }: BadgeProps) {
    const styles = {
        success: "bg-green-100 text-green-700",
        danger: "bg-red-100 text-red-700",
        warning: "bg-yellow-100 text-yellow-700",
        neutral: "bg-gray-100 text-gray-700"
    };

    return <span className={`px-2 py-1 rounded text-sm ${styles[variant]}`}>
        {children}
    </span>;
}