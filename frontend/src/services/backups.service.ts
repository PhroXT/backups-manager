import { createCrudService } from "./createCrudService";
import { Backup } from "@/src/types/backup";

export const backupsService =
    createCrudService<Backup>("backups");