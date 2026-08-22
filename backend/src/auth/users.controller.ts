import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
} from '@nestjs/common';

import { AuthGuard } from './auth.guard';
import { UsersService } from './users.service';

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
    create(
        @Body()
        body: {
            username: string;
            email: string;
            password: string;
        },
    ) {
        return this.usersService.create(
            body.username,
            body.email,
            body.password,
        );
    }
}