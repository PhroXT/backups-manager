import { Module, SetMetadata } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from '../auth/auth.controlller';
import { AuthGuard } from './auth.guard';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { APP_GUARD } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Module({
    imports: [PrismaModule],
    controllers: [AuthController, UsersController],
    providers: [
        PasswordService,
        SessionService,
        UsersService,
        AuthGuard,

        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
    exports: [
        PasswordService,
        SessionService,
        UsersService,
        AuthGuard,
    ],
})
export class AuthModule { }