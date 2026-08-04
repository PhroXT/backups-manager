type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
    if (!open) return null;

    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-xl rounded-lg bg-card border border-border p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                <button onClick={onClose} className="text-muted hover:text-foreground">
                    ✕
                </button>
            </div>

            {children}
        </div>
    </div>;
}