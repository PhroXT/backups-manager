import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { BackupsModule } from './backups/backups.module';

@Module({
  imports: [PrismaModule, ProjectsModule,
    PrismaModule,
    ProjectsModule,
    BackupsModule
  ]
})
export class AppModule { }