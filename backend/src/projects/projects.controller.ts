import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Get()
    findAll(@Query() query: PaginationQueryDto) {
        return this.projectsService.findAll(query);
    }

    @Post()
    create(@Body() dto: CreateProjectDto) {
        return this.projectsService.create(dto);
    }

    @Post(':id/test-connection')
    async testConnection(@Param('id') id: string) {
        return this.projectsService.testConnection(id);
    }
}