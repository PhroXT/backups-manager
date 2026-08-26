import { Injectable } from '@nestjs/common';
import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
} from 'crypto';

@Injectable()
export class EncryptionService {

    private readonly algorithm = 'aes-256-gcm';

    private readonly key = Buffer.from(
        process.env.ENCRYPTION_KEY!,
        'hex',
    );

    encrypt(value: string): string {

        const iv = randomBytes(12);

        const cipher = createCipheriv(
            this.algorithm,
            this.key,
            iv,
        );

        const encrypted =
            Buffer.concat([
                cipher.update(value, 'utf8'),
                cipher.final(),
            ]);

        const authTag =
            cipher.getAuthTag();

        return [
            iv.toString('hex'),
            authTag.toString('hex'),
            encrypted.toString('hex'),
        ].join(':');
    }

    decrypt(value: string): string {

        const [
            ivHex,
            authTagHex,
            encryptedHex,
        ] = value.split(':');

        const decipher =
            createDecipheriv(
                this.algorithm,
                this.key,
                Buffer.from(ivHex, 'hex'),
            );

        decipher.setAuthTag(
            Buffer.from(authTagHex, 'hex'),
        );

        const decrypted =
            Buffer.concat([
                decipher.update(
                    Buffer.from(encryptedHex, 'hex'),
                ),
                decipher.final(),
            ]);

        return decrypted.toString('utf8');
    }
}