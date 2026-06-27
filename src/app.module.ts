import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { ConnectionService } from './database/connection/connection.service';

@Module({
  imports: [PrismaModule, ProjectsModule],
  providers: [ConnectionService],
})
export class AppModule {}