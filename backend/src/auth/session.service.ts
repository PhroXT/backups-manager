import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SessionService {
    private readonly secret = process.env.SESSION_SECRET!;

    createToken(userId: string): string {
        return jwt.sign(
            {
                sub: userId,
            },
            this.secret,
            {
                expiresIn: '1d',
            },
        );
    }

    verifyToken(token: string): { sub: string } {
        return jwt.verify(
            token,
            this.secret,
        ) as { sub: string };
    }
}