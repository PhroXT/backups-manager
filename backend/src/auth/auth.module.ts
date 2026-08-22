import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from '../auth/auth.controlller';
import { AuthGuard } from './auth.guard';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { UsersService } from './users.service';

@Module({
    imports: [PrismaModule],
    controllers: [AuthController],
    providers: [
        PasswordService,
        SessionService,
        UsersService,
        AuthGuard,
    ],
    exports: [
        PasswordService,
        SessionService,
        UsersService,
        AuthGuard,
    ],
})
export class AuthModule { }