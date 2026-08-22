import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CronExpressionParser } from 'cron-parser';

@Injectable()
export class BackupReportService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async generateReport(date: Date) {
        const schedules = await this.getSchedulesForDate(date);

        const projectIds = schedules.map(
            (schedule) => schedule.projectId,
        );

        const { start, end } = this.getDayRange(date);

        const backups = await this.prisma.backup.findMany({
            where: {
                projectId: {
                    in: projectIds,
                },
                createdAt: {
                    gte: start,
                    lt: end,
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return {
            date,

            expected: schedules.length,
            totalBackups: backups.length,

            completed: backups.filter(
                (backup) => backup.status === 'completed',
            ).length,

            running: backups.filter(
                (backup) => backup.status === 'running'
            ).length,

            pending: backups.filter(
                (backup) => backup.status === 'pending',
            ).length,

            failed: backups.filter(
                (backup) => backup.status === 'failed',
            ).length,

            missing: Math.max(
                schedules.length - backups.length,
                0,
            ),

            schedules,
            backups,
        };
    }

    private async getSchedulesForDate(date: Date) {
        const schedules = await this.prisma.schedule.findMany({
            where: {
                enabled: true,
            },
            include: {
                project: true,
            },
        });

        return schedules.filter((schedule) => {
            const interval = CronExpressionParser.parse(
                schedule.cron,
                {
                    currentDate: date,
                },
            );

            const previous = interval.prev().toDate();
            const next = interval.next().toDate();

            return (
                this.isSameDay(previous, date) ||
                this.isSameDay(next, date)
            );
        });
    }

    private getDayRange(date: Date) {
        const start = new Date(date);

        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        return { start, end };
    }

    private isSameDay(a: Date, b: Date): boolean {
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    }

    formatReport(report: {
        date: Date;
        expected: number;
        totalBackups: number;
        completed: number;
        running: number;
        failed: number;
        missing: number;
        pending: number;
    }) {
        const date = report.date.toLocaleDateString(
            'es-HN',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            },
        );

        return `
                <b>BACKUP MANAGER</b>

                <b>Resumen de actividad</b>
                ${date}

                Programados: ${report.expected}
                Backups encontrados: ${report.totalBackups}

                Completados: ${report.completed}
                En ejecución: ${report.running}
                Pendientes: ${report.pending}
                Fallidos: ${report.failed}
                Sin ejecución: ${report.missing}
                    `.trim();
    }
}