import EmptyState from "./EmptyState";

type Column<T> = { key?: keyof T; label: string; render?: (row: T) => React.ReactNode };

type Identifiable = {
    id: string;
};

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

type PageSize = {
    value: number;
    options: number[];
    onChange: (value: number) => void;
};

type Props<T extends Identifiable> = {
    columns: Column<T>[];
    data: T[];
    pagination?: Pagination;
    search?: Search;
    sort?: Sort;
    loading?: boolean;
    pageSize?: PageSize;
};

export default function DataTable<T extends Identifiable>({ columns, data, pagination, search, sort, pageSize, loading }: Props<T>) {
    const rows = data ?? [];

    const handleSort = (columnKey?: keyof T) => {
        if (!columnKey || !sort) return;

        const key = String(columnKey);

        if (sort.field !== key) {
            sort.onChange(key);
            return;
        }

        sort.onChange(key);
    };

    const getSortIndicator = (columnKey?: keyof T) => {
        if (!columnKey || !sort || sort.field !== String(columnKey)) {
            return null;
        }

        return sort.order === "asc" ? " ↑" : " ↓";
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                {search && (
                    <input
                        value={search.value}
                        onChange={(e) => search.onChange(e.target.value)}
                        placeholder="Search..."
                        className="w-full rounded border border-border px-3 py-2 md:w-80"
                    />
                )}

                {pageSize && (
                    <select
                        value={pageSize.value}
                        onChange={(e) => pageSize.onChange(Number(e.target.value))}
                        className="rounded border border-border bg-card px-3 py-2 text-foreground"
                    >
                        {pageSize.options.map((size) => (
                            <option key={size} value={size}>
                                {size} rows
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {loading ? (
                <div className="rounded-lg border border-border bg-card p-6 text-muted">
                    Loading...
                </div>
            ) : !rows.length ? (
                <EmptyState
                    message={
                        search?.value
                            ? "No records match your search."
                            : "No records found."
                    }
                />
            ) : (
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                    <table className="w-full">
                        <thead className="bg-foreground/5">
                            <tr>
                                {columns.map((column, i) => (
                                    <th
                                        key={i}
                                        onClick={() => handleSort(column.key)}
                                        className={`p-3 text-left text-sm font-medium text-muted ${column.key && sort ? "cursor-pointer select-none" : ""
                                            }`}
                                    >
                                        <span className="flex items-center gap-1">
                                            {column.label}
                                            {getSortIndicator(column.key)}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-t border-border hover:bg-foreground/5">
                                    {columns.map((column, i) => (
                                        <td key={i} className="p-3 text-sm">
                                            {column.render ? column.render(row) : String(row[column.key!])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination && (
                <div className="flex items-center justify-between">
                    <button
                        disabled={pagination.page === 1}
                        onClick={() => pagination.onPageChange(pagination.page - 1)}
                        className="rounded border px-3 py-1 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-sm">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => pagination.onPageChange(pagination.page + 1)}
                        className="rounded border px-3 py-1 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}