import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PasswordService } from './password.service';
import { UsersService } from './users.service';

@Module({
    imports: [PrismaModule],
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