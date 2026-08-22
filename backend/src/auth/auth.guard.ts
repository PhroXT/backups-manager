import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from './session.service';
import { UsersService } from './users.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly sessionService: SessionService,
        private readonly usersService: UsersService,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context
            .switchToHttp()
            .getRequest<Request>();

        const token = request.cookies?.auth;

        if (!token) {
            throw new UnauthorizedException();
        }

        let payload: { sub: string };

        try {
            payload = this.sessionService.verifyToken(token);
        } catch {
            throw new UnauthorizedException();
        }

        const user = await this.usersService.findById(
            payload.sub,
        );

        if (!user) {
            throw new UnauthorizedException();
        }

        request.user = user;

        return true;
    }
}