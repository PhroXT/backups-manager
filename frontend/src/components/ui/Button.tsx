type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "danger" | "secondary";
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
};

export default function Button({
    children,
    onClick,
    variant = "primary",
    disabled,
    type = "button",
}: ButtonProps) {
    const styles = {
        primary: "bg-gray-900 text-white hover:bg-gray-700",
        danger: "bg-red-600 text-white hover:bg-red-700",
        secondary:
            "bg-card border border-border text-foreground hover:bg-foreground/5",
    };

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`px-4 py-2 rounded-md transition ${styles[variant]} disabled:opacity-50`}
        >
            {children}
        </button>
    );
}