export function formatBytes(
    bytes: string | null
) {

    if (!bytes) {
        return "-";
    }


    const value = Number(bytes);


    if (value < 1024) {
        return `${value} B`;
    }


    if (value < 1024 * 1024) {
        return `${(value / 1024).toFixed(1)} KB`;
    }


    if (value < 1024 * 1024 * 1024) {
        return `${(value / 1024 / 1024).toFixed(1)} MB`;
    }


    return `${(value / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export function formatDate(
    date: string
) {

    return new Date(date)
        .toLocaleString();

}