import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SessionService } from './session.service';
import { UsersService } from './users.service';
import { IS_PUBLIC_KEY } from './auth.module';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private readonly sessionService: SessionService,
        private readonly usersService: UsersService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        const isPublic =
            this.reflector.getAllAndOverride<boolean>(
                IS_PUBLIC_KEY,
                [
                    context.getHandler(),
                    context.getClass(),
                ],
            );

        if (isPublic) {
            return true;
        }

        const request =
            context
                .switchToHttp()
                .getRequest<Request>();

        const token = request.cookies?.auth;

        if (!token) {
            throw new UnauthorizedException();
        }

        let payload: { sub: string };

        try {
            payload =
                this.sessionService.verifyToken(token);
        } catch {
            throw new UnauthorizedException();
        }

        const user =
            await this.usersService.findById(
                payload.sub,
            );

        if (!user) {
            throw new UnauthorizedException();
        }

        request.user = user;

        return true;
    }
}