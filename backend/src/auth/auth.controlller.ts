import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UsersService } from './users.service';
import { SessionService } from './session.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService,
        private readonly sessionService: SessionService,
    ) { }

    @Get('me')
    me(@Req() request: Request) {
        return request.user;
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('auth', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return {
            success: true,
        };
    }

    @Post('login')
    @Public()
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

        const token = this.sessionService.createToken(user.id);

        response.cookie(
            'auth',
            token,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: this.sessionService.getExpirationMs(),
            },
        );

        return {
            id: user.id,
            username: user.username,
            email: user.email,
        };
    }
}