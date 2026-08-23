import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { CommonModule } from "../common/common.module";
import { ConnectionModule } from '../database/connection/connection.module';
import { PaginationModule } from '../common/pagination/pagination.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CommonModule, ConnectionModule, PaginationModule, AuthModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule { }