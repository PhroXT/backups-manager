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

    @Get('session')
    session(@Req() request: Request) {

        const token = request.cookies?.auth;

        const payload =
            this.sessionService.verifyToken(token);

        return {
            expiresAt: new Date(
                payload.exp * 1000,
            ),
        };
    }

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

    @Post('session/extend')
    extendSession(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {

        const token = request.cookies?.auth;

        const payload =
            this.sessionService.verifyToken(token);

        const newToken =
            this.sessionService.createToken(
                payload.sub,
            );

        response.cookie(
            'auth',
            newToken,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge:
                    this.sessionService.getExpirationMs(),
            },
        );

        const newPayload =
            this.sessionService.verifyToken(
                newToken,
            );

        return {
            expiresAt: new Date(
                newPayload.exp * 1000,
            ),
        };
    }
}