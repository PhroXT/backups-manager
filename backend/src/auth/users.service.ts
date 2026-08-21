import {
    ConflictException,
    Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly passwordService: PasswordService,
    ) { }

    async create(
        username: string,
        email: string,
        password: string,
    ) {
        const existingUsername = await this.prisma.user.findUnique({
            where: { username },
        });

        if (existingUsername) {
            throw new ConflictException('Username already exists');
        }

        const existingEmail = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingEmail) {
            throw new ConflictException('Email already exists');
        }

        const passwordHash = await this.passwordService.hash(password);

        return this.prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findByUsername(username: string) {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async verifyPassword(
        passwordHash: string,
        password: string,
    ) {
        return this.passwordService.verify(
            passwordHash,
            password,
        );
    }
}