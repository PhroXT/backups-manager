import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PaginationDto } from "../common/dto/pagination.dto";
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Get()
    findAll(@Query() query: PaginationDto) {
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