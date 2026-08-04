import EmptyState from "./EmptyState";

type Column<T> = { key?: keyof T; label: string; render?: (row: T) => React.ReactNode };
type Props<T> = { columns: Column<T>[]; data: T[] };

export default function DataTable<T>({ columns, data }: Props<T>) {
    if (!data.length) return <EmptyState message="No records found" />;
    return <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full">
            <thead className="bg-foreground/5">
                <tr>
                    {columns.map((column, i) => <th key={i} className="p-3 text-left text-sm font-medium text-muted">{column.label}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => <tr key={index} className="border-t border-border hover:bg-foreground/5">
                    {columns.map((column, i) => <td key={i} className="p-3 text-sm">{column.render ? column.render(row) : String(row[column.key!])}</td>)}
                </tr>)}
            </tbody>
        </table>
    </div>;
}