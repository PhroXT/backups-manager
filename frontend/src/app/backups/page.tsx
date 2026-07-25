'use client';

import { useBackups } from '@/src/hooks/useBackups';
import StatusBadge from "@/src/components/StatusBadge";

export default function BackupsPage() {

    const {
        backups,
        loading,
    } = useBackups();


    if (loading) {
        return <p>Cargando...</p>;
    }


    return (
        <div>

            <h1 className="text-2xl font-bold mb-6">
                Backups
            </h1>


            <div className="space-y-3">

                {backups.map((backup) => (

                    <div
                        key={backup.id}
                        className="border rounded p-4"
                    >

                        <div>
                            {backup.project.name}
                        </div>

                        <div>
                            {backup.filename ?? 'Sin archivo'}
                        </div>

                        <div>
                            {backup.size}
                        </div>

                        <div>
                            Estado: <StatusBadge status={backup.status} />
                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}