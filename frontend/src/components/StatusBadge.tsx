type Props = {
    status: string;
};


export default function StatusBadge({
    status,
}: Props) {

    const styles: Record<string, string> = {

        completed:
            "bg-green-100 text-green-700",

        running:
            "bg-blue-100 text-blue-700",

        pending:
            "bg-yellow-100 text-yellow-700",

        failed:
            "bg-red-100 text-red-700",

    };


    return (
        <span
            className={`
                px-2
                py-1
                rounded
                text-sm
                ${styles[status] ?? "bg-gray-100 text-gray-700"}
            `}
        >
            {status}
        </span>
    );
}