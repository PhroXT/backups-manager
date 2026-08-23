const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include",
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message ||
        `API error: ${response.status}`;

    throw new Error(message);
  }

  return data;
}