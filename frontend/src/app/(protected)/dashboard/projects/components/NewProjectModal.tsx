"use client";

import { useState } from "react";
import { apiFetch } from "@/src/lib/api";
import Modal from "@/src/components/ui/Modal";
import Button from "@/src/components/ui/Button";

export default function ProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        type: "postgres",
        host: "",
        port: 5432,
        database: "",
        username: "",
        password: "",
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: name === "port" ? Number(value) : value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await apiFetch("/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            onClose();
        } finally {
            setLoading(false);
        }
    }

    return <Modal open={open} onClose={onClose} title="New Project">
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" placeholder="Name" onChange={handleChange} className="w-full border p-2 rounded" />
            <input name="host" placeholder="Host" onChange={handleChange} className="w-full border p-2 rounded" />
            <input name="port" placeholder="Port" value={form.port} onChange={handleChange} className="w-full border p-2 rounded" />
            <input name="database" placeholder="Database" onChange={handleChange} className="w-full border p-2 rounded" />
            <input name="username" placeholder="Username" onChange={handleChange} className="w-full border p-2 rounded" />
            <input name="password" placeholder="Password" type="password" onChange={handleChange} className="w-full border p-2 rounded" />

            <Button disabled={loading}>
                {loading ? "Saving..." : "Save Project"}
            </Button>
        </form>
    </Modal>;
}