import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from '../auth/auth.controlller';
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
    ],
    exports: [
        PasswordService,
        SessionService,
        UsersService,
    ],
})
export class AuthModule { }