import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controlller';
import { PasswordService } from './password.service';
import { UsersService } from './users.service';

@Module({
    imports: [PrismaModule],
    controllers: [AuthController],
    providers: [
        PasswordService,
        UsersService,
    ],
    exports: [
        PasswordService,
        UsersService,
    ],
})
export class AuthModule { }