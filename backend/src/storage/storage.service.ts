import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class StorageService implements OnModuleInit {

    constructor(
        private readonly configService: ConfigService,
    ) { }

    private client: Client;

    async onModuleInit() {

        this.client = new Client({
            endPoint: this.configService.get<string>('MINIO_ENDPOINT')!,
            port: Number(this.configService.get('MINIO_PORT')),
            useSSL: false,
            accessKey: this.configService.get<string>('MINIO_ACCESS_KEY')!,
            secretKey: this.configService.get<string>('MINIO_SECRET_KEY')!,
        });

        await this.ensureBucket(
            this.configService.get<string>('MINIO_BUCKET')!,
        );
        console.log('Ready. MinIO connected');
    }

    async ensureBucket(bucket: string) {

        const exists = await this.client.bucketExists(bucket);

        if (!exists) {
            await this.client.makeBucket(bucket);
        }

    }

    async uploadFile(
        bucket: string,
        objectName: string,
        filePath: string,
    ) {
        const stats = await fs.promises.stat(filePath);

        await this.client.fPutObject(
            bucket,
            objectName,
            filePath,
        );

        const object = await this.client.statObject(
            bucket,
            objectName,
        );

        if (object.size !== stats.size) {
            throw new Error(
                `Uploaded object size mismatch: expected ${stats.size} bytes, got ${object.size} bytes`,
            );
        }

        return {
            bucket,
            objectName,
            size: object.size,
        };
    }
    
    async deleteFile(
        bucket: string,
        objectName: string,
    ) {
        await this.client.removeObject(
            bucket,
            objectName,
        );
    }
}