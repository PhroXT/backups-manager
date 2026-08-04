type LoadingStateProps = {
    message?: string;
};

export default function LoadingState({ message = "Loading..." }: LoadingStateProps) {
    return <div className="flex items-center justify-center p-10 text-center">
        <div>
            <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted">{message}</p>
        </div>
    </div>;
}