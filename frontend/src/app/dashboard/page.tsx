export default function DashboardPage() {
    return (
        <div>

            <h2 className="text-3xl font-bold">
                Dashboard
            </h2>

            <p className="mt-2 text-gray-600">
                Backup management system
            </p>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">

                <div className="bg-white p-5 rounded shadow">
                    <h3 className="text-gray-500">
                        Projects
                    </h3>
                    <p className="text-3xl font-bold">
                        0
                    </p>
                </div>


                <div className="bg-white p-5 rounded shadow">
                    <h3 className="text-gray-500">
                        Backups
                    </h3>
                    <p className="text-3xl font-bold">
                        0
                    </p>
                </div>


                <div className="bg-white p-5 rounded shadow">
                    <h3 className="text-gray-500">
                        Storage
                    </h3>
                    <p className="text-3xl font-bold">
                        0 GB
                    </p>
                </div>

            </div>

        </div>
    );
}