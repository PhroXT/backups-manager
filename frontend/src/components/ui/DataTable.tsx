import EmptyState from "./EmptyState";

type Column<T> = { key?: keyof T; label: string; render?: (row: T) => React.ReactNode };

type Pagination = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

type Search = {
    value: string;
    onChange: (value: string) => void;
};

type Sort = {
    field: string;
    order: "asc" | "desc";
    onChange: (field: string) => void;
};

type Props<T> = {
    columns: Column<T>[];
    data: T[];
    pagination?: Pagination;
    search?: Search;
    sort?: Sort;
    loading?:boolean;
};

export default function DataTable<T>({ columns, data, pagination, search, sort }: Props<T>) {
    return <div className="space-y-2">

        {search && <input
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder="Search..."
            className="border border-border rounded px-3 py-2 w-full md:w-80"
        />}

        {!data.length && !search?.value
            ? <EmptyState message="No records found" />
            :
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full">
                    <thead className="bg-foreground/5">
                        <tr>
                            {columns.map((column, i) =>
                                <th
                                    key={i}
                                    onClick={() => column.key && sort?.onChange(String(column.key))}
                                    className={`p-3 text-left text-sm font-medium text-muted ${column.key && sort ? "cursor-pointer" : ""}`}
                                >
                                    {column.label}
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((row, index) =>
                            <tr key={index} className="border-t border-border hover:bg-foreground/5">
                                {columns.map((column, i) =>
                                    <td key={i} className="p-3 text-sm">
                                        {column.render ? column.render(row) : String(row[column.key!])}
                                    </td>
                                )}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        }

        {pagination && <div className="flex justify-between items-center">
            <button
                disabled={pagination.page === 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                className="border px-3 py-1 rounded disabled:opacity-50"
            >
                Previous
            </button>

            <span className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                className="border px-3 py-1 rounded disabled:opacity-50"
            >
                Next
            </button>
        </div>}

    </div>;
}