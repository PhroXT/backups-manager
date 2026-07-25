"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api";


type Backup = {
    id: string;
    filename: string;
    status: string;
    createdAt: string;
    project: {
        name: string;
    };
};


export default function BackupsPage() {

    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        apiFetch("/backups")
            .then(setBackups)
            .finally(() => setLoading(false));

    }, []);


    if (loading) {
        return <p className="text-gray-600">
            Loading backups...
        </p>;
    }


    return (
        <div>

            <h2 className="text-3xl font-bold text-gray-900">
                Backups
            </h2>


            <p className="text-gray-600 mt-1">
                Backup history.
            </p>


            <div className="bg-white rounded shadow mt-6 overflow-x-auto">

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>

                            <th className="p-3 text-left text-gray-700">
                                Project
                            </th>

                            <th className="p-3 text-left text-gray-700">
                                File
                            </th>

                            <th className="p-3 text-left text-gray-700">
                                Status
                            </th>

                            <th className="p-3 text-left text-gray-700">
                                Date
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {backups.map((backup) => (

                            <tr
                                key={backup.id}
                                className="border-t"
                            >

                                <td className="p-3 text-gray-900">
                                    {backup.project.name}
                                </td>


                                <td className="p-3 text-gray-700">
                                    {backup.filename}
                                </td>


                                <td className="p-3 text-gray-700">
                                    {backup.status}
                                </td>


                                <td className="p-3 text-gray-700">
                                    {new Date(
                                        backup.createdAt
                                    ).toLocaleString()}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}