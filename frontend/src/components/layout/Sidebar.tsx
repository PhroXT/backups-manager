"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeButton from "../ui/theme-button";
import LogoutButton from "../auth/logout-button";

export default function Sidebar() {
    const pathname = usePathname();

    const isBackupsSection =
        pathname === "/dashboard/backups" ||
        pathname.startsWith("/dashboard/backups/");

    const [backupsOpen, setBackupsOpen] =
        useState(isBackupsSection);

    const links = [
        {
            name: "Dashboard",
            href: "/dashboard",
        },
        {
            name: "Projects",
            href: "/dashboard/projects",
        },
        {
            name: "Schedules",
            href: "/dashboard/schedules",
        },
        {
            name: "Settings",
            href: "/dashboard/settings",
        },
    ];

    const isActive = (href: string) =>
        pathname === href;

    return (
        <aside className="hidden md:flex w-64 flex-col bg-gray-950 text-white min-h-screen p-5">

            <h1 className="text-xl font-bold mb-8">
                Backup Manager
            </h1>

            <nav className="flex flex-col gap-2 flex-1">

                {links.slice(0, 3).map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`px-3 py-2 rounded ${isActive(link.href)
                            ? "bg-gray-700"
                            : "hover:bg-gray-800"
                            }`}
                    >
                        {link.name}
                    </Link>
                ))}

                {/* Backups */}
                <div>

                    <button
                        type="button"
                        onClick={() =>
                            setBackupsOpen((open) => !open)
                        }
                        className={`w-full flex items-center justify-between px-3 py-2 rounded ${isBackupsSection
                            ? "bg-gray-700"
                            : "hover:bg-gray-800"
                            }`}
                    >
                        <span>
                            Backups
                        </span>

                        <span className="text-sm">
                            {backupsOpen ? "▼" : "▶"}
                        </span>
                    </button>

                    {backupsOpen && (
                        <div className="mt-1 ml-3 flex flex-col gap-1">

                            <Link
                                href="/dashboard/backups"
                                className={`px-3 py-2 rounded text-sm ${pathname ===
                                    "/dashboard/backups"
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-300 hover:bg-gray-900"
                                    }`}
                            >
                                History
                            </Link>

                            <Link
                                href="/dashboard/backups/downloads"
                                className={`px-3 py-2 rounded text-sm ${pathname ===
                                    "/dashboard/backups/downloads"
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-300 hover:bg-gray-900"
                                    }`}
                            >
                                Available Backups
                            </Link>

                        </div>
                    )}

                </div>

                {/* Settings */}
                <Link
                    href={links[3].href}
                    className={`px-3 py-2 rounded ${isActive(links[3].href)
                        ? "bg-gray-700"
                        : "hover:bg-gray-800"
                        }`}
                >
                    {links[3].name}
                </Link>

            </nav>

            <footer>
                <ThemeButton />

                <div className="mt-2"></div>

                <LogoutButton />
            </footer>

        </aside>
    );
}