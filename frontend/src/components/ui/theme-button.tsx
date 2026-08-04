"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeButton() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="px-3 py-2 rounded-md border">
        {theme === "dark" ? "☀️ Claro" : "🌙 Oscuro"}
    </button>;
}