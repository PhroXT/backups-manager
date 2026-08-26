import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { sessionDurationToMs } from './session-duration';

@Injectable()
export class SessionService {
    private readonly secret = process.env.SESSION_SECRET!;

    private readonly expiresIn: StringValue =
        (process.env.SESSION_EXPIRES_IN || '1h') as StringValue;

    createToken(userId: string): string {
        return jwt.sign(
            {
                sub: userId,
            },
            this.secret,
            {
                expiresIn: this.expiresIn,
            },
        );
    }

    getExpirationMs(): number {
        return sessionDurationToMs(this.expiresIn);
    }

    verifyToken(token: string): { sub: string; exp: number } {
        return jwt.verify(token, this.secret) as {
            sub: string;
            exp: number;
        };
    }
}