"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

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
            name: "Backups",
            href: "/dashboard/backups",
        },
        {
            name: "Settings",
            href: "/dashboard/settings",
        },
    ];

    return (
        <aside className="hidden md:flex w-64 flex-col bg-gray-900 text-white min-h-screen p-5">

            <h1 className="text-xl font-bold mb-8">
                Backup Manager
            </h1>

            <nav className="flex flex-col gap-2">

                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`px-3 py-2 rounded ${pathname === link.href
                                ? "bg-gray-700"
                                : "hover:bg-gray-800"
                            }`}
                    >
                        {link.name}
                    </Link>
                ))}

            </nav>

        </aside>
    );
}