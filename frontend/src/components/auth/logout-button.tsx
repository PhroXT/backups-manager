"use client";

import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LogoutButton() {
    const router = useRouter();

    async function logout() {
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });

        router.replace("/login");
        router.refresh();
    }

    return (
        <button
            onClick={logout}
            className="w-full px-3 py-2 rounded text-left hover:bg-gray-800"
        >
            Logout
        </button>
    );
}