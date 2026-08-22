import { User } from '@prisma/client';

export type CurrentUser = Omit<User, 'passwordHash'>;

declare global {
    namespace Express {
        interface Request {
            user?: CurrentUser;
        }
    }
}

export { };