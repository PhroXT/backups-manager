"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/api";


export default function NewProjectPage() {

    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        type: "postgres",
        host: "",
        port: 5432,
        database: "",
        username: "",
        password: "",
    });


    const [loading, setLoading] = useState(false);


    function handleChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]:
                name === "port"
                    ? Number(value)
                    : value,
        });

    }


    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        setLoading(true);

        try {

            await apiFetch("/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });


            router.push("/dashboard/projects");

        } finally {
            setLoading(false);
        }

    }


    return (
        <div>

            <h2 className="text-3xl font-bold text-gray-900">
                New Project
            </h2>

            <p className="text-gray-600 mt-1">
                Configure a database connection.
            </p>


            <form
                onSubmit={handleSubmit}
                className="bg-white mt-6 p-6 rounded shadow max-w-xl space-y-4"
            >

                <Input
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                />


                <Input
                    label="Host"
                    name="host"
                    value={form.host}
                    onChange={handleChange}
                />


                <Input
                    label="Port"
                    name="port"
                    value={String(form.port)}
                    onChange={handleChange}
                />


                <Input
                    label="Database"
                    name="database"
                    value={form.database}
                    onChange={handleChange}
                />


                <Input
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                />


                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                />


                <button
                    disabled={loading}
                    className="
            bg-gray-900
            text-white
            px-4
            py-2
            rounded
            disabled:opacity-50
          "
                >
                    {loading ? "Saving..." : "Save Project"}
                </button>


            </form>

        </div>
    );
}


function Input({
    label,
    ...props
}: {
    label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {

    return (
        <div>

            <label className="block text-sm text-gray-700 mb-1">
                {label}
            </label>

            <input
                {...props}
                className="
          w-full
          border
          border-gray-300
          rounded
          px-3
          py-2
          text-gray-900
        "
            />

        </div>
    );
}