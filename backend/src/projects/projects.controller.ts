import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { PaginationDto } from "../common/dto/pagination.dto";
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService
    ) { }

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

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateProjectDto,
    ) {
        return this.projectsService.update(id, dto);
    }
}