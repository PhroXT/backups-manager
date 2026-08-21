import {
    Body,
    Controller,
    Post,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Post('login')
    async login(
        @Body()
        body: {
            username: string;
            password: string;
        },
        @Res({ passthrough: true }) response: Response,
    ) {
        const user = await this.usersService.findByUsername(
            body.username,
        );

        if (!user) {
            throw new UnauthorizedException(
                'Invalid credentials',
            );
        }

        const validPassword =
            await this.usersService.verifyPassword(
                user.passwordHash,
                body.password,
            );

        if (!validPassword) {
            throw new UnauthorizedException(
                'Invalid credentials',
            );
        }

        response.cookie(
            'auth',
            user.id,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            },
        );

        return {
            id: user.id,
            username: user.username,
            email: user.email,
        };
    }
}