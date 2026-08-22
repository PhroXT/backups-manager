import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { AuthGuard } from './auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Post()
    create(@Body() body: CreateUserDto) {
        return this.usersService.create(
            body.username,
            body.email,
            body.password,
        );
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() body: UpdateUserDto,
    ) {
        return this.usersService.update(id, body);
    }

    @Patch(':id/password')
    updatePassword(
        @Param('id') id: string,
        @Body() body: UpdatePasswordDto,
    ) {
        return this.usersService.updatePassword(
            id,
            body.password,
        );
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }
}