import {
    ConflictException,
    Injectable,
    NotFoundException,
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

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    async update(
        id: string,
        data: {
            username?: string;
            email?: string;
        },
    ) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        if (
            data.username &&
            data.username !== existingUser.username
        ) {
            const usernameExists =
                await this.prisma.user.findUnique({
                    where: {
                        username: data.username,
                    },
                });

            if (usernameExists) {
                throw new ConflictException(
                    'Username already exists',
                );
            }
        }

        if (
            data.email &&
            data.email !== existingUser.email
        ) {
            const emailExists =
                await this.prisma.user.findUnique({
                    where: {
                        email: data.email,
                    },
                });

            if (emailExists) {
                throw new ConflictException(
                    'Email already exists',
                );
            }
        }

        return this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async updatePassword(
        id: string,
        password: string,
    ) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        const passwordHash =
            await this.passwordService.hash(password);

        await this.prisma.user.update({
            where: { id },
            data: {
                passwordHash,
            },
        });

        return {
            success: true,
        };
    }

    async delete(id: string) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        const userCount = await this.prisma.user.count();

        if (userCount <= 1) {
            throw new ConflictException(
                'Cannot delete the last user',
            );
        }

        await this.prisma.user.delete({
            where: { id },
        });

        return {
            success: true,
        };
    }
}