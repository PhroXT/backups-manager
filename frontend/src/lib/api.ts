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

  if (response.status === 401) {

    const isLoginRequest =
      endpoint === "/auth/login";

    if (
      !isLoginRequest &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }

    throw new Error(
      isLoginRequest
        ? (
          Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message || "Invalid credentials"
        )
        : "Session expired",
    );
  }

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