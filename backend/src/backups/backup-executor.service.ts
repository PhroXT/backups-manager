import { Injectable } from '@nestjs/common';


@Injectable()
export class BackupExecutorService {


    async execute(
        backupId: string,
    ) {

        console.log(
            `Executing backup ${backupId}`
        );


        // Aquí irá:
        //
        // 1. Obtener proyecto
        // 2. Ejecutar pg_dump
        // 3. Crear archivo
        // 4. Subir a MinIO
        // 5. Actualizar estado


        return {
            success: true,
        };

    }

}